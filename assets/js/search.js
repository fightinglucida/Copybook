(function () {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  let fuse;
  let data = [];
  let initialized = false;

  // Debounce function to limit how often a function gets called.
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // Fetch index and initialize Fuse.js
  async function initFuse() {
    if (initialized) return;
    try {
      const response = await fetch('/index.json');
      if (!response.ok) {
        console.error('Failed to fetch search index: ' + response.statusText);
        return;
      }
      data = await response.json();
      const options = {
        keys: ['title', 'contents'],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.4,
        ignoreLocation: true,
      };
      fuse = new Fuse(data, options);
      initialized = true;
      // If user was typing while index was loading, perform search now
      if(searchInput.value.trim().length > 1) {
        performSearch();
      }
    } catch (error) {
      console.error('Error initializing Fuse:', error);
    }
  }

  // Perform search and render results
  function performSearch() {
    if (!initialized) {
      searchResults.innerHTML = '<div class="p-3 text-stone-500">正在加载索引...</div>';
      searchResults.classList.remove('hidden');
      return;
    }

    const query = searchInput.value.trim();

    if (query.length < 2) {
      searchResults.innerHTML = '';
      searchResults.classList.add('hidden');
      return;
    }

    const results = fuse.search(query);
    
    if (results.length > 0) {
      searchResults.innerHTML = results.slice(0, 15).map(result => `
        <a href="${result.item.permalink}" class="block p-2 border-b border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700">
          <div class="font-bold text-stone-900 dark:text-white truncate">${result.item.title}</div>
        </a>
      `).join('');
      searchResults.classList.remove('hidden');
    } else {
      searchResults.innerHTML = '<div class="p-3 text-stone-500">没有找到关于 "' + query + '" 的结果</div>';
      searchResults.classList.remove('hidden');
    }
  }

  // Event listeners
  searchInput.addEventListener('focus', initFuse, { once: true });
  searchInput.addEventListener('keyup', debounce(performSearch, 250));
  searchInput.addEventListener('search', performSearch); // For clearing with 'x'

  // Hide results when clicking outside
  document.addEventListener('click', (event) => {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
      searchResults.classList.add('hidden');
    }
  });
})();
