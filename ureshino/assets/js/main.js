'use strict';

(() => {
  document.documentElement.classList.add('js');

  const CONFIG_PATH = '/ureshino/assets/data/config.json';

  function applyConfig(config) {
    document.querySelectorAll('[data-config]').forEach((element) => {
      const key = element.dataset.config;
      const value = typeof config[key] === 'string' ? config[key].trim() : '';

      if (!value) {
        if (element.hasAttribute('data-instagram')) {
          element.hidden = true;
        }
        return;
      }

      if (element instanceof HTMLAnchorElement) {
        element.href = value;
      }
      if (element.hasAttribute('data-instagram')) {
        element.hidden = false;
      }
    });

    document.querySelectorAll('[data-config-text]').forEach((element) => {
      const key = element.dataset.configText;
      const value = typeof config[key] === 'string' ? config[key].trim() : '';
      if (value) {
        element.textContent = value;
      }
    });
  }

  async function loadConfig() {
    try {
      const response = await fetch(CONFIG_PATH, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Config request failed: ${response.status}`);
      }
      const config = await response.json();
      applyConfig(config);
    } catch (error) {
      console.warn('Config could not be loaded; internal fallback links remain active.', error);
    }
  }

  function setupNavigation() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const overlay = document.querySelector('[data-nav-overlay]');
    if (!toggle || !overlay) {
      return;
    }

    const setOpen = (open, returnFocus = false) => {
      overlay.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      document.body.classList.toggle('is-nav-open', open);

      if (open) {
        overlay.querySelector('a')?.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    overlay.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });

    const desktopQuery = window.matchMedia('(min-width: 960px)');
    desktopQuery.addEventListener('change', (event) => {
      if (event.matches) {
        setOpen(false);
      }
    });
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.reveal');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -32px',
    });

    elements.forEach((element) => observer.observe(element));
  }

  function init() {
    setupNavigation();
    setupReveal();
    loadConfig();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
