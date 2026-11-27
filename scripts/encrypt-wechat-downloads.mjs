import { randomUUID } from 'node:crypto';
import { lstatSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptDownloads } from './wechat-downloads.mjs';

const accountsDir = fileURLToPath(new URL('../content/gzh/mp_accounts/', import.meta.url));
const shareFields = { baidu: 'baidu_netdisk_url', quark: 'quark_netdisk_url' };

function readAccountJson(path) {
  const info = lstatSync(path, { throwIfNoEntry: false });
  if (!info) return {};
  if (!info.isFile()) throw new Error(`${basename(path)} 必须为普通文件。`);
  const data = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${basename(path)} 必须包含一个 JSON 对象。`);
  }
  return data;
}

function accountChanges(directory, name) {
  const backupPath = join(directory, 'downloads.json');
  const optionsPath = join(directory, 'hugo-account.json');
  const profilePath = join(directory, 'account_profile.json');
  const legacyPath = join(directory, `${name}.json`);
  const backup = readAccountJson(backupPath);
  const options = readAccountJson(optionsPath);
  const profile = readAccountJson(profilePath);
  const legacy = readAccountJson(legacyPath);
  const sources = [[profile, profilePath], [legacy.gzh_info ?? {}, legacyPath], [legacy, legacyPath]];
  const changed = new Map();
  const downloads = { ...backup };

  for (const [provider, field] of Object.entries(shareFields)) {
    let imported;
    for (const [data, path] of sources) {
      const value = data[field];
      if (value == null || value === '') continue;
      if (typeof value !== 'string') throw new Error(`${basename(path)} 的 ${field} 必须是字符串。`);
      imported ||= value.trim();
      data[field] = '';
      changed.set(path, path === profilePath ? profile : legacy);
    }
    if (!imported) continue;
    // Keep a manually configured extraction code when the share URL matches.
    const saved = downloads[provider];
    if ((typeof saved === 'string' ? saved : saved?.url) !== imported) {
      downloads[provider] = imported;
    }
  }

  const providers = ['baidu', 'quark', 'other'].filter(provider =>
    provider === 'other' ? downloads.other?.length : downloads[provider],
  );
  const alreadyEncrypted = [backup, options, profile, legacy].some(data => data.downloads_encrypted);
  if (!providers.length || (!changed.size && alreadyEncrypted)) return [];

  const sealed = encryptDownloads(downloads);
  delete downloads.downloads_encrypted;
  delete downloads.download_providers;
  return [
    [backupPath, downloads],
    [optionsPath, { ...options, downloads_encrypted: sealed, download_providers: providers }],
    ...changed,
  ];
}

function writeJson(path, data) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, { flag: 'wx' });
  try {
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

function errorMessage(error) {
  if (error.code === 'ERR_INVALID_URL') return '无法识别网盘分享地址，请检查配置文件。';
  if (error instanceof SyntaxError) return '网盘配置文件需要使用有效的 JSON 格式。';
  return error.message;
}

function encryptAccounts() {
  const updates = [];
  for (const entry of readdirSync(accountsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const files = accountChanges(join(accountsDir, entry.name), entry.name);
      if (files.length) updates.push({ name: entry.name, files });
    } catch (error) {
      throw new Error(`${entry.name}：${errorMessage(error)}`);
    }
  }

  for (const { name, files } of updates) {
    for (const [path, data] of files) writeJson(path, data);
    console.log(`已加密：${name}`);
  }
  console.log(updates.length ? `共处理 ${updates.length} 个账号。` : '没有需要加密的账号。');
}

try {
  const source = process.argv[2];
  if (source) {
    const config = JSON.parse(readFileSync(source === '-' ? 0 : source, 'utf8').replace(/^\uFEFF/, ''));
    console.log(`downloads_encrypted: "${encryptDownloads(config)}"`);
  } else {
    encryptAccounts();
  }
} catch (error) {
  console.error(errorMessage(error));
  process.exitCode = 1;
}
