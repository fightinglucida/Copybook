import { createHash } from 'node:crypto';
import {
  copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync,
  realpathSync, renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { encryptDownloads } from './wechat-downloads.mjs';
import { openAccountMetrics, summarizeAccount } from './wechat-account-metrics.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'content', 'gzh', 'mp_accounts');
const outputParent = join(root, '.local');
const output = join(outputParent, 'wechat-accounts');
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);
const imageLink = /(!\[[^\]\n]*\]\()(?:(<[^>\n]+>)|([^\n]*?\.(?:jpe?g|png|gif|webp|avif)))(?=\s*(?:["']|\)))/gi;

const text = value => typeof value === 'string' ? value.trim() : '';
const nameKey = value => text(value).normalize('NFKC').toLowerCase();
const titleKey = value => nameKey(value).replace(/[^\p{L}\p{N}]/gu, '');
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 24);
const escapeShortcodes = value => value.replace(/\{\{(?=[<%])/g, '&#123;&#123;');
const readText = path => readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
const entries = path => existsSync(path) ? readdirSync(path, { withFileTypes: true }) : [];
const files = path => entries(path).filter(entry => entry.isFile()).map(entry => join(path, entry.name));
const readJson = path => existsSync(path) && lstatSync(path).isFile() ? JSON.parse(readText(path)) : {};

function avatarUrl(value) {
  try {
    const url = new URL(text(value));
    if (url.protocol === 'https:' && !url.username && !url.password && /(?:^|\.)(?:qpic\.cn|qlogo\.cn)$/.test(url.hostname)) return url.href;
  } catch { /* Use the initial when the export has no usable avatar. */ }
  return '';
}

function splitMarkdown(markdown) {
  const frontMatter = /^---\r?\n([\s\S]*?)\r?\n---\s*\n/.exec(markdown);
  return frontMatter
    ? { params: parseYaml(frontMatter[1]) || {}, body: markdown.slice(frontMatter[0].length) }
    : { params: {}, body: markdown };
}

function dateOf(value) {
  const match = /^(\d{4})[-/]?(\d{2})[-/]?(\d{2})/.exec(text(value));
  if (!match) return '';
  const day = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${day}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().startsWith(day) ? day : '';
}

function wechatUrl(value) {
  try {
    const url = new URL(text(value));
    if (url.protocol === 'https:' && url.host === 'mp.weixin.qq.com' && !url.username && !url.password && /^\/s(?:\/|$)/.test(url.pathname)) return url.href;
  } catch { /* Some archive entries have no original link. */ }
  return '';
}

function linkKey(value) {
  if (!value) return '';
  const url = new URL(value);
  const identity = ['__biz', 'mid', 'idx'].map(key => url.searchParams.get(key));
  return identity.every(Boolean) ? identity.join('/') : url.href;
}

function dataCount(value) {
  const match = /^(\d+(?:\.\d+)?)(万)?\+?$/.exec(String(value ?? '').replace(/[\s,]/g, ''));
  return match ? Number(match[1]) * (match[2] ? 10000 : 1) : undefined;
}

function readArticleCsv(path) {
  const rows = [[]];
  const source = readText(path);
  const cell = /(?:"((?:[^"]|"")*)"|([^,\r\n"]*))(,|\r\n|\n|\r|$)/gy;
  let offset = 0;
  while (offset < source.length) {
    const match = cell.exec(source);
    if (!match) throw new Error(`无法读取 CSV 第 ${rows.length} 行：${basename(path)}`);
    rows.at(-1).push(match[1]?.replace(/""/g, '"') ?? match[2]);
    offset = cell.lastIndex;
    if (match[3] === ',' && offset === source.length) rows.at(-1).push('');
    if (match[3] !== ',') rows.push([]);
  }
  const [headers, ...records] = rows;
  const fields = { 标题: 'title', 发布日期: 'date', 链接: 'source_url', 摘要: 'digest', 阅读量: 'read_count', 点赞量: 'like_count' };
  return records.map(row => Object.fromEntries(headers.flatMap((field, i) => fields[field] ? [[fields[field], row[i]]] : [])));
}

function inside(parent, path) {
  const name = relative(parent, path);
  return Boolean(name) && name !== '..' && !name.startsWith(`..${sep}`) && !isAbsolute(name);
}

function copyImage(account, path, stage, name = '') {
  const extension = extname(path).toLowerCase();
  if (!imageExtensions.has(extension) || !inside(account, path) || !existsSync(path) || !lstatSync(path).isFile()) return '';
  const absolute = realpathSync(path);
  if (!inside(realpathSync(account), absolute)) return '';
  const target = `${name || digest(relative(account, path).split(sep).join('/'))}${extension}`;
  const folder = digest(nameKey(basename(account)));
  const media = join(stage, 'media', folder);
  mkdirSync(media, { recursive: true });
  if (!existsSync(join(media, target))) copyFileSync(absolute, join(media, target));
  return `/gzh-media/${folder}/${target}`;
}

function prepareBody(file, body, account, stage) {
  return body.replace(imageLink, (match, prefix, angle, plain) => {
    const target = (angle ? angle.slice(1, -1) : plain).trim();
    if (/^[a-z][\w+.-]*:|^\/|^#/.test(target)) return match;
    const exact = resolve(dirname(file), target);
    let path = exact;
    if (!existsSync(exact)) {
      try { path = resolve(dirname(file), decodeURIComponent(target)); } catch { return match; }
    }
    const url = copyImage(account, path, stage);
    return url ? `${prefix}${url}` : match;
  });
}

function articleFromFile(file, account, stage) {
  const { params, body } = splitMarkdown(readText(file));
  const heading = /^\s*#\s+([^\r\n]+)\r?\n/.exec(body);
  const filename = basename(file, extname(file));
  const title = text(params.title) || text(heading?.[1]) || filename.replace(/^\d{8,14}-/, '');
  const folderDate = dirname(file) === account ? '' : dateOf(basename(dirname(file)));
  const date = dateOf(params.date ?? params.publish_time) || dateOf(filename) || folderDate;
  const sourceUrl = wechatUrl(params.source_url ?? params.content_url);
  const markdown = escapeShortcodes(prepareBody(file, heading ? body.slice(heading[0].length) : body, account, stage)).trim();
  const key = digest(`${basename(account)}/${relative(account, file).split(sep).join('/')}`);
  const result = { title, date, source_url: sourceUrl, archive_key: key };
  if (markdown) {
    writeFileSync(join(stage, 'articles', `${key}.md`), markdown);
    result.body = key;
  }
  return result;
}

function articleFromIndex(row) {
  return {
    title: text(row.title),
    date: dateOf(row.date || row.publish_date || row.publish_time),
    source_url: wechatUrl(row.source_url || row.content_url || row.url || row.link),
    preview: escapeShortcodes(text(row.preview || row.digest)),
    read_count: dataCount(row.read_count),
    like_count: dataCount(row.like_count),
    read_count_text: /^[\d.,万亿+]+$/.test(text(row.read_count_text)) ? text(row.read_count_text) : undefined,
    like_count_text: /^[\d.,万亿+]+$/.test(text(row.like_count_text)) ? text(row.like_count_text) : undefined,
  };
}

function mergeArticles(local, indexed, metrics) {
  const articles = [];
  const indexes = new Map();
  function keys(article) {
    const identity = linkKey(article.source_url);
    const title = titleKey(article.title);
    return [identity && `link:${identity}`, article.archive_key && `archive:${article.archive_key}`, title && `title:${article.date}:${title}`].filter(Boolean);
  }
  for (const article of [...local, ...indexed]) {
    if (!article.title) continue;
    const aliases = keys(article);
    const position = aliases.map(key => indexes.get(key)).find(index => index !== undefined) ?? articles.length;
    const previous = articles[position] || {};
    if (previous.source_url && article.source_url && linkKey(previous.source_url) !== linkKey(article.source_url)) {
      indexes.set(`link:${linkKey(article.source_url)}`, articles.length);
      articles.push(article);
      continue;
    }
    articles[position] = { ...previous, ...Object.fromEntries(Object.entries(article).filter(([, value]) => value !== '' && value !== undefined)) };
    for (const key of aliases) indexes.set(key, position);
  }
  for (const { title, date, source_url, archive_key, preview, ...counts } of metrics || []) {
    const position = keys({ title, date, source_url, archive_key }).map(key => indexes.get(key)).find(index => index !== undefined);
    if (position === undefined) continue;
    const article = articles[position];
    if (article.source_url && source_url && linkKey(article.source_url) !== linkKey(source_url) && article.archive_key !== archive_key) continue;
    article.source_url ||= source_url;
    for (const [field, value] of Object.entries(counts)) {
      if (value !== undefined) article[field] = value;
    }
  }
  return articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function readDownloads(account, profile, legacy, options) {
  const config = readJson(join(account, 'downloads.json'));
  const sealedConfig = [config, options, profile, legacy].find(item => text(item.downloads_encrypted));
  if (sealedConfig) {
    const sealed = text(sealedConfig.downloads_encrypted);
    if (!/^v1(?:\.[\w+/]+={0,2}){3}$/.test(sealed)) throw new Error('downloads_encrypted 格式错误。');
    const providers = Array.isArray(sealedConfig.download_providers)
      ? [...new Set(sealedConfig.download_providers)].filter(provider => ['baidu', 'quark', 'other'].includes(provider))
      : [];
    return {
      downloads_encrypted: sealed,
      ...(providers.length && { download_providers: providers }),
    };
  }
  const profileUrl = field => Object.hasOwn(profile, field)
    ? text(profile[field])
    : text(legacy.gzh_info?.[field]) || text(legacy[field]);
  const baidu = config.baidu || profileUrl('baidu_netdisk_url');
  const quark = config.quark || profileUrl('quark_netdisk_url');
  const other = config.other || [];
  const available = { baidu, quark, other: other.length };
  const providers = Object.keys(available).filter(provider => available[provider]);
  if (!providers.length) return {};
  return {
    downloads_encrypted: encryptDownloads({ baidu, quark, other }),
    download_providers: providers,
  };
}

function readAccountFiles(account) {
  const profile = readJson(join(account, 'account_profile.json'));
  const legacy = readJson(join(account, `${basename(account)}.json`));
  const title = text(profile.account_name || legacy.gzh_name || legacy.gzh_info?.name) || basename(account);
  return { profile, legacy, title };
}

function readAccount(account, stage, database) {
  const filesAtRoot = files(account);
  const { profile, legacy, title } = readAccountFiles(account);
  const options = readJson(join(account, 'hugo-account.json'));
  const trend = readJson(join(account, 'read_trend_30d.json'));
  const folder = basename(account);
  const savedMetrics = readJson(join(account, 'account_metrics.json'));
  const snapshot = Array.isArray(savedMetrics.articles) ? savedMetrics : database?.read(title, folder) || savedMetrics;
  const avatar = filesAtRoot.find(file => /^avatar\./i.test(basename(file)) && imageExtensions.has(extname(file).toLowerCase()));
  const markdown = filesAtRoot.filter(file => extname(file).toLowerCase() === '.md');
  for (const entry of entries(account).filter(entry => entry.isDirectory())) {
    const folder = join(account, entry.name);
    markdown.push(...files(folder).filter(file => extname(file).toLowerCase() === '.md'));
  }

  const local = markdown.sort().map(file => articleFromFile(file, account, stage));
  const indexed = Array.isArray(legacy.articles) ? [...legacy.articles] : [];
  for (const file of filesAtRoot.filter(file => basename(file).endsWith('-阅读数据分析.csv'))) indexed.push(...readArticleCsv(file));
  const selectedArticles = readJson(join(account, 'articles.json'));
  if (Array.isArray(selectedArticles)) indexed.push(...selectedArticles);
  const snapshotArticles = Array.isArray(snapshot.articles)
    ? snapshot.articles.map(row => ({
      ...articleFromIndex(row), archive_key: row.archive_path ? digest(`${folder}/${row.archive_path}`) : undefined,
    })).filter(article => article.title)
    : undefined;
  const articles = mergeArticles(local, indexed.map(articleFromIndex), snapshotArticles);
  const downloads = readDownloads(account, profile, legacy, options);
  const dates = articles.map(article => article.date).filter(Boolean).sort();
  const image = (avatar && copyImage(account, avatar, stage, 'avatar')) || avatarUrl(profile.avatar_url || legacy.gzh_info?.avatar_url);
  const signature = text(profile.signature || legacy.gzh_info?.signature);
  const category = text(options.topic || profile.category || legacy.gzh_info?.category);
  const labels = options.labels || profile.account_tags || legacy.gzh_info?.account_tags;
  const trendData = dateOf(trend.date_to) ? {
    from: dateOf(trend.date_from), to: dateOf(trend.date_to), reads: dataCount(trend.total_reads),
    articles: dataCount(trend.article_count), read_coverage: dataCount(trend.metric_count),
    points: Array.isArray(trend.points) ? trend.points.map(point => ({
      date: dateOf(point.date), reads: dataCount(point.read_count),
      articles: dataCount(point.article_count), read_coverage: dataCount(point.metric_count),
    })) : [],
  } : undefined;
  const metrics = summarizeAccount(snapshotArticles || articles, trendData, articles.length, Boolean(snapshotArticles));
  const originalCount = dataCount(snapshot.account?.original_article_count ?? profile.original_article_count);
  const lastCollected = text(snapshot.account?.last_collected_at || profile.last_collected_at);
  if (originalCount !== undefined) metrics.original_articles = originalCount;
  if (lastCollected && Number.isFinite(Date.parse(lastCollected))) metrics.last_collected = new Date(lastCollected).toISOString();
  const data = {
    ...(image && { avatar: image }),
    ...(signature && { description: signature }),
    ...(category && { topic: category }),
    ...(Array.isArray(labels) && { labels: labels.map(text).filter(Boolean) }),
    ...downloads,
    ...(dates.length && { archive_from: dates[0], archive_to: dates.at(-1) }),
    account_metrics: metrics,
    ...(text(options.avatar_text) && { avatar_text: text(options.avatar_text) }),
    archive_count: articles.length,
    articles: articles.map(({ archive_key, ...article }) => article),
  };
  const slug = text(options.slug) || `account-${digest(nameKey(folder))}`;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === 'page') throw new Error('账号页面路径无效。');
  const frontMatter = {
    title,
    date: dates.at(-1) || dateOf(profile.updated_at || legacy.last_update_time) || undefined,
    description: signature,
    outputs: ['HTML'],
    weight: Number.isInteger(options.weight) ? options.weight : 1000,
  };
  return { slug, data, frontMatter };
}

function exportMetrics(accounts, database) {
  if (!database) throw new Error('需要采集数据库才能导出账号统计。');
  let count = 0;
  for (const account of accounts) {
    const { title } = readAccountFiles(account);
    const metrics = database.read(title, basename(account));
    if (!metrics) continue;
    const target = join(account, 'account_metrics.json');
    const temp = `${target}.${process.pid}.tmp`;
    try {
      writeFileSync(temp, `${JSON.stringify(metrics, null, 2)}\n`, { flag: 'wx' });
      renameSync(temp, target);
    } finally {
      if (existsSync(temp)) rmSync(temp);
    }
    count++;
  }
  console.log(`公众号目录：已导出 ${count} 个账号的统计数据。`);
}

function importAccounts(accounts, database) {
  if (existsSync(outputParent) && realpathSync(outputParent) !== resolve(realpathSync(root), '.local')) {
    throw new Error('.local 需要位于项目目录内。');
  }
  mkdirSync(outputParent, { recursive: true });
  if (existsSync(output) && realpathSync(output) !== output) throw new Error('导入产物目录异常。');
  const stage = mkdtempSync(join(outputParent, 'wechat-accounts-stage-'));
  const backup = `${stage}-previous`;
  try {
    for (const folder of ['content', 'articles', 'media', 'data']) mkdirSync(join(stage, folder));
    const manifest = Object.create(null);
    const titles = new Set();
    for (const account of accounts) {
      try {
        const { slug, data, frontMatter } = readAccount(account, stage, database);
        const title = nameKey(frontMatter.title);
        if (manifest[slug] || titles.has(title)) throw new Error('发现同名账号或重复的账号页面路径。');
        titles.add(title);
        writeFileSync(join(stage, 'content', `${slug}.md`), `${JSON.stringify(frontMatter, null, 2)}\n`);
        manifest[slug] = data;
      } catch (error) {
        // A URL validation error can contain the unencrypted share link in error.input.
        const message = error.code === 'ERR_INVALID_URL' ? '网盘分享地址无效。' : error.message;
        throw new Error(`${basename(account)}：${message}`);
      }
    }
    writeFileSync(join(stage, 'data', 'wechat_accounts.json'), JSON.stringify(manifest));
    if (existsSync(output)) renameSync(output, backup);
    try {
      renameSync(stage, output);
    } catch (error) {
      if (existsSync(backup)) renameSync(backup, output);
      throw error;
    }
    if (existsSync(backup) && inside(outputParent, realpathSync(backup))) rmSync(backup, { recursive: true, force: true });
    console.log(`公众号目录：已整理 ${Object.keys(manifest).length} 个账号。`);
  } finally {
    if (existsSync(stage) && inside(outputParent, realpathSync(stage))) rmSync(stage, { recursive: true, force: true });
  }
}

let database;
try {
  const accounts = entries(source).filter(entry => entry.isDirectory()).map(entry => join(source, entry.name));
  const exportRequested = process.argv.includes('--snapshot-metrics');
  if (accounts.length || exportRequested) database = await openAccountMetrics(root);
  if (exportRequested) exportMetrics(accounts, database);
  else importAccounts(accounts, database);
} catch (error) {
  console.error(`公众号目录导入失败：${error.message}`);
  process.exitCode = 1;
} finally {
  database?.close();
}
