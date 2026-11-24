(() => {
  function renderCatalogCard(template, data) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.href = data.href;
    const title = card.querySelector('h2');
    title.textContent = data.title;
    title.title = data.title;
    const topic = card.querySelector('.benchmark-card-topic');
    topic.textContent = data.topic;
    topic.hidden = !data.topic;
    const description = card.querySelector('.benchmark-card-description');
    description.textContent = data.description;
    description.title = data.description;
    description.hidden = !data.description;
    const avatar = card.querySelector('.benchmark-avatar');
    avatar.dataset.tone = data.avatarTone;
    const image = avatar.querySelector('img');
    const initials = avatar.querySelector('span');
    if (data.avatar) image.src = data.avatar;
    image.hidden = !data.avatar;
    initials.textContent = data.avatarText;
    initials.hidden = Boolean(data.avatar);
    card.querySelector('.benchmark-card-footer strong').textContent = data.count;
    card.querySelector('[data-benchmark-card-download]').hidden = !data.downloadable;
    const readable = card.querySelector('[data-benchmark-card-readable]');
    readable.textContent = `${data.readable} 篇可读`;
    readable.hidden = data.downloadable;
    return card;
  }

  function setupCatalog(catalog) {
    const { indexUrl } = catalog.dataset;
    if (!indexUrl) return;
    const pageSize = Number(catalog.dataset.pageSize);
    const filters = catalog.querySelector('[data-benchmark-filters]');
    const grid = catalog.querySelector('[data-benchmark-grid]');
    const template = catalog.querySelector('[data-benchmark-card-template]');
    const search = filters.querySelector('[data-benchmark-search]');
    const availability = filters.querySelector('[data-benchmark-availability]');
    const sort = filters.querySelector('[data-benchmark-sort]');
    const results = catalog.querySelector('[data-benchmark-results]');
    const retry = catalog.querySelector('[data-benchmark-index-retry]');
    const empty = catalog.querySelector('[data-benchmark-empty]');
    const staticPagination = catalog.querySelector('[data-benchmark-static-pagination]');
    const filteredPagination = catalog.querySelector('[data-benchmark-filtered-pagination]');
    const pageInfo = filteredPagination.querySelector('[data-benchmark-page-info]');
    const previous = filteredPagination.querySelector('[data-benchmark-prev]');
    const next = filteredPagination.querySelector('[data-benchmark-next]');
    let index;
    let loading = false;
    let matches = [];
    let page = 1;

    function displayPage(number) {
      page = number;
      const start = (page - 1) * pageSize;
      grid.replaceChildren(...matches.slice(start, start + pageSize).map(data => renderCatalogCard(template, data)));
      const pages = Math.ceil(matches.length / pageSize);
      const position = `第 ${page} / ${pages} 页`;
      results.textContent = `${matches.length} 个账号${pages > 1 ? ` · ${position}` : ''}`;
      empty.hidden = matches.length > 0;
      staticPagination.hidden = true;
      filteredPagination.hidden = pages <= 1;
      pageInfo.textContent = pages > 1 ? position : '';
      previous.disabled = page <= 1;
      next.disabled = page >= pages;
    }

    async function updateMatches() {
      if (loading) return;
      if (!index) {
        loading = true;
        retry.hidden = true;
        results.textContent = '正在加载账号索引…';
        try {
          const response = await fetch(indexUrl, { mode: 'same-origin' });
          if (!response.ok) throw new Error('Catalog index unavailable');
          const cards = await response.json();
          index = cards.map(card => ({
            ...card,
            text: [card.title, card.topic, card.description, ...card.labels,
              `${card.count} 篇收录`, card.downloadable ? '可下载' : `${card.readable} 篇可读`].join(' ').toLocaleLowerCase(),
          }));
        } catch {
          results.textContent = '账号筛选加载失败。';
          retry.hidden = false;
          return;
        } finally {
          loading = false;
        }
      }

      const topic = filters.querySelector('[data-topic][aria-pressed="true"]').dataset.topic;
      const label = filters.querySelector('[data-label][aria-pressed="true"]').dataset.label;
      const download = availability.value;
      const words = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
      matches = index.filter(card =>
        (!topic || card.topic === topic) &&
        (!label || card.labels.includes(label)) &&
        (!download || card.downloadable === (download === 'available')) &&
        words.every(word => card.text.includes(word))
      );
      if (sort.value === 'count') matches.sort((a, b) => b.count - a.count);
      if (sort.value === 'date') matches.sort((a, b) => b.date.localeCompare(a.date));
      displayPage(1);
    }

    function goToPage(number) {
      displayPage(number);
      results.focus();
    }

    filters.addEventListener('click', event => {
      const button = event.target.closest('button[data-topic], button[data-label]');
      if (!button) return;
      button.closest('[role="group"]').querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      updateMatches();
    });
    search.addEventListener('input', updateMatches);
    availability.addEventListener('change', updateMatches);
    sort.addEventListener('change', updateMatches);
    retry.addEventListener('click', updateMatches);
    previous.addEventListener('click', () => goToPage(page - 1));
    next.addEventListener('click', () => goToPage(page + 1));
    filters.hidden = false;
  }

  function setupAccountDialogs(catalog, dialog) {
    const loading = dialog.querySelector('[data-benchmark-loading]').content;
    let activeRequest;
    let openedFrom;

    async function loadAccount(card) {
      const request = new AbortController();
      activeRequest = request;
      dialog.replaceChildren(loading.cloneNode(true));
      dialog.querySelector('h2').textContent = card.querySelector('h2').textContent;
      const status = dialog.querySelector('[role="status"]');
      const retry = dialog.querySelector('[data-benchmark-retry]');
      retry.addEventListener('click', () => loadAccount(card));
      if (!dialog.open) dialog.showModal();
      else dialog.querySelector('.benchmark-close').focus();

      const page = document.createElement('template');
      let reader;
      try {
        const response = await fetch(card.href, { signal: request.signal, mode: 'same-origin' });
        if (!response.ok) throw new Error('Account page unavailable');
        const html = await response.text();
        if (request.signal.aborted || !dialog.open) return;
        page.innerHTML = html;
        reader = page.content.querySelector('[data-benchmark-reading-dialog]');
        if (!reader) throw new Error('Account reader missing');
      } catch {
        if (request.signal.aborted || !dialog.open) return;
        status.textContent = '账号资料加载失败，请重试。';
        retry.hidden = false;
        return;
      }

      const articles = [...page.content.querySelectorAll('[data-benchmark-article]')];
      dialog.replaceChildren(...reader.children);
      if (articles.length) {
        const renderReading = createReader(dialog);
        renderReading(articles[0]);
        bindArticleOptions(dialog, articles, renderReading);
      }
      setupProfileToggle(dialog);
      const downloadDialog = page.content.querySelector('[data-benchmark-dialog]');
      if (downloadDialog) {
        dialog.append(downloadDialog);
        setupDownloadDialog(downloadDialog, page.content.querySelector('#benchmark-download-template'), dialog);
      }
      dialog.querySelector('.benchmark-close').focus();
    }

    for (const card of catalog.querySelectorAll('[data-benchmark-card]')) {
      card.setAttribute('aria-haspopup', 'dialog');
    }
    catalog.querySelector('[data-benchmark-card-template]').content.firstElementChild.setAttribute('aria-haspopup', 'dialog');
    catalog.addEventListener('click', event => {
      const card = event.target.closest('[data-benchmark-card]');
      if (!card || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openedFrom = card;
      loadAccount(card);
    });
    dialog.addEventListener('close', () => {
      activeRequest?.abort();
      dialog.replaceChildren();
      openedFrom?.focus();
    });
  }

  function setupProfileToggle(dialog) {
    const toggle = dialog.querySelector('[data-benchmark-profile-toggle]');
    if (!toggle) return;
    const layout = dialog.querySelector('.benchmark-reading-layout');
    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', String(layout.classList.toggle('is-profile-open')));
    });
  }

  function bindArticleOptions(dialog, articles, selectArticle) {
    const byId = new Map(articles.map(article => [article.id, article]));
    const options = [...dialog.querySelectorAll('[data-benchmark-reading-select]')];
    for (const option of options) {
      const article = byId.get(option.dataset.benchmarkReadingSelect);
      option.addEventListener('click', () => selectArticle(article));
    }
    const search = dialog.querySelector('[data-benchmark-article-search]');
    const empty = dialog.querySelector('[data-benchmark-article-empty]');
    search?.addEventListener('input', () => {
      const query = search.value.trim().toLocaleLowerCase();
      for (const option of options) option.hidden = !option.textContent.toLocaleLowerCase().includes(query);
      empty.hidden = options.some(option => !option.hidden);
    });
  }

  function createReader(dialog) {
    const options = [...dialog.querySelectorAll('[data-benchmark-reading-select]')];
    const title = dialog.querySelector('[data-benchmark-reading-article-title]');
    const date = dialog.querySelector('[data-benchmark-reading-date]');
    const kind = dialog.querySelector('[data-benchmark-reading-kind]');
    const body = dialog.querySelector('[data-benchmark-reading-body]');
    const content = dialog.querySelector('[data-benchmark-reading-content]');
    const original = dialog.querySelector('[data-benchmark-reading-original]');
    let bodyRequest;
    dialog.addEventListener('close', () => bodyRequest?.abort(), { once: dialog.hasAttribute('data-benchmark-account-dialog') });

    async function loadBody(url, request) {
      try {
        const response = await fetch(url, { signal: request.signal, mode: 'same-origin' });
        if (!response.ok) throw new Error('Article unavailable');
        const html = await response.text();
        if (request.signal.aborted || !dialog.open) return;
        const page = document.createElement('template');
        page.innerHTML = html;
        const articleBody = page.content.querySelector('[data-benchmark-imported-body]');
        if (!articleBody) throw new Error('Article body missing');
        body.replaceChildren(...articleBody.childNodes);
      } catch {
        if (request.signal.aborted || !dialog.open) return;
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'button';
        retry.textContent = '正文加载失败，点击重试';
        retry.addEventListener('click', () => startLoading(url));
        body.replaceChildren(retry);
      }
    }

    function startLoading(url) {
      bodyRequest = new AbortController();
      const status = document.createElement('p');
      status.setAttribute('role', 'status');
      status.textContent = '正在加载正文…';
      body.replaceChildren(status);
      loadBody(url, bodyRequest);
    }

    return function renderReading(article) {
      bodyRequest?.abort();
      const summary = article.querySelector('[data-benchmark-summary]');
      const link = article.querySelector('[data-benchmark-source]');
      const published = article.querySelector('time');
      title.textContent = article.querySelector('h3').textContent;
      date.textContent = published?.textContent || '';
      date.dateTime = published?.dateTime || '';
      date.hidden = !published;
      original.hidden = !link;
      if (link) original.href = link.getAttribute('href');
      else original.removeAttribute('href');

      body.replaceChildren();
      if (article.dataset.benchmarkBodyUrl) {
        kind.textContent = '采集正文';
        startLoading(article.dataset.benchmarkBodyUrl);
      } else if (summary) {
        kind.textContent = '文章预览';
        body.append(summary.cloneNode(true));
      } else {
        kind.textContent = '';
        const message = document.createElement('p');
        message.textContent = link ? '请打开微信原文阅读正文。' : '暂无可读正文。';
        body.append(message);
      }
      for (const option of options) {
        if (option.dataset.benchmarkReadingSelect === article.id) option.setAttribute('aria-current', 'true');
        else option.removeAttribute('aria-current');
      }
      content.scrollTop = 0;
    };
  }

  function setupReader(historySection) {
    const links = [...historySection.querySelectorAll('[data-benchmark-article-link]')];
    if (!links.length) return;

    const articles = [...historySection.querySelectorAll('[data-benchmark-article]')];
    const dialog = document.querySelector('[data-benchmark-reading-dialog]');
    const body = dialog.querySelector('[data-benchmark-reading-body]');
    const renderReading = createReader(dialog);
    setupProfileToggle(dialog);
    let openedFrom;

    function selectArticle(id) {
      if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
      showArticle();
    }

    function showArticle() {
      const selected = links.find(link => link.hash === window.location.hash) || links[0];
      for (const link of links) {
        if (link === selected) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
      for (const article of articles) article.hidden = `#${article.id}` !== selected.hash;
      if (dialog.open) renderReading(articles[links.indexOf(selected)]);
    }

    function openReading(id, trigger) {
      openedFrom = trigger;
      dialog.showModal();
      selectArticle(id);
    }

    historySection.addEventListener('click', event => {
      const link = event.target.closest('[data-benchmark-article-link]');
      if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        openReading(link.hash.slice(1), link);
      }
      const button = event.target.closest('[data-benchmark-read]');
      if (button) openReading(button.closest('[data-benchmark-article]').id, button);
    });
    bindArticleOptions(dialog, articles, article => selectArticle(article.id));
    dialog.addEventListener('close', () => {
      body.replaceChildren();
      const selected = links.find(link => link.getAttribute('aria-current') === 'true');
      (openedFrom?.getClientRects().length ? openedFrom : selected)?.focus();
    });
    for (const button of historySection.querySelectorAll('[data-benchmark-read]')) button.hidden = false;
    window.addEventListener('hashchange', showArticle);
    showArticle();
  }

  function decodeBase64(value) {
    return Uint8Array.from(atob(value), character => character.charCodeAt(0));
  }

  async function decryptDownloads(envelope, password) {
    const [version, salt, iv, ciphertext] = envelope.split('.');
    if (version !== 'v1' || !salt || !iv || !ciphertext) throw new Error('Invalid download data');
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: decodeBase64(salt), iterations: 600000 },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decodeBase64(iv) }, key, decodeBase64(ciphertext));
    return JSON.parse(new TextDecoder().decode(plaintext));
  }

  function renderDownloads(downloads, template, container) {
    const cards = downloads.map(download => {
      const url = new URL(download.url);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Invalid download URL');
      const card = template.content.cloneNode(true);
      const logo = card.querySelector('.provider-logo');
      const link = card.querySelector('.download-button');
      const imagePath = { baidu: template.dataset.baiduLogo, quark: template.dataset.quarkLogo }[download.provider];
      if (imagePath) {
        const image = document.createElement('img');
        image.className = 'provider-brand-image';
        image.src = imagePath;
        image.alt = '';
        image.width = image.height = 28;
        logo.replaceChildren(image);
      }
      logo.classList.add(download.provider);
      link.classList.add(download.provider);
      link.dataset.benchmarkProvider = download.provider;
      link.href = url.href;
      card.querySelector('[data-provider-name]').textContent = download.name;
      card.querySelector('[data-provider-action]').textContent = `前往${download.name}`;
      if (download.code) {
        const row = card.querySelector('[data-extraction]');
        row.querySelector('code').textContent = download.code;
        row.querySelector('button').dataset.copy = download.code;
        row.hidden = false;
      }
      return card;
    });
    container.replaceChildren(...cards);
  }

  function setupDownloadDialog(dialog, template, scope) {
    const unlock = setupDownloads(dialog, template);
    let openedFrom;
    for (const trigger of scope.querySelectorAll('[data-benchmark-open], [data-benchmark-download-toggle]')) {
      trigger.hidden = false;
      trigger.addEventListener('click', () => {
        openedFrom = trigger;
        dialog.showModal();
        unlock.focus(trigger.dataset.benchmarkDownloadToggle);
      });
    }
    dialog.addEventListener('close', () => {
      unlock.clear();
      openedFrom?.focus();
    });
  }

  function setupDownloads(dialog, template) {
    const options = dialog.querySelector('[data-benchmark-download-options]');
    const form = options.querySelector('[data-benchmark-unlock]');
    const password = form.querySelector('input');
    const submit = form.querySelector('button');
    const message = form.querySelector('[data-benchmark-error]');
    const downloads = dialog.querySelector('[data-benchmark-downloads]');
    let requestedProvider;
    let attempt = 0;

    function focusDownload() {
      const links = [...downloads.querySelectorAll('a')];
      (links.find(link => link.dataset.benchmarkProvider === requestedProvider) || links[0])?.focus();
    }

    function showMessage(text) {
      message.textContent = text;
      message.hidden = !text;
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!window.crypto?.subtle) {
        showMessage('请通过 localhost 或 HTTPS 打开此页面后再试。');
        return;
      }
      const currentAttempt = ++attempt;
      const value = password.value;
      password.value = '';
      password.disabled = submit.disabled = true;
      submit.textContent = '正在解锁…';
      showMessage('');
      try {
        const links = await decryptDownloads(dialog.dataset.encrypted, value);
        if (currentAttempt !== attempt || !dialog.open) return;
        renderDownloads(links, template, downloads);
        options.hidden = true;
        downloads.hidden = false;
        focusDownload();
      } catch {
        if (currentAttempt === attempt && dialog.open) showMessage('口令不正确，或下载配置无法读取。');
      } finally {
        if (currentAttempt === attempt) {
          password.disabled = submit.disabled = false;
          submit.textContent = '解锁下载';
          if (dialog.open && !options.hidden) password.focus();
        }
      }
    });
    return {
      clear() {
        attempt++;
        requestedProvider = undefined;
        password.value = '';
        password.disabled = submit.disabled = false;
        submit.textContent = '解锁下载';
        showMessage('');
        downloads.replaceChildren();
        downloads.hidden = true;
        options.hidden = false;
      },
      focus(provider) {
        requestedProvider = provider;
        password.focus();
      },
    };
  }

  const catalog = document.querySelector('[data-benchmark-catalog]');
  const historySection = document.querySelector('[data-benchmark-history]');
  const dialog = document.querySelector('[data-benchmark-dialog]');
  if (catalog) {
    setupCatalog(catalog);
    if (typeof window.HTMLDialogElement?.prototype.showModal === 'function') {
      setupAccountDialogs(catalog, document.querySelector('[data-benchmark-account-dialog]'));
    }
  }
  if (historySection) setupReader(historySection);
  if (dialog) {
    const template = document.getElementById('benchmark-download-template');
    setupDownloadDialog(dialog, template, document);
  }
})();
