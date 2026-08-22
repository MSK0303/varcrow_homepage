'use strict';

(() => {
  const NEWS_PATH = '/ureshino/assets/data/news.json';
  const FALLBACK_MESSAGE = 'お知らせを読み込めませんでした。最新情報はInstagramをご覧ください。';
  const CATEGORY_LABELS = {
    news: 'お知らせ',
    trial: '体験会',
    match: '試合結果',
  };

  function createNewsCard(item, headingLevel) {
    const article = document.createElement('article');
    article.className = 'news-card';

    const meta = document.createElement('div');
    meta.className = 'news-card__meta';

    const date = document.createElement('time');
    date.dateTime = item.date;
    date.textContent = String(item.date).replaceAll('-', '.');

    const category = document.createElement('span');
    category.className = 'news-card__category';
    category.textContent = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.news;

    meta.append(date, category);

    const title = document.createElement(`h${headingLevel}`);
    title.textContent = item.title;

    article.append(meta, title);

    if (item.body) {
      const body = document.createElement('p');
      body.className = 'news-card__body';
      body.textContent = item.body;
      article.append(body);
    }

    if (item.link) {
      const link = document.createElement('a');
      link.className = 'text-link news-card__link';
      link.href = item.link;
      link.textContent = '詳しく見る';
      if (/^https?:\/\//.test(item.link)) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      article.append(link);
    }

    return article;
  }

  function renderNews(items, container, limit) {
    const sortedItems = [...items].sort((left, right) =>
      String(right.date).localeCompare(String(left.date))
    );
    const visibleItems = Number.isFinite(limit) ? sortedItems.slice(0, limit) : sortedItems;
    const headingLevel = container.dataset.newsHeadingLevel === '2' ? 2 : 3;

    container.replaceChildren();
    if (visibleItems.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'news-empty';
      empty.textContent = '現在お知らせはありません。';
      container.append(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    visibleItems.forEach((item) => fragment.append(createNewsCard(item, headingLevel)));
    container.append(fragment);
  }

  function showFallback(container) {
    const fallback = document.createElement('p');
    fallback.className = 'news-fallback';
    fallback.textContent = FALLBACK_MESSAGE;
    container.replaceChildren(fallback);
  }

  async function loadNews(container) {
    try {
      const response = await fetch(NEWS_PATH, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`News request failed: ${response.status}`);
      }
      const payload = await response.json();
      if (!Array.isArray(payload.items)) {
        throw new TypeError('News items must be an array.');
      }

      const parsedLimit = Number.parseInt(container.dataset.newsLimit, 10);
      renderNews(payload.items, container, Number.isNaN(parsedLimit) ? Infinity : parsedLimit);
    } catch (error) {
      console.warn('News could not be loaded.', error);
      showFallback(container);
    }
  }

  function init() {
    document.querySelectorAll('[data-news-list]').forEach((container) => loadNews(container));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
