#!/usr/bin/env node
// check.mjs —— 构建产物自检：死链扫描 + 模板残留检查 + RSS/Sitemap 结构检查。
// 用法：node check.mjs   （建议每次改完内容后跑一遍）

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const DIST = join(ROOT, 'dist');

const red = (s) => `\u001b[31m${s}\u001b[0m`;
const green = (s) => `\u001b[32m${s}\u001b[0m`;
const dim = (s) => `\u001b[2m${s}\u001b[0m`;
const yellow = (s) => `\u001b[33m${s}\u001b[0m`;

if (!existsSync(DIST)) {
  console.error(red('dist/ 不存在，先运行 node build.mjs'));
  process.exit(1);
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => extname(f) === '.html');

let errors = 0;
let warnings = 0;
const broken = [];

const IGNORE_ATTRS = /^(https?:|mailto:|tel:|data:|javascript:|#)/i;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const relFromDist = relative(DIST, file).replace(/\\/g, '/');

  // 1) 内部链接 / 资源是否存在（href 里可能是 percent-encoded，先解码再比对磁盘文件名）
  const attrRe = /(?:href|src)="([^"]+)"/g;
  let m;
  while ((m = attrRe.exec(html))) {
    const raw = m[1];
    if (!raw || IGNORE_ATTRS.test(raw)) continue;
    let pathOnly = raw.split('#')[0].split('?')[0];
    try {
      pathOnly = decodeURIComponent(pathOnly);
    } catch (err) {
      /* 保持原样 */
    }
    const target = resolve(dirname(file), pathOnly);
    if (!target.startsWith(DIST)) {
      broken.push({ from: relFromDist, to: raw, reason: '跳出了 dist 目录' });
      continue;
    }
    if (!existsSync(target)) {
      const alt = target + '.html';
      if (existsSync(alt)) continue;
      const altIndex = join(target, 'index.html');
      if (existsSync(altIndex)) continue;
      broken.push({ from: relFromDist, to: raw, reason: '目标文件不存在' });
    }
  }

  // 2) 模板残留（代码块里合法出现 ${...} / undefined，先剥掉 pre 再查）
  const scannable = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code[\s\S]*?<\/code>/g, '');
  const residue = scannable.match(/\bundefined\b|\[object Object\]|\$\{[^}]+\}|NaN(?![a-zA-Z])/g);
  if (residue) {
    for (const r of new Set(residue)) {
      broken.push({ from: relFromDist, to: r, reason: '疑似模板残留' });
    }
  }

  // 3) 结构性检查
  if (!/<title>[^<]+<\/title>/.test(html)) broken.push({ from: relFromDist, to: 'title', reason: '缺少 <title>' });
  if (!/<meta name="description" content="[^"]+">/.test(html))
    broken.push({ from: relFromDist, to: 'description', reason: '缺少 meta description' });
  if (!/<html lang="/.test(html)) broken.push({ from: relFromDist, to: 'lang', reason: '缺少 lang 属性' });
}

// 4) XML 可用性
for (const name of ['rss.xml', 'sitemap.xml']) {
  const p = join(DIST, name);
  if (!existsSync(p)) {
    broken.push({ from: name, to: name, reason: '文件缺失' });
    continue;
  }
  const xml = readFileSync(p, 'utf8');
  if (!xml.trimStart().startsWith('<?xml')) broken.push({ from: name, to: name, reason: '缺少 XML 声明' });
  const open = (xml.match(/<item>/g) || []).length + (xml.match(/<url>/g) || []).length;
  const close = (xml.match(/<\/item>/g) || []).length + (xml.match(/<\/url>/g) || []).length;
  if (open !== close) broken.push({ from: name, to: name, reason: `标签数量不匹配 (${open}/${close})` });
}

// 5) 图片资源存在
for (const asset of ['style.css', 'main.js', 'avatar.svg', 'favicon.svg', 'og.svg', 'robots.txt']) {
  if (!existsSync(join(DIST, asset))) broken.push({ from: '(assets)', to: asset, reason: '资源缺失' });
}

console.log(`\n检查 ${htmlFiles.length} 个 HTML 文件、${files.length} 个产物文件\n`);

if (broken.length) {
  errors = broken.length;
  console.log(red(`✗ 发现 ${broken.length} 个问题：`));
  for (const b of broken.slice(0, 60)) {
    console.log(`  ${red('·')} ${dim(b.from)}  →  ${b.to}  ${dim('(' + b.reason + ')')}`);
  }
  if (broken.length > 60) console.log(dim(`  … 还有 ${broken.length - 60} 条`));
} else {
  console.log(green('✓ 所有内部链接、资源引用、meta 标签均正常'));
}

// 6) 信息提示
const totalBytes = files.reduce((sum, f) => sum + statSync(f).size, 0);
console.log(dim(`\n  产物总大小：${(totalBytes / 1024).toFixed(1)} KB`));
console.log(dim(`  平均每页：${(totalBytes / 1024 / htmlFiles.length).toFixed(1)} KB（含图片资源）`));

if (warnings) console.log(yellow(`\n  ${warnings} 条警告`));

console.log('');
process.exit(errors ? 1 : 0);
