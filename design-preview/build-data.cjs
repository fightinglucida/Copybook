// Build prototype fixtures from the existing blog. This does not modify Hugo sources.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const content = path.join(root, 'content');
const files = fs.readdirSync(content).filter(name => name.endsWith('.md') && name !== '_index.md');
const posts = files.map((file, id) => {
  const raw = fs.readFileSync(path.join(content, file), 'utf8').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Unsupported front matter: ' + file);
  const field = name => (match[1].match(new RegExp('^' + name + ':\\s*(.+)$', 'm'))?.[1] || '').replace(/^["']|["']$/g, '').trim();
  const tags = [...(match[1].match(/tags:\s*\n((?:\s+-[^\n]*\n?)+)/)?.[1] || '').matchAll(/-\s+([^\n]+)/g)].map(x => x[1].trim().replace(/^["']|["']$/g, ''));
  const log = cp.execFileSync('git', ['log', '--follow', '--diff-filter=A', '--format=%aI', '--', 'content/' + file], {cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean);
  const date = field('date') || log.at(-1) || '';
  const urls = [...new Set([...raw.matchAll(/https?:\/\/(?:pan\.baidu\.com|pan\.quark\.cn)\/[^\s)\]`"<>]+/g)].map(x => x[0]))];
  const downloads = {};
  for (const provider of ['baidu', 'quark']) {
    const choices = urls.filter(url => url.includes(provider === 'baidu' ? 'pan.baidu.com' : 'pan.quark.cn'));
    const url = choices.find(url => /[?&]pwd=/.test(url)) || choices[0];
    if (url) {
      const parsed = new URL(url);
      const code = parsed.searchParams.get('pwd') || (provider === 'baidu' ? raw.match(/提取码[:：]\s*([A-Za-z0-9]{4})/)?.[1] : '') || '';
      if (code && !parsed.searchParams.has('pwd')) parsed.searchParams.set('pwd', code);
      downloads[provider] = {url:parsed.href,code};
    }
  }
  return {id:String(id),file,title:field('title'),category:field('categories') || field('category') || '其他资源',tags,date,body:match[2].trim(),downloads,link:field('link')};
}).sort((a,b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'zh-CN'));
const icons = {};
for (const file of fs.readdirSync(path.join(process.env.TEMP, 'copybook-phosphor'))) {
  const svg=fs.readFileSync(path.join(process.env.TEMP, 'copybook-phosphor', file),'utf8');
  icons[path.basename(file,'.svg')] = svg.replace(/<\?xml[^>]*>/g,'').replace('<svg ', '<svg aria-hidden="true" focusable="false" ').replace(/width="256"|height="256"/g,'');
}
fs.writeFileSync(path.join(__dirname,'preview-data.js'),'window.PREVIEW_DATA='+JSON.stringify({posts,icons})+';\n');
console.log(`Prototype fixtures: ${posts.length} real articles; ${posts.filter(p=>p.downloads.baidu&&p.downloads.quark).length} dual-provider articles.`);
