(() => {
  function renderCatalogCard(template, data) {
    const card = template.content.firstElementChild.cloneNode(true);
    card.href = data.href;
    const title = card.querySelector('h2');
    title.textContent = data.title;
    title.title = data.title;
    const topic = card.querySelector('.benchmark-card-topic');
    topic.textContent = data.topic;
    topic.title = data.topic;
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
    const chart = card.querySelector('[data-benchmark-trend-image]');
    if (data.stats.chart) chart.src = data.stats.chart;
    chart.hidden = !data.stats.chart;
    card.querySelector('[data-benchmark-trend-empty]').hidden = Boolean(data.stats.chart);
    for (const field of card.querySelectorAll('[data-benchmark-stat]')) {
      field.textContent = data.stats[field.dataset.benchmarkStat];
    }
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

      const index = articleIndex(page.content.querySelector('[data-benchmark-article-catalog]'));
      dialog.replaceChildren(...reader.children);
      if (index) {
        const renderReading = createReader(dialog);
        setupArticleList(dialog, index, renderReading).open();
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

  function articleIndex(source) {
    if (!source) return null;
    const initial = JSON.parse(source.textContent);
    const { indexUrl, total, pageSize } = source.dataset;
    let loaded;
    return {
      initial,
      total: Number(total),
      pageSize: Number(pageSize),
      all() {
        if (!indexUrl) return Promise.resolve(initial);
        if (!loaded) {
          loaded = fetch(indexUrl, { mode: 'same-origin' }).then(response => {
            if (!response.ok) throw new Error('Article index unavailable');
            return response.json();
          }).catch(error => {
            loaded = undefined;
            throw error;
          });
        }
        return loaded;
      },
    };
  }

  function setArticleLink(element, url) {
    element.hidden = !url;
    if (url) element.href = url;
    else element.removeAttribute('href');
  }

  function setArticleDate(element, date) {
    element.textContent = date;
    element.dateTime = date;
    element.hidden = !date;
  }

  function setupArticleList(container, index, selectArticle) {
    const panel = container.querySelector('[data-benchmark-article-panel]');
    const tools = panel.querySelector('[data-benchmark-article-tools]');
    const options = panel.querySelector('[data-benchmark-article-options]');
    const scroll = panel.querySelector('[data-benchmark-article-scroll]');
    const template = panel.querySelector('[data-benchmark-article-option]').content.firstElementChild;
    const search = panel.querySelector('[data-benchmark-article-search]');
    const sort = panel.querySelector('[data-benchmark-article-sort]');
    const empty = panel.querySelector('[data-benchmark-article-empty]');
    const archive = panel.querySelector('[data-benchmark-article-archive]');
    const pagination = panel.querySelector('[data-benchmark-article-pagination]');
    const previous = panel.querySelector('[data-benchmark-article-prev]');
    const next = panel.querySelector('[data-benchmark-article-next]');
    const pageInfo = panel.querySelector('[data-benchmark-article-page]');
    const notice = panel.querySelector('[data-benchmark-article-notice]');
    let current;
    let visible = [];
    let page = 1;
    let revision = 0;

    function optionFor(article) {
      const option = template.cloneNode(true);
      option.dataset.benchmarkReadingSelect = article.id;
      if (option instanceof HTMLAnchorElement) option.href = `#${article.id}`;
      option.querySelector('strong').textContent = article.title;
      setArticleDate(option.querySelector('time'), article.date);
      const reading = option.querySelector('[data-benchmark-option-reading]');
      const likes = option.querySelector('[data-benchmark-option-likes]');
      reading.hidden = !article.reading;
      reading.textContent = `阅读 ${article.reading}`;
      likes.hidden = !article.likes;
      likes.textContent = `点赞 ${article.likes}`;
      if (article.id === current) option.setAttribute('aria-current', 'true');
      return option;
    }

    function select(article, fromOption) {
      current = article?.id;
      for (const option of options.children) {
        if (option.dataset.benchmarkReadingSelect === current) option.setAttribute('aria-current', 'true');
        else option.removeAttribute('aria-current');
      }
      selectArticle(article, fromOption);
    }

    function display(rows, total, requestedPage, preferredId, focusPage) {
      const pages = Math.max(1, Math.ceil(total / index.pageSize));
      const selectedPosition = preferredId ? rows.findIndex(article => article.id === preferredId) : -1;
      page = selectedPosition < 0 ? Math.min(requestedPage, pages) : Math.floor(selectedPosition / index.pageSize) + 1;
      const start = (page - 1) * index.pageSize;
      visible = rows.slice(start, start + index.pageSize);
      const selected = visible.find(article => article.id === preferredId) || visible[0];
      current = selected?.id;
      options.replaceChildren(...visible.map(optionFor));
      scroll.scrollTop = 0;
      empty.hidden = visible.length > 0;
      if (archive) archive.hidden = !visible.length || page !== pages || Boolean(search.value.trim());
      pagination.hidden = pages === 1;
      pageInfo.textContent = `第 ${page} / ${pages} 页 · ${total} 篇`;
      previous.disabled = page === 1;
      next.disabled = page === pages;
      selectArticle(selected);
      if (focusPage && !pagination.hidden) pageInfo.focus();
    }

    async function update(requestedPage, { preferredId, focusPage = false } = {}) {
      const request = ++revision;
      const query = search.value.trim().toLocaleLowerCase();
      const order = sort.value;
      const initial = !query && order === 'reads' && requestedPage === 1 &&
        (!preferredId || index.initial.some(article => article.id === preferredId));
      notice.hidden = true;
      panel.removeAttribute('aria-busy');
      if (initial) {
        display(index.initial, index.total, 1, preferredId, focusPage);
        return;
      }
      panel.setAttribute('aria-busy', 'true');
      try {
        let rows = await index.all();
        if (request !== revision || !panel.isConnected) return;
        if (query) {
          rows = rows.filter(article => [article.title, article.date, article.reading && `阅读 ${article.reading}`,
            article.likes && `点赞 ${article.likes}`].join(' ').toLocaleLowerCase().includes(query));
        }
        if (order !== 'reads') {
          const direction = order === 'oldest' ? 1 : -1;
          rows = [...rows].sort((a, b) => {
            if (!a.date || !b.date) return Number(!a.date) - Number(!b.date);
            return direction * a.date.localeCompare(b.date);
          });
        }
        display(rows, rows.length, requestedPage, preferredId, focusPage);
      } catch {
        if (request !== revision || !panel.isConnected) return;
        notice.textContent = '文章列表加载失败，请重试翻页、搜索或排序。';
        notice.hidden = false;
      } finally {
        if (request === revision) panel.removeAttribute('aria-busy');
      }
    }

    options.addEventListener('click', event => {
      const option = event.target.closest('[data-benchmark-reading-select]');
      if (!option || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(visible.find(article => article.id === option.dataset.benchmarkReadingSelect), option);
    });
    search.addEventListener('input', () => update(1));
    sort.addEventListener('change', () => update(1));
    previous.addEventListener('click', () => update(page - 1, { focusPage: true }));
    next.addEventListener('click', () => update(page + 1, { focusPage: true }));
    tools.hidden = false;
    return {
      open(preferredId) {
        search.value = '';
        sort.value = 'reads';
        update(1, { preferredId });
      },
      reveal(id) {
        const article = visible.find(article => article.id === id);
        if (article) select(article);
        else this.open(id);
      },
      cancel() { revision++; },
      selectedOption() { return options.querySelector('[aria-current="true"]'); },
    };
  }

  async function fetchArticleMarkup(url, request) {
    const response = await fetch(url, { signal: request.signal, mode: 'same-origin' });
    if (!response.ok) throw new Error('Article unavailable');
    const page = document.createElement('template');
    page.innerHTML = await response.text();
    const markup = page.content.querySelector('[data-benchmark-imported-body]');
    if (!markup) throw new Error('Article markup missing');
    return markup;
  }

  function createReader(dialog) {
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
        const articleBody = await fetchArticleMarkup(url, request);
        if (request.signal.aborted || !dialog.open) return;
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
      title.textContent = article?.title || '没有匹配的文章';
      setArticleDate(date, article?.date || '');
      setArticleLink(original, article?.original);
      body.replaceChildren();
      kind.textContent = '';
      if (article?.body || article?.summary) {
        kind.textContent = article.body ? '采集正文' : '文章预览';
        startLoading(article.body || article.summary);
      } else if (article) {
        const message = document.createElement('p');
        message.textContent = article.original ? '请打开微信原文阅读正文。' : '暂无可读正文。';
        body.append(message);
      }
      content.scrollTop = 0;
    };
  }

  function setupReader(historySection) {
    const index = articleIndex(document.querySelector('[data-benchmark-article-catalog]'));
    if (!index) return;

    const dialog = document.querySelector('[data-benchmark-reading-dialog]');
    const previews = historySection.querySelector('.benchmark-previews');
    const inline = previews.firstElementChild;
    const summary = inline.querySelector('[data-benchmark-reading-body]');
    const initialSummaries = new Map([...previews.children].map(preview => [preview.id, preview.querySelector('[data-benchmark-reading-body]').innerHTML]));
    const read = inline.querySelector('[data-benchmark-read]');
    const renderReading = createReader(dialog);
    const modal = setupArticleList(dialog, index, (article, option) => {
      renderReading(article);
      if (option) setHash(article.id);
    });
    setupProfileToggle(dialog);
    let active;
    let openedFrom;
    let summaryRequest;

    function setHash(id) {
      if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
    }

    function renderInline(article) {
      summaryRequest?.abort();
      inline.hidden = !article;
      if (!article) return;
      inline.id = article.id;
      inline.querySelector('h3').textContent = article.title;
      setArticleDate(inline.querySelector('time'), article.date);
      setArticleLink(inline.querySelector('[data-benchmark-reading-collected]'), article.body);
      setArticleLink(inline.querySelector('[data-benchmark-reading-original]'), article.original);
      // The saved first-page summaries were rendered and sanitized by Hugo.
      summary.innerHTML = initialSummaries.get(article.id) || '';
      if (!article.summary || initialSummaries.has(article.id)) return;
      const request = new AbortController();
      summaryRequest = request;
      fetchArticleMarkup(article.summary, request).then(markup => {
        if (!request.signal.aborted) summary.replaceChildren(...markup.childNodes);
      }).catch(() => {});
    }

    function openReading(article, trigger) {
      openedFrom = trigger;
      dialog.showModal();
      setHash(article.id);
      modal.open(article.id);
    }

    const list = setupArticleList(historySection, index, (article, option) => {
      active = article;
      renderInline(article);
      if (option) openReading(article, option);
    });
    previews.replaceChildren(inline);
    read.hidden = false;
    read.addEventListener('click', () => openReading(active, read));
    dialog.addEventListener('close', () => {
      modal.cancel();
      const id = window.location.hash.slice(1);
      if (id && id !== active?.id) list.reveal(id);
      (openedFrom?.isConnected ? openedFrom : list.selectedOption())?.focus();
    });
    window.addEventListener('hashchange', () => {
      const id = window.location.hash.slice(1);
      if (dialog.open) modal.reveal(id);
      else list.reveal(id);
    });
    list.open(/^#article-\d+$/.test(window.location.hash) ? window.location.hash.slice(1) : undefined);
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
