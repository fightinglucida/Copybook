import { execFileSync } from 'node:child_process';
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const providers = {
  baidu: { name: '百度网盘', host: 'pan.baidu.com' },
  quark: { name: '夸克网盘', host: 'pan.quark.cn' },
  other: { name: '其他网盘' },
};

function normalizeDownload(provider, entry) {
  const config = providers[provider];
  const url = new URL(typeof entry === 'string' ? entry : entry.url);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('网盘链接必须是完整的 HTTP 或 HTTPS 分享地址。');
  }
  if (config.host && url.host !== config.host) throw new Error(`${config.name}链接应使用 ${config.host}。`);
  if (entry.code != null && typeof entry.code !== 'string') throw new Error('网盘提取码必须用字符串填写。');
  const code = entry.code?.trim() || (config.host ? url.searchParams.get('pwd') || '' : '');
  const name = provider === 'other' ? entry.name?.trim() || config.name : config.name;
  return { provider, name, url: url.href, code };
}

let configuredPassword;

export function readDownloadPassword() {
  if (configuredPassword === undefined) {
    let config;
    try {
      const output = execFileSync('hugo', ['config', '--format', 'json', '--environment', 'production', '--quiet'], {
        cwd: fileURLToPath(new URL('../', import.meta.url)),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });
      config = JSON.parse(output);
    } catch {
      throw new Error('无法读取 Hugo 配置，请确认 Hugo 可运行且 config.toml 格式正确。');
    }
    const password = config.params?.wechat_benchmark?.download_password;
    if (password != null && typeof password !== 'string') {
      throw new Error('config.toml 中的 download_password 必须用引号括起来。');
    }
    configuredPassword = password || '';
  }
  return configuredPassword || process.env.WECHAT_BENCHMARK_PASSWORD;
}

export function encryptDownloads(config, password = readDownloadPassword()) {
  if (!password) throw new Error('请在 config.toml 设置 download_password，或设置 WECHAT_BENCHMARK_PASSWORD 环境变量。');
  const downloads = [];
  for (const provider of ['baidu', 'quark']) {
    if (config[provider]) downloads.push(normalizeDownload(provider, config[provider]));
  }
  for (const item of config.other || []) downloads.push(normalizeDownload('other', item));
  if (!downloads.length) throw new Error('至少配置一个网盘。');

  // Keep this format in sync with decryptDownloads in the browser. GCM appends a 16-byte tag.
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = pbkdf2Sync(password, salt, 600000, 32, 'sha256');
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const payload = Buffer.concat([cipher.update(JSON.stringify(downloads), 'utf8'), cipher.final(), cipher.getAuthTag()]);
  return `v1.${[salt, iv, payload].map(value => value.toString('base64')).join('.')}`;
}
