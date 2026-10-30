(() => {
  const root = document.querySelector('.paid-resource');
  if (!root) return;
  const resourceId = root.dataset.resourceId;
  const locked = root.querySelector('.paid-lock-panel');
  const unlocked = root.querySelector('.paid-unlocked');
  const form = root.querySelector('form');
  const input = form.querySelector('input');
  const button = form.querySelector('button');
  const message = root.querySelector('.activation-message');
  const grid = unlocked.querySelector('.download-grid');
  let pending = false;
  const node = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text) el.textContent = text; return el; };
  function relock(text, error = false) {
    unlocked.hidden = true; locked.hidden = false; grid.replaceChildren();
    message.textContent = text; message.classList.toggle('is-error', error);
  }
  function showDownloads(data) {
    grid.replaceChildren();
    for (const provider of ['baidu', 'quark']) {
      const value = data.downloads?.[provider];
      if (!value) continue;
      const name = provider === 'baidu' ? '百度网盘' : '夸克网盘';
      const url = new URL(value.url);
      if (url.protocol !== 'https:' || url.hostname !== (provider === 'baidu' ? 'pan.baidu.com' : 'pan.quark.cn')) throw Error('下载地址暂不可用，请联系卖家。');
      const logo = provider === 'baidu' ? '/images/brands/baidu-pan.ico' : '/images/brands/quark-pan.png';
      const card = node('div', 'download-card'); const heading = node('div', 'provider-heading');
      const icon = node('span', `provider-logo ${provider}`); const img = node('img', 'provider-brand-image'); img.src = logo; img.alt = ''; img.width = 28; img.height = 28; icon.append(img);
      const title = node('div'); title.append(node('strong', '', name), node('small', '', '授权验证通过')); heading.append(icon, title);
      const link = node('a', `download-button ${provider}`, `前往${name} ↗`); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const linkLogo = node('img', 'download-brand-logo'); linkLogo.src = logo; linkLogo.alt = ''; linkLogo.width = 17; linkLogo.height = 17; link.prepend(linkLogo);
      const extraction = node('div', 'extraction-row');
      if (value.code) { const code = node('span', '', '提取码 '); code.append(node('code', '', value.code)); const copy = node('button', 'copy-code', '复制提取码'); copy.type = 'button'; copy.dataset.copy = value.code; copy.setAttribute('aria-label', `复制${name}提取码`); extraction.append(code, copy); }
      else extraction.append(node('span', '', '未附提取码'));
      card.append(heading, link, extraction); grid.append(card);
    }
    if (!grid.children.length) throw Error('下载地址暂不可用，请联系卖家。');
    unlocked.querySelector('.license-expiry').textContent = data.license_expires_at ? `有效期至 ${new Date(data.license_expires_at).toLocaleDateString('zh-CN')}` : '永久授权';
    locked.hidden = true; unlocked.hidden = false;
  }
  async function checkAccess() {
    try {
      const response = await fetch(`/api/access/resources/${encodeURIComponent(resourceId)}`, { cache: 'no-store', credentials: 'same-origin' });
      const data = await response.json();
      if (!response.ok) { relock([401,403].includes(response.status) ? '请输入本资源的激活码。' : (data.error?.message || '授权服务暂不可用，请稍后重试。'), ![401,403].includes(response.status)); return false; }
      showDownloads(data); return true;
    } catch (error) { relock(error.message?.includes('下载地址') ? error.message : '无法连接授权服务，请稍后重试。', true); return false; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (pending) return;
    const code = input.value.trim(); if (!code) { input.focus(); return; }
    pending = true; button.disabled = true; button.textContent = '正在验证…'; input.readOnly = true; message.textContent = '正在验证激活码…'; message.classList.remove('is-error');
    try {
      const response = await fetch('/api/access/unlock', { method: 'POST', cache: 'no-store', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource_id: resourceId, code }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error?.message || '激活码验证失败，请重试。');
      input.value = ''; await checkAccess();
    } catch (error) { relock(error.message || '无法连接授权服务，请稍后重试。', true); }
    finally { pending = false; button.disabled = false; button.textContent = '验证并解锁'; input.readOnly = false; }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !pending) void checkAccess(); });
  void checkAccess();
})();
