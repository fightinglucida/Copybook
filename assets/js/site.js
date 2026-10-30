(() => {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const rail = document.getElementById('category-navigation');
  const menu = document.querySelector('.menu-toggle');
  let entries;
  let pending;
  function hideSearch() { results.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  function message(text, retry = false) {
    results.replaceChildren();
    const box = document.createElement('div'); box.className = 'search-empty'; box.textContent = text;
    if (retry) { const button = document.createElement('button'); button.type = 'button'; button.className = 'search-retry'; button.textContent = '重新加载'; button.addEventListener('click', search); box.append(document.createElement('br'), button); }
    results.append(box); results.hidden = false; input.setAttribute('aria-expanded', 'true');
  }
  async function load() {
    if (entries) return entries;
    if (!pending) pending = fetch(input.dataset.indexUrl).then(r => { if (!r.ok) throw Error(r.status); return r.json(); }).then(data => { entries = data; return data; }).finally(() => { pending = null; });
    return pending;
  }
  async function search() {
    const query = input.value.trim().toLocaleLowerCase();
    if (!query) { hideSearch(); return; }
    if (!entries) message('正在加载资源索引…');
    try {
      const data = await load();
      if (query !== input.value.trim().toLocaleLowerCase()) return;
      const words = query.split(/\s+/);
      const found = data.map(item => {
        const title = item.title.toLocaleLowerCase();
        const meta = [item.categories, item.tags].flat().join(' ').toLocaleLowerCase();
        const body = (item.contents || '').toLocaleLowerCase();
        const score = words.every(w => (title + ' ' + meta + ' ' + body).includes(w)) ? words.reduce((s,w) => s + (title.includes(w) ? 8 : 0) + (meta.includes(w) ? 3 : 0) + 1, 0) : 0;
        return {item, score};
      }).filter(x => x.score).sort((a,b) => b.score - a.score).slice(0,10);
      if (!found.length) { message('没有找到相关资源，试试其他关键词。'); return; }
      results.replaceChildren();
      found.forEach(({item}) => { const a = document.createElement('a'); a.className='search-result'; a.href=item.permalink; a.textContent=item.title; const small=document.createElement('small'); small.textContent=[Array.isArray(item.categories)?item.categories.join(' / '):item.categories,item.date].filter(Boolean).join(' · ');a.append(small);results.append(a); });
      results.hidden=false;input.setAttribute('aria-expanded','true');
    } catch { if (input.value.trim()) message('资源索引加载失败，请重试。',true); }
  }
  let debounce;
  input.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(search,150);});
  input.addEventListener('focus',()=>{load().catch(()=>{});if(input.value)search();});
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){hideSearch();input.blur();}if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('a')?.focus();}if(e.key==='Enter'&&!results.hidden){results.querySelector('a')?.click();}});
  results.addEventListener('keydown',e=>{const links=[...results.querySelectorAll('a')];const i=links.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();links[Math.min(i+1,links.length-1)]?.focus();}if(e.key==='ArrowUp'){e.preventDefault();if(i<=0)input.focus();else links[i-1].focus();}});
  const closeMenu=()=>{rail.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','打开分类导航');};
  menu.addEventListener('click',()=>{const open=rail.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'关闭分类导航':'打开分类导航');});
  const viewer=document.querySelector('.image-viewer');
  document.querySelector('.image-viewer-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close();});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable){e.preventDefault();input.focus();}if(e.key==='Escape'){hideSearch();closeMenu();}if((e.key==='Enter'||e.key===' ')&&e.target.matches('img[data-image-view]')){e.preventDefault();e.target.click();}});
  let toastTimer;
  document.addEventListener('click',async e=>{
    if(!e.target.closest('.search-wrap'))hideSearch();
    const copy=e.target.closest('[data-copy]');
    if(copy){try{await navigator.clipboard.writeText(copy.dataset.copy);const toast=document.querySelector('.toast');toast.textContent='提取码已复制';toast.hidden=false;copy.textContent='已复制';clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true;copy.textContent='复制提取码';},2000);}catch{copy.textContent='请手动复制提取码';}}
    const button=e.target.closest('[data-image-view]');
    if(button){const image=button.matches('img')?button:button.querySelector('img');const target=viewer.querySelector('img');target.src=button.dataset.imageView;target.alt=image?.alt||'正文图片';viewer.querySelector('figcaption').textContent=button.closest('figure')?.querySelector('figcaption')?.textContent||image?.alt||'';viewer.showModal();}
  });
  document.addEventListener('error',e=>{if(e.target.tagName!=='IMG'||!e.target.closest('.article-figure'))return;const figure=e.target.closest('figure');if(figure.querySelector('.image-error-message'))return;figure.querySelector('.article-image-button').hidden=true;const note=document.createElement('div');note.className='image-error-message';note.textContent='图片暂时无法加载';figure.prepend(note);},{capture:true});
})();
