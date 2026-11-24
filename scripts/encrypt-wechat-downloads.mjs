import { readFileSync } from 'node:fs';
import { encryptDownloads } from './wechat-downloads.mjs';

try {
  const source = process.argv[2];
  if (!source) throw new Error('请提供网盘配置文件。');
  const config = JSON.parse(readFileSync(source === '-' ? 0 : source, 'utf8').replace(/^\uFEFF/, ''));
  const encrypted = encryptDownloads(config);
  console.log(`downloads_encrypted: "${encrypted}"`);
} catch (error) {
  if (error.code === 'ERR_INVALID_URL') console.error('无法识别网盘分享地址，请检查配置文件。');
  else if (error instanceof SyntaxError) console.error('网盘配置文件需要使用有效的 JSON 格式。');
  else console.error(error.message);
  process.exitCode = 1;
}
