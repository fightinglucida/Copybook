import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin = process.env.TEST_PAGES_ORIGIN || 'http://127.0.0.1:18477';
if (!['127.0.0.1','localhost'].includes(new URL(origin).hostname)) throw Error('Run against the local Pages emulator.');
const { resources: [a,b] } = JSON.parse(await fs.readFile(process.env.TEST_LICENSE_FIXTURES, 'utf8'));
let cookie = '';
async function get(id, expected) {
  const r = await fetch(`${origin}/api/access/resources/${id}`, { headers: cookie ? { Cookie: cookie } : {} });
  assert.equal(r.status, expected); assert.match(r.headers.get('cache-control'), /no-store/); return r.json();
}
async function unlock(item, expected = 200, source = origin) {
  const r = await fetch(`${origin}/api/access/unlock`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: source, ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify({ resource_id: item.id, code: item.code }) });
  const data = await r.json(); assert.equal(r.status, expected, JSON.stringify(data)); assert.ok(!JSON.stringify(data).includes('session_token'));
  if (r.ok) { const value = r.headers.get('set-cookie'); assert.match(value, /HttpOnly/); assert.match(value, /SameSite=Strict/); assert.match(value, /Path=\/api\/access\//); cookie = value.split(';')[0]; }
  return data;
}
await get(a.id, 401);
await unlock(a, 403, 'https://other.example');
await unlock({ ...a, code: 'LS-INVALID-TEST' }, 403);
await unlock(a);
assert.ok((await get(a.id, 200)).downloads.baidu.url);
await get(b.id, 403);
await unlock(b); await get(a.id, 200); await get(b.id, 200);
cookie = 'copybook_access=' + 'f'.repeat(64); await get(a.id, 403);
const large = await fetch(`${origin}/api/access/unlock`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ resource_id: a.id, code: 'x'.repeat(2100) }) });
assert.equal(large.status, 413);
console.log(JSON.stringify({ result: 'passed', checks: ['Pages service binding','no-cookie denied','cross-origin POST denied','invalid code denied','opaque HttpOnly session','session token absent from JSON','per-resource authorization','multiple resource grants','tampered session rejected','body size limit','private no-store responses'] }, null, 2));
