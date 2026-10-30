import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const out = path.resolve(process.argv[2] || 'public');
const walk = p => fs.readdirSync(p,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(p,e.name)) : [path.join(p,e.name)]);
const files = walk(out).filter(f => /\.(html|json|xml|js)$/.test(f));
let paidPages = 0;
const privateMarkers = process.env.PRIVATE_RESOURCE_CONFIG ? JSON.parse(fs.readFileSync(process.env.PRIVATE_RESOURCE_CONFIG,'utf8')).flatMap(r => Object.values(r.downloads).map(d => new URL(d.url).pathname.split('/').pop())) : [];
for (const file of files) {
  const text = fs.readFileSync(file,'utf8');
  if (file.endsWith('.html') && text.includes('class="download-section paid-resource"')) {
    paidPages++; assert.ok(!/https?:\/\/(?:pan\.baidu\.com|pan\.quark\.cn)\//i.test(text), `Exposed share URL in ${path.relative(out,file)}`);
    assert.ok(text.includes('data-resource-id='));
  }
  for (const marker of privateMarkers) assert.ok(!text.includes(marker), `Private resource appeared in public output: ${path.relative(out,file)}`);
}
assert.ok(paidPages>0, 'Expected at least one gated resource page');
console.log(JSON.stringify({ result:'passed', paidPages, publicFilesScanned:files.length, privateLinksExcluded:privateMarkers.length }));
