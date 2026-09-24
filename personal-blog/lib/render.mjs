// lib/render.mjs
// 页面模板层：所有 HTML / RSS / Sitemap 字符串都在这里生成。
// 页面使用「相对根路径」(root) 来拼链接，因此 dist/ 目录既能在服务器上跑，
// 也能直接双击用 file:// 打开预览。

import { escapeHtml, escapeAttr } from './markdown.mjs';

const ICONS = {
  github:
    '<path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/>',
  scholar:
    '<path d="M12 3 1.5 8.5 12 14l8.5-4.45v5.6h1.5V8.5L12 3Zm-6 8.06v3.7c0 1.2 2.69 2.74 6 2.74s6-1.54 6-2.74v-3.7L12 14.6l-6-3.54Z"/>',
  orcid:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3.2 5.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM8 10.2h1.6V17H8v-6.8Zm4 0h4.1c2.4 0 4.1 1.3 4.1 3.4S19.9 17 16.8 17H12v-6.8Zm1.6 1.4v4h1.7c1.2 0 2.1-.7 2.1-2s-.9-2-2.1-2h-1.7Z"/>',
  mail: '<path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.8L4.6 7H19.4L12 12.8ZM4 8.9V17h16V8.9l-7.4 5.8a1 1 0 0 1-1.2 0L4 8.9Z"/>',
  link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 0 1 1.4 1.4l-1.4 1.4a1 1 0 0 1-1.4 0Zm-2.2 4.4a4 4 0 0 1 0-5.6l3-3a4 4 0 0 1 5.6 0 1 1 0 0 1-1.4 1.4 2 2 0 0 0-2.8 0l-3 3a2 2 0 0 0 0 2.8 1 1 0 0 1-1.4 1.4Zm7.2-1.2a1 1 0 0 1 0-1.4l1-1a2 2 0 0 0 0-2.9 1 1 0 0 1 1.4-1.4 4 4 0 0 1 0 5.7l-1 1a1 1 0 0 1-1.4 0Z"/>',
  pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-1 7V3.5L18.5 9H13Z"/>',
  code: '<path d="M8.7 16.6 4.1 12l4.6-4.6L7.3 6 1.3 12l6 6 1.4-1.4Zm6.6 0 4.6-4.6-4.6-4.6L16.7 6l6 6-6 6-1.4-1.4Z"/>',
  sun: '<path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-13a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 13a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 12a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm13 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1ZM6.3 6.3a1 1 0 0 1 1.4 0l1.4 1.4A1 1 0 0 1 7.7 9.1L6.3 7.7a1 1 0 0 1 0-1.4Zm9.6 9.6a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 0-1.4Zm2.8-9.6a1 1 0 0 1 0 1.4L17.3 9.1a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0ZM7.7 14.9a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Z"/>',
  moon: '<path d="M12.7 2.3a1 1 0 0 1 .2 1.1 7.5 7.5 0 0 0 9.7 9.7 1 1 0 0 1 1.3 1.3A10 10 0 1 1 11.6 2.1a1 1 0 0 1 1.1.2Z"/>',
  arrow: '<path d="M13.3 5.3 12 4l-8 8 8 8 1.3-1.3L7.6 13H20v-2H7.6l5.7-5.7Z"/>',
  external: '<path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3ZM5 5h5v2H7v10h10v-3h2v5H5V5Z"/>',
};

export function icon(name, size = 18) {
  const path = ICONS[name] || ICONS.link;
  return `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${path}</svg>`;
}

const MONTHS = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'];

export function formatDate(value, style = 'dot') {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (style === 'cn') return `${y} 年 ${MONTHS[d.getMonth()]}${Number(day)} 日`;
  if (style === 'short') return `${y}-${m}`;
  return `${y}.${m}.${day}`;
}

function readingTime(text) {
  const clean = String(text || '').replace(/\s+/g, '');
  const cjk = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  const words = (String(text || '').match(/[A-Za-z0-9']+/g) || []).length;
  const minutes = Math.max(1, Math.round(cjk / 400 + words / 220));
  return `${minutes} 分钟阅读`;
}

function byline(authors, selfNames) {
  const list = Array.isArray(authors) ? authors : String(authors || '').split(/[,;，、]/);
  const self = (Array.isArray(selfNames) ? selfNames : [selfNames]).filter(Boolean);
  return list
    .map((a) => String(a).trim())
    .filter(Boolean)
    .map((a) => {
      const isSelf = self.some((s) => s && a.includes(s));
      return isSelf ? `<strong class="is-self">${escapeHtml(a)}</strong>` : escapeHtml(a);
    })
    .join('<span class="sep">, </span>');
}

function tagChips(tags, root, activeTag) {
  if (!tags || !tags.length) return '';
  return `<div class="chips">${tags
    .map((t) => {
      const active = activeTag && activeTag === t ? ' is-active' : '';
      return `<a class="chip${active}" href="${root}tags/${encodeURIComponent(t)}.html">#${escapeHtml(t)}</a>`;
    })
    .join('')}</div>`;
}

function linkRow(links, root) {
  if (!links || !links.length) return '';
  return `<div class="card-links">${links
    .map((l) => {
      const href = /^https?:\/\//.test(l.href) ? l.href : root + l.href;
      const ext = /^https?:\/\//.test(l.href);
      const ic = l.icon || (/\.pdf$/i.test(l.href) ? 'pdf' : ext ? 'external' : 'link');
      return `<a class="link-pill" href="${escapeAttr(href)}"${
        ext ? ' target="_blank" rel="noopener noreferrer"' : ''
      }>${icon(ic, 15)}<span>${escapeHtml(l.label)}</span></a>`;
    })
    .join('')}</div>`;
}

const TYPE_LABEL = {
  conference: '会议论文',
  journal: '期刊论文',
  preprint: '预印本',
  thesis: '学位论文',
  workshop: 'Workshop',
};

/* ------------------------------------------------------------------ layout */

export function layout({ config, root = '', active = '', pageType = 'default', title, description, canonical, ogType = 'website', content, extraBody = '' }) {
  const s = config.site;
  const pageTitle = title ? `${title} · ${s.title}` : `${s.title} · ${s.tagline}`;
  const desc = description || s.description;
  const canonicalUrl = canonical ? (canonical.startsWith('http') ? canonical : s.url.replace(/\/$/, '') + canonical) : s.url;
  const t = config.theme || {};
  const accent = t.accent || '#2c5f8d';
  const accent2 = t.accent2 || '#b7791f';

  const navLinks = (config.nav || [])
    .map(
      (item) =>
        `<a class="nav-link${active === item.key ? ' is-active' : ''}" href="${root}${escapeAttr(item.href)}"${
          active === item.key ? ' aria-current="page"' : ''
        }>${escapeHtml(item.label)}</a>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="${escapeAttr(s.lang || 'zh-CN')}" data-theme="${escapeAttr(t.default || 'auto')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeAttr(desc)}">
<meta name="author" content="${escapeAttr(s.author)}">
<meta name="keywords" content="${escapeAttr((s.keywords || []).join(','))}">
<meta name="theme-color" content="${escapeAttr(accent)}">
<link rel="canonical" href="${escapeAttr(canonicalUrl)}">
<meta property="og:type" content="${escapeAttr(ogType)}">
<meta property="og:site_name" content="${escapeAttr(s.title)}">
<meta property="og:title" content="${escapeAttr(pageTitle)}">
<meta property="og:description" content="${escapeAttr(desc)}">
<meta property="og:url" content="${escapeAttr(canonicalUrl)}">
<meta property="og:image" content="${escapeAttr(s.url.replace(/\/$/, '') + '/og.svg')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(pageTitle)}">
<meta name="twitter:description" content="${escapeAttr(desc)}">
<meta name="twitter:image" content="${escapeAttr(s.url.replace(/\/$/, '') + '/og.svg')}">
<link rel="icon" href="${root}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}avatar.svg">
<link rel="alternate" type="application/rss+xml" title="${escapeAttr(s.title)} RSS" href="${root}rss.xml">
<link rel="stylesheet" href="${root}style.css">
<style>
/* 主题色由 site.config.json 注入。这里必须用带 html 前缀的选择器：
   否则 [data-theme="dark"] 与内联的 :root 特异性相同，而后加载的内联样式
   会永久压过深色主题的取值，导致深色模式下主题色换不掉。 */
html:root{--accent-cfg:${escapeAttr(accent)};--accent2-cfg:${escapeAttr(accent2)};--accent-cfg-dark:${escapeAttr(
    t.accentDark || '#7fb0d8'
  )};--accent2-cfg-dark:${escapeAttr(t.accent2Dark || '#e0b465')};}
html:root:not([data-theme="dark"]){--accent:var(--accent-cfg);--accent-2:var(--accent2-cfg);}
html[data-theme="dark"]{--accent:var(--accent-cfg-dark);--accent-2:var(--accent2-cfg-dark);}
</style>
<script>(function(){var d=document.documentElement;d.classList.add('js');var p='auto';try{p=localStorage.getItem('theme')||'auto';}catch(e){}var dark=p==='dark'||(p==='auto'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);d.setAttribute('data-theme',dark?'dark':'light');d.setAttribute('data-theme-pref',p);})();</script>
</head>
<body data-page="${escapeAttr(pageType)}"${extraBody}>
<a class="skip-link" href="#main">跳到主要内容</a>
<header class="site-header" id="siteHeader">
  <div class="wrap header-inner">
    <a class="brand" href="${root}index.html" aria-label="${escapeAttr(s.title)} 首页">
      <span class="brand-mark" aria-hidden="true">${escapeHtml(s.initials || 'ME')}</span>
      <span class="brand-text">
        <strong>${escapeHtml(s.title)}</strong>
        <small>${escapeHtml(s.tagline)}</small>
      </span>
    </a>
    <nav class="nav" id="nav" aria-label="主导航">${navLinks}</nav>
    <div class="header-actions">
      <button class="icon-btn" id="themeToggle" type="button" aria-label="切换深浅色主题" title="切换主题">
        <span class="icon-sun">${icon('sun')}</span><span class="icon-moon">${icon('moon')}</span>
      </button>
      <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-label="展开导航" aria-expanded="false" aria-controls="nav">
        <span class="burger" aria-hidden="true"></span>
      </button>
    </div>
  </div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
</header>
<main id="main">
${content}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <strong>${escapeHtml(s.title)}</strong>
      <p>${escapeHtml(config.footer && config.footer.note ? config.footer.note : '')}</p>
    </div>
    <div class="footer-meta">
      <div class="footer-links">
        ${(config.nav || []).map((n) => `<a href="${root}${escapeAttr(n.href)}">${escapeHtml(n.label)}</a>`).join('')}
        <a href="${root}rss.xml">RSS</a>
      </div>
      <p class="footer-copy">© ${s.startYear || new Date().getFullYear()}–<span id="year"></span> ${escapeHtml(
    s.author
  )}${s.license ? ` · ${escapeHtml(s.license)}` : ''}</p>
    </div>
  </div>
</footer>
<button class="to-top" id="toTop" type="button" aria-label="回到顶部">${icon('arrow', 20)}</button>
<script src="${root}main.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ pieces */

export function sectionHead({ eyebrow, title, moreHref, moreLabel = '全部' }) {
  return `<div class="section-head">
  <div>
    ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
    <h2 class="section-title">${escapeHtml(title)}</h2>
  </div>
  ${moreHref ? `<a class="more-link" href="${moreHref}">${escapeHtml(moreLabel)}${icon('arrow', 16)}</a>` : ''}
</div>`;
}

export function pubCard(pub, root, selfName) {
  const type = TYPE_LABEL[pub.type] || '';
  const search = [pub.title, pub.venue, (pub.tags || []).join(' '), (pub.authors || []).join(' ')].join(' ').toLowerCase();
  return `<article class="card pub-card" data-reveal data-search="${escapeAttr(search)}" data-tags="${escapeAttr(
    (pub.tags || []).join(',')
  )}">
  <div class="card-top">
    ${pub.venue ? `<span class="badge badge-venue">${escapeHtml(pub.venue)}</span>` : ''}
    ${type ? `<span class="badge badge-type">${escapeHtml(type)}</span>` : ''}
    ${pub.award ? `<span class="badge badge-award">${escapeHtml(pub.award)}</span>` : ''}
  </div>
  <h3 class="card-title">${escapeHtml(pub.title)}</h3>
  <p class="card-authors">${byline(pub.authors, pub.selfName || selfName)}</p>
  ${pub.summary ? `<p class="card-summary">${escapeHtml(pub.summary)}</p>` : ''}
  ${tagChips(pub.tags, root)}
  ${linkRow(pub.links, root)}
</article>`;
}

export function projectCard(project, root) {
  const statusLabel = { active: '进行中', archived: '已归档', wip: '构思中' }[project.status] || '';
  const search = [project.title, project.summary, (project.tags || []).join(' ')].join(' ').toLowerCase();
  return `<article class="card project-card" data-reveal data-search="${escapeAttr(search)}" data-tags="${escapeAttr(
    (project.tags || []).join(',')
  )}">
  <div class="card-top">
    <span class="badge badge-year">${escapeHtml(String(project.year || ''))}</span>
    ${statusLabel ? `<span class="badge badge-status status-${escapeAttr(project.status || '')}">${escapeHtml(statusLabel)}</span>` : ''}
  </div>
  <h3 class="card-title">${escapeHtml(project.title)}</h3>
  ${project.summary ? `<p class="card-summary">${escapeHtml(project.summary)}</p>` : ''}
  ${tagChips(project.tags, root)}
  ${linkRow(project.links, root)}
</article>`;
}

export function postCard(post, root) {
  const search = [post.title, post.summary, (post.tags || []).join(' ')].join(' ').toLowerCase();
  return `<article class="card post-card" data-reveal data-search="${escapeAttr(search)}" data-tags="${escapeAttr(
    (post.tags || []).join(',')
  )}">
  <a class="card-link" href="${root}posts/${escapeAttr(post.slug)}.html">
    <div class="card-top">
      <time class="badge badge-year" datetime="${escapeAttr(post.dateIso)}">${escapeHtml(formatDate(post.dateIso))}</time>
      <span class="badge badge-type">${escapeHtml(readingTime(post.raw))}</span>
    </div>
    <h3 class="card-title">${escapeHtml(post.title)}</h3>
    ${post.summary ? `<p class="card-summary">${escapeHtml(post.summary)}</p>` : ''}
  </a>
  ${tagChips(post.tags, root)}
</article>`;
}

export function heroSection({ config, root, featuredPub, featuredProject }) {
  const h = config.hero || {};
  const s = config.site;
  const stats = (h.stats || [])
    .map((st) => `<div class="stat"><strong>${escapeHtml(String(st.value))}</strong><span>${escapeHtml(st.label)}</span></div>`)
    .join('');
  const social = (config.social || [])
    .map(
      (item) =>
        `<a class="social-link" href="${escapeAttr(item.href)}"${
          /^https?:/.test(item.href) ? ' target="_blank" rel="noopener noreferrer"' : ''
        } title="${escapeAttr(item.label)}">${icon(item.icon || 'link', 18)}<span>${escapeHtml(item.label)}</span></a>`
    )
    .join('');

  return `<section class="hero">
  <div class="wrap hero-inner">
    <div class="hero-text" data-reveal>
      ${h.eyebrow ? `<p class="eyebrow">${escapeHtml(h.eyebrow)}</p>` : ''}
      <h1 class="hero-title">${escapeHtml(h.headline || s.title)}</h1>
      <p class="hero-intro">${escapeHtml(h.intro || s.description)}</p>
      <div class="hero-actions">
        ${
          h.primaryCta
            ? `<a class="btn btn-primary" href="${root}${escapeAttr(h.primaryCta.href)}">${escapeHtml(h.primaryCta.label)}${icon(
                'arrow',
                16
              )}</a>`
            : ''
        }
        ${
          h.secondaryCta
            ? `<a class="btn btn-ghost" href="${root}${escapeAttr(h.secondaryCta.href)}">${escapeHtml(h.secondaryCta.label)}</a>`
            : ''
        }
      </div>
      <div class="social-row">${social}</div>
    </div>
    <aside class="hero-side" data-reveal>
      <div class="id-card">
        <img class="id-avatar" src="${root}avatar.svg" alt="${escapeAttr(s.title)} 的头像" width="96" height="96">
        <div class="id-lines">
          <p class="id-name">${escapeHtml(s.nameEn || s.title)}</p>
          <p class="id-aff">${escapeHtml(s.affiliation || '')}</p>
          <p class="id-aff muted">${escapeHtml(s.location || '')}</p>
        </div>
        <div class="id-stats">${stats}</div>
      </div>
      ${
        featuredPub
          ? `<a class="mini-card" href="${root}publications.html">
        <span class="mini-label">最新论文</span>
        <strong>${escapeHtml(featuredPub.title)}</strong>
        <span class="mini-venue">${escapeHtml(featuredPub.venue || '')}</span>
      </a>`
          : ''
      }
      ${
        featuredProject
          ? `<a class="mini-card" href="${root}projects.html">
        <span class="mini-label">代表项目</span>
        <strong>${escapeHtml(featuredProject.title)}</strong>
        <span class="mini-venue">${escapeHtml(featuredProject.summary || '')}</span>
      </a>`
          : ''
      }
    </aside>
  </div>
</section>`;
}

export function pageHeader({ eyebrow, title, intro }) {
  return `<section class="page-header">
  <div class="wrap">
    ${eyebrow ? `<p class="eyebrow" data-reveal>${escapeHtml(eyebrow)}</p>` : ''}
    <h1 class="page-title" data-reveal>${escapeHtml(title)}</h1>
    ${intro ? `<p class="page-intro" data-reveal>${escapeHtml(intro)}</p>` : ''}
  </div>
</section>`;
}

export function filterBar({ root, placeholder = '搜索标题、摘要或标签…', tags = [] }) {
  return `<div class="filter-bar" id="filterBar">
  <div class="search-field">
    ${icon('link', 16)}
    <input type="search" id="siteSearch" placeholder="${escapeAttr(placeholder)}" aria-label="站内搜索" autocomplete="off">
    <button type="button" class="search-clear" id="searchClear" aria-label="清空搜索" hidden>×</button>
  </div>
  ${
    tags.length
      ? `<div class="chip-row" id="tagRow"><button type="button" class="chip is-active" data-tag="">全部</button>${tags
          .map((t) => `<button type="button" class="chip" data-tag="${escapeAttr(t.name)}">#${escapeHtml(t.name)} <em>${t.count}</em></button>`)
          .join('')}</div>`
      : ''
  }
</div>
<p class="filter-status" id="filterStatus" hidden></p>`;
}

export function gridSection({ id, cards, columns = 'auto', emptyMessage, filterState = false }) {
  // filterState 只在带搜索框的列表页打开，避免一个页面上出现多个 id="emptyState"
  const filterNote = filterState
    ? `<p class="empty-state" id="emptyState" hidden>没有匹配的内容，换个关键词试试。</p>`
    : '';

  if (!cards.length) {
    return `<div class="empty-note"><p>${escapeHtml(emptyMessage || '这里还没有内容。')}</p></div>
${filterNote}`;
  }

  return `<div class="card-grid cols-${columns}" id="${escapeAttr(id || 'grid')}">${cards.join('\n')}</div>
${filterNote}`;
}

/* ------------------------------------------------------------------- pages */

export function renderHome({ config, root, publications, projects, posts }) {
  const h = config.home || {};

  const featuredPubs = publications.filter((p) => p.featured);
  const pubs = (featuredPubs.length ? featuredPubs : publications).slice(0, h.publicationCount || 3);

  const featuredProjects = projects.filter((p) => p.featured);
  const projs = (featuredProjects.length ? featuredProjects : projects).slice(0, h.projectCount || 3);

  const latestPosts = posts.slice(0, h.postCount || 3);

  // 只渲染有内容的区块，底色按实际渲染顺序交替，不会出现连着两块同色
  const blocks = [];
  const wrapSection = (inner) =>
    `<section class="section${blocks.length % 2 ? ' section-alt' : ''}">
  <div class="wrap">
${inner}
  </div>
</section>`;

  if (pubs.length) {
    blocks.push(
      wrapSection(`    ${sectionHead({
        eyebrow: 'Selected Work',
        title: '精选作品',
        moreHref: `${root}publications.html`,
        moreLabel: '全部作品',
      })}
    ${gridSection({ id: 'pubGrid', cards: pubs.map((p) => pubCard(p, root, config.site.title)) })}`)
    );
  }

  if (projs.length) {
    blocks.push(
      wrapSection(`    ${sectionHead({
        eyebrow: 'Projects',
        title: '代表项目',
        moreHref: `${root}projects.html`,
        moreLabel: '全部项目',
      })}
    ${gridSection({ id: 'projectGrid', cards: projs.map((p) => projectCard(p, root)) })}`)
    );
  }

  if (latestPosts.length) {
    blocks.push(
      wrapSection(`    ${sectionHead({
        eyebrow: 'Notes',
        title: '最新笔记',
        moreHref: `${root}blog.html`,
        moreLabel: '全部笔记',
      })}
    ${gridSection({ id: 'postGrid', cards: latestPosts.map((p) => postCard(p, root)) })}`)
    );
  }

  // 一个全新的空站不该看起来像坏掉了：三块都空时留一段得体的说明
  const body = blocks.length
    ? blocks.join('\n')
    : `<section class="section">
  <div class="wrap wrap-narrow">
    <div class="blank-state" data-reveal>
      <p class="eyebrow">Under construction</p>
      <h2 class="section-title">内容还在路上</h2>
      <p class="page-intro">站点已经搭好了，作品、项目和笔记正一件件往里搬。可以先看看「关于」页。</p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="${root}about.html">关于我${icon('arrow', 16)}</a>
      </div>
    </div>
  </div>
</section>`;

  const content = `
${heroSection({ config, root, featuredPub: publications[0], featuredProject: projects[0] })}
${body}
`;

  return layout({
    config,
    root,
    active: 'home',
    pageType: 'home',
    description: config.site.description,
    canonical: '/',
    content,
  });
}

export function renderPublications({ config, root, publications, allTags }) {
  const content = `
${pageHeader({ eyebrow: 'Publications', title: '作品与成果', intro: '这里放我做过的作品和成果，按年份从新到旧排列。' })}
<section class="section">
  <div class="wrap">
    ${publications.length ? filterBar({ root, placeholder: '搜索标题、合作者、会议…', tags: allTags }) : ''}
    ${gridSection({
      id: 'pubGrid',
      cards: publications.map((p) => pubCard(p, root, config.site.title)),
      columns: 2,
      emptyMessage: '还没有添加作品。',
      filterState: publications.length > 0,
    })}
  </div>
</section>
`;
  return layout({
    config,
    root,
    active: 'publications',
    pageType: 'publications',
    title: '作品与成果',
    description: `${config.site.title} 的作品与成果列表。`,
    canonical: '/publications.html',
    content,
  });
}

export function renderProjects({ config, root, projects, allTags }) {
  const content = `
${pageHeader({ eyebrow: 'Projects', title: '项目与开源作品', intro: '做过的东西都放在这里，包括还在维护的、以及已经归档的。' })}
<section class="section">
  <div class="wrap">
    ${projects.length ? filterBar({ root, placeholder: '搜索项目名称、技术栈…', tags: allTags }) : ''}
    ${gridSection({
      id: 'projectGrid',
      cards: projects.map((p) => projectCard(p, root)),
      emptyMessage: '还没有添加项目。',
      filterState: projects.length > 0,
    })}
  </div>
</section>
`;
  return layout({
    config,
    root,
    active: 'projects',
    pageType: 'projects',
    title: '项目与开源作品',
    description: `${config.site.title} 的项目列表。`,
    canonical: '/projects.html',
    content,
  });
}

export function renderBlogIndex({ config, root, posts, allTags }) {
  const content = `
${pageHeader({ eyebrow: 'Notes', title: '笔记与随想', intro: '学习记录、踩坑笔记，和一些还不成熟的想法。' })}
<section class="section">
  <div class="wrap">
    ${posts.length ? filterBar({ root, placeholder: '搜索文章标题、摘要、标签…', tags: allTags }) : ''}
    ${gridSection({
      id: 'postGrid',
      cards: posts.map((p) => postCard(p, root)),
      emptyMessage: '还没有写过文章。',
      filterState: posts.length > 0,
    })}
  </div>
</section>
`;
  return layout({
    config,
    root,
    active: 'blog',
    pageType: 'blog',
    title: '笔记与随想',
    description: `${config.site.title} 的笔记与文章列表。`,
    canonical: '/blog.html',
    content,
  });
}

export function renderPost({ config, root, post, prev, next, related }) {
  const toc = post.toc || [];
  const hasToc = toc.length >= 2;
  const headWidth = hasToc ? 'wrap-article' : 'wrap-narrow';
  const body = `
<article class="article">
  <header class="article-head">
    <div class="wrap ${headWidth}">
      <a class="back-link" href="${root}blog.html">${icon('arrow', 15)} 返回笔记列表</a>
      <h1 class="article-title" data-reveal>${escapeHtml(post.title)}</h1>
      ${post.summary ? `<p class="article-summary" data-reveal>${escapeHtml(post.summary)}</p>` : ''}
      <div class="article-meta" data-reveal>
        <time datetime="${escapeAttr(post.dateIso)}">${escapeHtml(formatDate(post.dateIso, 'cn'))}</time>
        <span class="dot"></span><span>${escapeHtml(readingTime(post.raw))}</span>
        ${post.updated ? `<span class="dot"></span><span>更新于 ${escapeHtml(formatDate(post.updated))}</span>` : ''}
      </div>
      ${tagChips(post.tags, root)}
    </div>
  </header>
  <div class="wrap article-body-wrap${hasToc ? ' has-toc' : ''}">
    <div class="article-body" data-reveal>
${post.html}
    </div>
    ${
      hasToc
        ? `<aside class="article-toc">
      <p class="toc-title">目录</p>
      <nav id="tocNav">${toc
        .map((t) => `<a class="toc-link level-${t.level}" href="#${t.id}">${escapeHtml(t.text)}</a>`)
        .join('')}</nav>
    </aside>`
        : ''
    }
  </div>
  <footer class="wrap ${headWidth} article-foot">
    <div class="prev-next">
      ${
        prev
          ? `<a class="pn-card" href="${root}posts/${escapeAttr(prev.slug)}.html"><span>上一篇</span><strong>${escapeHtml(
              prev.title
            )}</strong></a>`
          : '<span class="pn-card is-empty"></span>'
      }
      ${
        next
          ? `<a class="pn-card pn-next" href="${root}posts/${escapeAttr(next.slug)}.html"><span>下一篇</span><strong>${escapeHtml(
              next.title
            )}</strong></a>`
          : '<span class="pn-card is-empty"></span>'
      }
    </div>
    ${
      related && related.length
        ? `<div class="related"><p class="toc-title">相关文章</p><ul>${related
            .map((r) => `<li><a href="${root}posts/${escapeAttr(r.slug)}.html">${escapeHtml(r.title)}</a></li>`)
            .join('')}</ul></div>`
        : ''
    }
  </footer>
</article>
`;
  return layout({
    config,
    root,
    active: 'blog',
    pageType: 'post',
    title: post.title,
    description: post.summary || config.site.description,
    canonical: `/posts/${post.slug}.html`,
    ogType: 'article',
    content: body,
  });
}

export function renderAbout({ config, root, aboutHtml }) {
  const s = config.site;
  const content = `
${pageHeader({ eyebrow: 'About', title: `关于 ${s.title}`, intro: s.tagline })}
<section class="section">
  <div class="wrap about-grid">
    <aside class="about-side" data-reveal>
      <img class="about-avatar" src="${root}avatar.svg" alt="${escapeAttr(s.title)}" width="128" height="128">
      <ul class="fact-list">
        <li><span>职位</span><strong>${escapeHtml(s.affiliation || '—')}</strong></li>
        <li><span>所在地</span><strong>${escapeHtml(s.location || '—')}</strong></li>
        <li><span>邮箱</span><strong><a href="mailto:${escapeAttr(s.email)}">${escapeHtml(s.email)}</a></strong></li>
      </ul>
      <div class="social-col">${(config.social || [])
        .map(
          (item) =>
            `<a class="social-link" href="${escapeAttr(item.href)}"${
              /^https?:/.test(item.href) ? ' target="_blank" rel="noopener noreferrer"' : ''
            }>${icon(item.icon || 'link', 18)}<span>${escapeHtml(item.label)}</span></a>`
        )
        .join('')}</div>
    </aside>
    <div class="about-body article-body" data-reveal>
${aboutHtml}
    </div>
  </div>
</section>
`;
  return layout({
    config,
    root,
    active: 'about',
    pageType: 'about',
    title: `关于 ${s.title}`,
    description: `关于 ${s.title}：${s.tagline}`,
    canonical: '/about.html',
    content,
  });
}

export function renderTagPage({ config, root, tag, cards, count }) {
  const content = `
${pageHeader({ eyebrow: 'Tag', title: `#${tag}`, intro: `共 ${count} 条内容` })}
<section class="section">
  <div class="wrap">
    <div class="chip-row" style="margin-bottom:24px"><a class="chip" href="${root}tags.html">← 全部标签</a></div>
    ${gridSection({ id: 'tagGrid', cards })}
  </div>
</section>
`;
  return layout({
    config,
    root,
    active: 'blog',
    pageType: 'tag',
    title: `#${tag}`,
    description: `标签 ${tag} 下的全部内容。`,
    canonical: `/tags/${encodeURIComponent(tag)}.html`,
    content,
  });
}

export function renderTagsIndex({ config, root, tags }) {
  const max = Math.max(1, ...tags.map((t) => t.count));

  const cloud = tags.length
    ? `<div class="tag-cloud" data-reveal>
      ${tags
        .map((t) => {
          const size = 0.95 + (t.count / max) * 0.95;
          return `<a class="tag-cloud-item" style="font-size:${size.toFixed(2)}rem" href="${root}tags/${encodeURIComponent(
            t.name
          )}.html">#${escapeHtml(t.name)}<sup>${t.count}</sup></a>`;
        })
        .join('')}
    </div>`
    : `<div class="empty-note"><p>还没有标签。给内容加上标签之后，这里会自动生成索引。</p></div>`;

  const content = `
${pageHeader({
    eyebrow: 'Tags',
    title: '全部标签',
    intro: tags.length ? `共 ${tags.length} 个标签，字号越大代表内容越多。` : '',
  })}
<section class="section">
  <div class="wrap">
    ${cloud}
  </div>
</section>
`;
  return layout({
    config,
    root,
    active: 'blog',
    pageType: 'tags',
    title: '全部标签',
    description: '站内全部标签索引。',
    canonical: '/tags.html',
    content,
  });
}

export function render404({ config, root }) {
  const content = `<section class="section notfound">
  <div class="wrap wrap-narrow">
    <p class="eyebrow">404</p>
    <h1 class="page-title">这个页面走丢了</h1>
    <p class="page-intro">链接可能已经失效，或者我从没写过这个页面。回到首页看看别的？</p>
    <div class="hero-actions"><a class="btn btn-primary" href="${root}index.html">回到首页${icon('arrow', 16)}</a>
    <a class="btn btn-ghost" href="${root}blog.html">翻翻笔记</a></div>
  </div>
</section>`;
  return layout({ config, root, active: '', pageType: '404', title: '404', content });
}

/* ------------------------------------------------------------- assets & feeds */

export function avatarSvg(config) {
  const accent = (config.theme && config.theme.accent) || '#2c5f8d';
  const accent2 = (config.theme && config.theme.accent2) || '#b7791f';
  const initials = escapeHtml(config.site.initials || 'ME');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="${escapeAttr(
    config.site.title
  )} 的头像">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="${accent2}"/>
    </linearGradient>
    <clipPath id="c"><circle cx="100" cy="100" r="100"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="200" height="200" fill="url(#g)"/>
    <g opacity="0.16" fill="#fff">
      <circle cx="34" cy="42" r="52"/><circle cx="172" cy="158" r="72"/>
    </g>
  </g>
  <text x="100" y="100" text-anchor="middle" dominant-baseline="central" font-family="Georgia, 'Times New Roman', serif" font-size="76" font-weight="700" fill="#ffffff" letter-spacing="2">${initials}</text>
</svg>
`;
}

export function faviconSvg(config) {
  const accent = (config.theme && config.theme.accent) || '#2c5f8d';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="${accent}"/>
  <text x="32" y="33" text-anchor="middle" dominant-baseline="central" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#fff">${escapeHtml(
    (config.site.initials || 'ME').slice(0, 2)
  )}</text>
</svg>
`;
}

export function ogSvg(config) {
  const s = config.site;
  const accent = (config.theme && config.theme.accent) || '#2c5f8d';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs><linearGradient id="og" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${accent}"/><stop offset="100%" stop-color="#101418"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#og)"/>
  <circle cx="1040" cy="120" r="220" fill="#ffffff" opacity="0.06"/>
  <circle cx="120" cy="560" r="180" fill="#ffffff" opacity="0.05"/>
  <text x="80" y="250" font-family="Georgia, 'Songti SC', serif" font-size="72" font-weight="700" fill="#ffffff">${escapeHtml(
    s.title
  )}</text>
  <text x="80" y="330" font-family="'Helvetica Neue', Arial, sans-serif" font-size="34" fill="#ffffff" opacity="0.78">${escapeHtml(
    s.tagline
  )}</text>
  <text x="80" y="520" font-family="'Helvetica Neue', Arial, sans-serif" font-size="26" fill="#ffffff" opacity="0.55">${escapeHtml(
    s.url.replace(/^https?:\/\//, '')
  )}</text>
</svg>
`;
}

export function renderRss({ config, posts, absolute }) {
  const s = config.site;
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeHtml(p.title)}</title>
      <link>${absolute(`/posts/${p.slug}.html`)}</link>
      <guid isPermaLink="true">${absolute(`/posts/${p.slug}.html`)}</guid>
      <pubDate>${new Date(p.dateIso).toUTCString()}</pubDate>
      <description>${escapeHtml(p.summary || '')}</description>
      ${(p.tags || []).map((t) => `<category>${escapeHtml(t)}</category>`).join('\n      ')}
    </item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(s.title)}</title>
    <link>${s.url}</link>
    <description>${escapeHtml(s.description)}</description>
    <language>${escapeHtml(s.lang)}</language>
    <atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

export function renderSitemap({ config, urls, absolute }) {
  const body = urls
    .map((u) => `  <url><loc>${absolute(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority || 0.5}</priority></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
