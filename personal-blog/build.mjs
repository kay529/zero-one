#!/usr/bin/env node
// build.mjs —— 构建入口。零 npm 依赖，直接用 node build.mjs 运行。
// 读取 site.config.json + content/，输出完整静态站点到 dist/。

import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
  existsSync,
  copyFileSync,
} from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderMarkdown } from './lib/markdown.mjs';
import * as R from './lib/render.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const CONTENT = join(ROOT, 'content');
const STATIC = join(ROOT, 'static');

const c = {
  reset: '\u001b[0m',
  dim: '\u001b[2m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  cyan: '\u001b[36m',
  red: '\u001b[31m',
};

const log = (...a) => console.log(...a);
const rel = (p) => p.replace(ROOT, '.').replace(/\\/g, '/');

/* ------------------------------------------------------------------ helpers */

function readJSON(path, fallback) {
  if (!existsSync(path)) {
    log(`${c.yellow}  ! 缺少 ${rel(path)}，使用空数据${c.reset}`);
    return fallback;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    log(`${c.red}  ✗ ${rel(path)} JSON 解析失败：${err.message}${c.reset}`);
    process.exitCode = 1;
    return fallback;
  }
}

function unquote(value) {
  const s = String(value).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}

// 极简 YAML frontmatter 解析：key: value / key: [a, b] / key: 换行 - 列表项
function parseFrontmatter(raw) {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---[ \t]*\n?/);
  if (!match) return { data: {}, body: text };

  const data = {};
  let currentKey = null;
  for (const line of match[1].split('\n')) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = data[currentKey] ? [data[currentKey]] : [];
      data[currentKey].push(unquote(listItem[1]));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    const value = kv[2].trim();
    currentKey = key;

    if (value === '') {
      data[key] = '';
    } else if (/^\[.*\]$/.test(value)) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => unquote(s))
        .filter(Boolean);
    } else if (value === 'true' || value === 'false') {
      data[key] = value === 'true';
    } else {
      data[key] = unquote(value);
    }
  }
  return { data, body: text.slice(match[0].length) };
}

function normalizeDate(value, fallbackName = '') {
  const fromName = fallbackName.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const raw = value || (fromName ? fromName[0] : '');
  if (!raw) return new Date().toISOString().slice(0, 10);
  const m = String(raw).match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}`;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
}

function plainText(md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+.*$/gm, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function autoSummary(md, max = 96) {
  const text = plainText(md);
  return text.length > max ? text.slice(0, max) + '…' : text;
}

function write(relPath, content) {
  const full = join(DIST, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
}

function countTags(map, tags) {
  for (const t of tags || []) {
    if (!t) continue;
    map.set(t, (map.get(t) || 0) + 1);
  }
}

/* --------------------------------------------------------------------- load */

const config = readJSON(join(ROOT, 'site.config.json'), {});
if (!config.site) {
  log(`${c.red}site.config.json 缺少 site 字段，无法构建。${c.reset}`);
  process.exit(1);
}

const publications = readJSON(join(CONTENT, 'publications.json'), []).sort(  (a, b) => (b.year || 0) - (a.year || 0) || String(a.title).localeCompare(String(b.title))
);
const projects = readJSON(join(CONTENT, 'projects.json'), []).sort((a, b) => (b.year || 0) - (a.year || 0));

const postDir = join(CONTENT, 'posts');
const postFiles = existsSync(postDir) ? readdirSync(postDir).filter((f) => extname(f).toLowerCase() === '.md') : [];

const posts = postFiles
  .map((file) => {
    const raw = readFileSync(join(postDir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    const base = basename(file, extname(file));
    const dateIso = normalizeDate(data.date, base);
    const slug = data.slug || base.replace(/^\d{4}-\d{2}-\d{2}[-_]?/, '') || base;
    const md = renderMarkdown(body);
    return {
      slug,
      title: data.title || slug,
      dateIso,
      updated: data.updated ? normalizeDate(data.updated) : '',
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      summary: data.summary || autoSummary(body),
      draft: data.draft === true,
      raw: body,
      html: md.html,
      toc: md.toc,
    };
  })
  .filter((p) => {
    if (!p.draft) return true;
    log(`${c.dim}  - 跳过早稿：${p.slug}${c.reset}`);
    return false;
  })
  .sort((a, b) => (a.dateIso < b.dateIso ? 1 : a.dateIso > b.dateIso ? -1 : 0));

const aboutSource = existsSync(join(CONTENT, 'about.md')) ? readFileSync(join(CONTENT, 'about.md'), 'utf8') : '# 关于\n\n（在 content/about.md 里写自我介绍）';
const aboutHtml = renderMarkdown(parseFrontmatter(aboutSource).body).html;

// 简历 PDF 还没放进来时，把首页那个按钮指到在线简历页，避免出现死链
const hasCv = existsSync(join(STATIC, 'cv.pdf'));
const cvWanted = !!(config.hero && config.hero.secondaryCta && /\.pdf$/i.test(config.hero.secondaryCta.href || ''));
if (cvWanted && !hasCv) {
  config.hero.secondaryCta = { label: '在线简历', href: 'about.html' };
}

/* ------------------------------------------------------------------ tag set */

const tagCount = new Map();
publications.forEach((p) => countTags(tagCount, p.tags));
projects.forEach((p) => countTags(tagCount, p.tags));
posts.forEach((p) => countTags(tagCount, p.tags));
const allTags = [...tagCount.entries()]
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));

/* -------------------------------------------------------------------- build */

log(`\n${c.cyan}▶ 构建 ${config.site.title}${c.reset}`);
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// 静态资源
if (existsSync(STATIC)) {
  for (const f of readdirSync(STATIC)) {
    copyFileSync(join(STATIC, f), join(DIST, f));
  }
  log(`${c.green}  ✓${c.reset} 复制静态资源 (${readdirSync(STATIC).length})`);
}

// 生成图片资源
write('avatar.svg', R.avatarSvg(config));
write('favicon.svg', R.faviconSvg(config));
write('og.svg', R.ogSvg(config));

const absolute = (p) => config.site.url.replace(/\/$/, '') + p;

// 主页面
write('index.html', R.renderHome({ config, root: '', publications, projects, posts }));
write(
  'publications.html',
  R.renderPublications({ config, root: '', publications, allTags })
);
write('projects.html', R.renderProjects({ config, root: '', projects, allTags }));
write('blog.html', R.renderBlogIndex({ config, root: '', posts, allTags }));
write('about.html', R.renderAbout({ config, root: '', aboutHtml }));
write('tags.html', R.renderTagsIndex({ config, root: '', tags: allTags }));
write('404.html', R.render404({ config, root: '' }));

// 文章详情
posts.forEach((post, idx) => {
  const related = posts
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);
  write(
    join('posts', `${post.slug}.html`),
    R.renderPost({
      config,
      root: '../',
      post,
      prev: posts[idx + 1] || null,
      next: posts[idx - 1] || null,
      related,
    })
  );
});

// 标签页
for (const tag of allTags) {
  const cards = [
    ...publications.filter((p) => (p.tags || []).includes(tag.name)).map((p) => R.pubCard(p, '../', config.site.title)),
    ...projects.filter((p) => (p.tags || []).includes(tag.name)).map((p) => R.projectCard(p, '../')),
    ...posts.filter((p) => p.tags.includes(tag.name)).map((p) => R.postCard(p, '../')),
  ];
  write(
    join('tags', `${tag.name}.html`),
    R.renderTagPage({ config, root: '../', tag: tag.name, cards, count: cards.length })
  );
}

// RSS / sitemap / robots
write('rss.xml', R.renderRss({ config, posts, absolute }));
write(
  'sitemap.xml',
  R.renderSitemap({
    config,
    absolute,
    urls: [
      { loc: '/', priority: 1.0 },
      { loc: '/publications.html', priority: 0.9 },
      { loc: '/projects.html', priority: 0.9 },
      { loc: '/blog.html', priority: 0.8 },
      { loc: '/about.html', priority: 0.7 },
      { loc: '/tags.html', priority: 0.4 },
      ...posts.map((p) => ({ loc: `/posts/${p.slug}.html`, lastmod: p.updated || p.dateIso, priority: 0.7 })),
      ...allTags.map((t) => ({ loc: `/tags/${t.name}.html`, priority: 0.3 })),
    ],
  })
);
write(
  'robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`
);

/* ------------------------------------------------------------------ summary */

const todo = [];
const siteCfg = config.site;
if (/你的名字|Your Name/.test(siteCfg.title)) todo.push('site.title / site.author —— 换成你的名字');
if (/your-domain\.com/.test(siteCfg.url)) todo.push('site.url —— 换成你的真实域名（影响 SEO、RSS、sitemap）');
if (/you@example\.com/.test(siteCfg.email)) todo.push('site.email —— 换成你的邮箱');
if (/yourname/.test(JSON.stringify(config.social || []))) todo.push('social[].href —— 换成你真实的 GitHub / Scholar / ORCID 链接');
if (siteCfg.initials === 'ME') todo.push('site.initials —— 头像里的字母缩写');
if (/某某大学/.test(siteCfg.affiliation || '')) todo.push('site.affiliation / site.location / hero.stats');

log(`${c.green}  ✓${c.reset} 生成 ${readdirSync(DIST).length} 个顶层文件，${posts.length} 篇文章，${allTags.length} 个标签`);

if (cvWanted && !hasCv) {
  log(`${c.dim}  - 提示：site.config.json 里的简历按钮指向 cv.pdf，但 static/cv.pdf 不存在，${c.reset}`);
  log(`${c.dim}    已临时改为指向「关于」页；把 PDF 放进去就会自动恢复。${c.reset}`);
}

const contentEmpty = !publications.length && !projects.length && !posts.length;
if (contentEmpty) {
  log(`${c.dim}  - 内容还是空的。往 content/ 里填东西，照着 content/README.md 的格式写，${c.reset}`);
  log(`${c.dim}    然后重新运行 node build.mjs 即可。${c.reset}`);
}

if (todo.length) {
  log(`\n${c.yellow}  ⚠ 上线前请先在 site.config.json 里替换这些占位内容：${c.reset}`);
  todo.forEach((t) => log(`${c.yellow}      · ${t}${c.reset}`));
}

log(`\n${c.cyan}  预览：${c.reset}node preview.mjs  →  http://localhost:4321`);
log(`${c.cyan}  输出：${c.reset}${rel(DIST)}\n`);
