/* main.js —— 全站交互。无任何第三方依赖，约 6KB。
   职责：主题切换 / 移动端导航 / 滚动入场动画 / 阅读进度 /
        卡片搜索与标签筛选 / 代码复制 / 文章目录高亮 / 回到顶部 */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  root.classList.add('js');

  /* ------------------------------------------------------------- 主题切换 */
  var THEME_KEY = 'theme';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function readPref() {
    try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { return 'auto'; }
  }

  function resolveTheme(pref) {
    if (pref === 'auto') return mq && mq.matches ? 'dark' : 'light';
    return pref === 'dark' ? 'dark' : 'light';
  }

  var THEME_LABEL = { light: '浅色', dark: '深色', auto: '跟随系统' };

  function applyTheme(pref) {
    var resolved = resolveTheme(pref);

    // 切换期间挂上 theme-switching，让所有元素跳过过渡动画，
    // 避免「背景在渐变、文字已经变色」造成的短暂不可读。
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-pref', pref);

    // 强制一次样式重算，确保过渡抑制在换色之前生效
    void root.offsetHeight;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });

    var btn = $('#themeToggle');
    if (btn) {
      btn.title = '当前主题：' + THEME_LABEL[pref] + '（点击切换）';
      btn.setAttribute('aria-label', '切换主题，当前为' + THEME_LABEL[pref]);
    }
    var meta = $('meta[name="theme-color"]');
    if (meta) {
      var accent = getComputedStyle(root).getPropertyValue('--accent').trim() || '#2c5f8d';
      meta.setAttribute('content', resolved === 'dark' ? '#12141a' : accent);
    }
  }

  var pref = readPref();
  applyTheme(pref);

  var themeBtn = $('#themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var order = ['light', 'dark', 'auto'];
      var next = order[(order.indexOf(readPref()) + 1) % order.length];
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  }

  if (mq) {
    var onSchemeChange = function () { if (readPref() === 'auto') applyTheme('auto'); };
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ----------------------------------------------------------- 移动端导航 */
  var navToggle = $('#navToggle');
  var nav = $('#nav');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setNav(!nav.classList.contains('is-open'));
    });
    doc.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setNav(false);
    });
  }

  /* --------------------------------------------- 滚动：头部阴影/进度/回顶 */
  var header = $('#siteHeader');
  var progress = $('#scrollProgress');
  var toTop = $('#toTop');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(1, y / max) * 100 : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('is-visible', y > 640);
    ticking = false;
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------- 滚动入场动画 */
  /* 只有「初始在视口之外」的元素才进入隐藏态，滚动到附近时淡入。
     JS 不跑、观察器失效、或者用户直接跳到页面中段，内容都始终可见。 */
  var revealEls = $$('[data-reveal]');

  if ('IntersectionObserver' in window && revealEls.length) {
    var viewportH = window.innerHeight || doc.documentElement.clientHeight || 800;
    var pending = [];

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top <= viewportH * 0.92) return; // 已在视口内：不隐藏，直接显示

      // 同组卡片按序错开，让网格入场有节奏感
      var siblings = el.parentElement ? $$('[data-reveal]', el.parentElement) : [el];
      var index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 7) * 70 + 'ms');

      el.classList.add('is-pending');
      pending.push(el);
    });

    if (pending.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove('is-pending');
            io.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
      );
      pending.forEach(function (el) { io.observe(el); });

      // 兜底：2 秒后无论是否观察到，全部显示
      window.setTimeout(function () {
        pending.forEach(function (el) { el.classList.remove('is-pending'); });
      }, 2000);
    }
  }

  /* ------------------------------------------------- 卡片搜索 与 标签筛选 */
  var searchInput = $('#siteSearch');
  var tagRow = $('#tagRow');
  var status = $('#filterStatus');
  var emptyState = $('#emptyState');
  var cards = $$('[data-search]');
  var activeTag = '';

  function applyFilter() {
    if (!cards.length) return;
    var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var tags = (card.getAttribute('data-tags') || '').split(',').filter(Boolean);
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okTag = !activeTag || tags.indexOf(activeTag) !== -1;
      var show = okQuery && okTag;
      card.classList.toggle('is-hidden', !show);
      if (show) visible++;
    });

    $$('.card-grid').forEach(function (grid) {
      var any = $$(':scope > .card', grid).some(function (c) { return !c.classList.contains('is-hidden'); });
      grid.classList.toggle('is-hidden', !any);
    });

    if (emptyState) emptyState.hidden = visible > 0;

    if (status) {
      var parts = [];
      if (query) parts.push('关键词「' + searchInput.value.trim() + '」');
      if (activeTag) parts.push('标签 #' + activeTag);
      status.hidden = parts.length === 0;
      status.textContent = parts.length ? parts.join(' · ') + '：' + visible + ' 条结果' : '';
    }

    var clear = $('#searchClear');
    if (clear) clear.hidden = !searchInput || !searchInput.value;
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { searchInput.value = ''; applyFilter(); searchInput.blur(); }
    });

    var clearBtn = $('#searchClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        applyFilter();
        searchInput.focus();
      });
    }

    // Ctrl/Cmd + K 快速聚焦搜索框
    doc.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  if (tagRow) {
    tagRow.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      activeTag = chip.getAttribute('data-tag') || '';
      $$('.chip', tagRow).forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      applyFilter();
    });
  }

  /* --------------------------------------------------------- 代码块复制 */
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var block = btn.closest('.code-block');
      var code = block && block.querySelector('code');
      if (!code) return;
      var text = code.innerText;

      var done = function () {
        btn.textContent = '已复制';
        btn.classList.add('is-done');
        window.setTimeout(function () {
          btn.textContent = '复制';
          btn.classList.remove('is-done');
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = doc.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
    doc.body.removeChild(ta);
  }

  /* ------------------------------------------------------- 文章目录高亮 */
  var tocNav = $('#tocNav');
  if (tocNav && 'IntersectionObserver' in window) {
    var links = $$('.toc-link', tocNav);
    var headings = links
      .map(function (a) {
        var raw = a.getAttribute('href').slice(1);
        try { raw = decodeURIComponent(raw); } catch (e) { /* 保持原样 */ }
        return doc.getElementById(raw);
      })
      .filter(Boolean);

    if (headings.length) {
      var tocObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (a) {
              a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
            });
          });
        },
        { rootMargin: '-12% 0px -70% 0px', threshold: 0 }
      );
      headings.forEach(function (h) { tocObserver.observe(h); });
    }
  }

  /* ------------------------------------------------------------- 页脚年份 */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
