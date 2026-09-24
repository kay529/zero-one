// lib/markdown.mjs
// 一个零依赖的 Markdown -> HTML 渲染器。
// 支持：标题(带锚点/TOC)、围栏代码块、行内代码、粗体/斜体/删除线、
//      链接、图片、无序/有序列表(含嵌套)、引用块、分隔线、表格。
// 不支持：HTML 内联、脚注、数学公式（按需扩展即可）。

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, '&#39;');
}

export function slugify(text) {
  const slug = String(text)
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'section';
}

const BLANK = /^\s*$/;
const HR = /^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/;

/* ------------------------------------------------------- 轻量语法高亮（构建期）
   零依赖实现：注释 / 字符串 / 数字 / 关键字四类 token。
   在 Markdown 渲染阶段就完成，产出纯静态 HTML，浏览器不需要任何高亮脚本。 */

const HL_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
  'break', 'continue', 'class', 'extends', 'new', 'this', 'super', 'typeof', 'instanceof', 'import', 'from',
  'export', 'as', 'await', 'async', 'try', 'catch', 'finally', 'throw', 'yield', 'delete', 'in', 'of', 'void',
  'static', 'public', 'private', 'protected', 'interface', 'type', 'enum', 'implements', 'package', 'final',
  'struct', 'impl', 'trait', 'fn', 'mut', 'pub', 'use', 'match', 'where', 'loop', 'unsafe',
  'def', 'elif', 'lambda', 'pass', 'raise', 'except', 'global', 'nonlocal', 'del', 'assert', 'with', 'self',
  'None', 'True', 'False', 'print', 'int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple',
  'func', 'defer', 'go', 'chan', 'map', 'range', 'select', 'nil', 'nullptr',
  'null', 'undefined', 'true', 'false', 'local', 'then', 'fi', 'done', 'esac', 'echo', 'require',
];

const HL_COMMENT_STYLE = {
  slash: ['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx', 'c', 'cpp', 'c++', 'h', 'hpp', 'java', 'go',
    'golang', 'rust', 'rs', 'php', 'swift', 'kotlin', 'scala', 'css', 'scss', 'less', 'json', 'dart', 'groovy',
    'proto', 'protobuf', 'graphql'],
  hash: ['py', 'python', 'sh', 'bash', 'shell', 'zsh', 'yaml', 'yml', 'rb', 'ruby', 'toml', 'ini', 'conf',
    'perl', 'r', 'makefile', 'dockerfile', 'env', 'properties', 'gitignore', 'plist'],
  dash: ['sql', 'lua', 'haskell', 'hs', 'elm'],
};

const HL_COMMENT_SRC = {
  slash: '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/',
  hash: '#[^\\n]*',
  dash: '--[^\\n]*',
};

// 用单引号拼接，避免模板字符串吞掉反引号
const HL_STR_SRC =
  '"(?:\\\\.|[^"\\\\])*"' + '|' + "'(?:\\\\.|[^'\\\\])*'" + '|' + '`(?:\\\\.|[^`\\\\])*`';

function commentStyleFor(lang) {
  const key = String(lang || '').toLowerCase();
  for (const style of Object.keys(HL_COMMENT_STYLE)) {
    if (HL_COMMENT_STYLE[style].includes(key)) return style;
  }
  return null;
}

export function highlightCode(code, lang) {
  const escaped = escapeHtml(code);
  const style = commentStyleFor(lang);
  if (!style) {
    // 未知语言（含纯文本）：只转义，不猜语法
    return escaped;
  }
  const commentSrc = HL_COMMENT_SRC[style];
  const re = new RegExp(
    [
      `(${commentSrc})`,
      `(${HL_STR_SRC})`,
      '(\\b\\d+(?:\\.\\d+)?\\b)',
      `(\\b(?:${HL_KEYWORDS.join('|')})\\b)`,
    ].join('|'),
    'g'
  );
  return escaped.replace(re, (match, comment, str, num) => {
    if (comment) return `<span class="tok-com">${match}</span>`;
    if (str) return `<span class="tok-str">${match}</span>`;
    if (num) return `<span class="tok-num">${match}</span>`;
    return `<span class="tok-kw">${match}</span>`;
  });
}

const FENCE = /^\s*(`{3,}|~{3,})\s*([\w+#.-]*)\s*$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const QUOTE = /^\s{0,3}>\s?/;
const UL = /^(\s*)[-*+]\s+(.*)$/;
const OL = /^(\s*)\d+[.)]\s+(.*)$/;

function indentOf(line) {
  const m = line.match(/^(\s*)/);
  return m ? m[1].replace(/\t/g, '  ').length : 0;
}

function matchItem(line) {
  const ul = line.match(UL);
  if (ul) return { indent: ul[1].replace(/\t/g, '  ').length, ordered: false, text: ul[2] };
  const ol = line.match(OL);
  if (ol) return { indent: ol[1].replace(/\t/g, '  ').length, ordered: true, text: ol[2] };
  return null;
}

function stripInline(text) {
  return String(text)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*|__|\*|_|~~/g, '')
    .trim();
}

// 行内元素渲染。先转义，再用占位符保护行内代码，避免二次解析。
function inline(text) {
  const codes = [];
  let s = escapeHtml(text);

  s = s.replace(/`([^`]+)`/g, (_m, code) => {
    codes.push(code);
    return `\u0000CODE${codes.length - 1}\u0000`;
  });

  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_m, alt, src, title) => {
    const t = title ? ` title="${title}"` : '';
    return `<img src="${src}" alt="${alt}"${t} loading="lazy" decoding="async">`;
  });

  s = s.replace(/\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_m, label, href, title) => {
    const t = title ? ` title="${title}"` : '';
    const external = /^https?:\/\//.test(href) && !href.includes('your-domain.com');
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${t}${attrs}>${label}</a>`;
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  s = s.replace(/(^|[^_\w])_([^_\s][^_]*?)_/g, '$1<em>$2</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  s = s.replace(/\u0000CODE(\d+)\u0000/g, (_m, idx) => `<code>${codes[Number(idx)]}</code>`);
  return s;
}

function isTableSeparator(line) {
  return /^\s{0,3}\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && /-/.test(line) && line.includes('|');
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function alignmentsOf(separator) {
  return splitRow(separator).map((c) => {
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return null;
  });
}

function parseListBlock(lines, start) {
  const n = lines.length;
  const first = matchItem(lines[start]);
  const baseIndent = first.indent;
  const ordered = first.ordered;
  const items = [];
  let i = start;

  while (i < n) {
    if (BLANK.test(lines[i])) {
      let j = i;
      while (j < n && BLANK.test(lines[j])) j++;
      if (j < n && matchItem(lines[j]) && indentOf(lines[j]) === baseIndent) {
        i = j;
        continue;
      }
      break;
    }
    const m = matchItem(lines[i]);
    if (!m) break;
    if (m.indent < baseIndent) break;
    if (m.indent > baseIndent) {
      const sub = parseListBlock(lines, i);
      if (items.length) items[items.length - 1].children.push(sub.html);
      i = sub.next;
      continue;
    }
    if (m.ordered !== ordered) break;

    const content = [m.text];
    i++;
    while (i < n) {
      const line = lines[i];
      if (BLANK.test(line)) {
        let j = i;
        while (j < n && BLANK.test(lines[j])) j++;
        if (j < n && !matchItem(lines[j]) && indentOf(lines[j]) > baseIndent) {
          content.push('');
          i++;
          continue;
        }
        break;
      }
      if (matchItem(line)) break;
      if (indentOf(line) > baseIndent) {
        content.push(line.trim());
        i++;
        continue;
      }
      break;
    }
    items.push({ text: content.join('\n').trim(), children: [] });
  }

  const tag = ordered ? 'ol' : 'ul';
  const body = items
    .map((item) => {
      const inner = item.text ? itemInner(item.text) : '';
      return `<li>${inner}${item.children.join('')}</li>`;
    })
    .join('');
  return { html: `<${tag}>${body}</${tag}>`, next: i };
}

function itemInner(text) {
  if (!text.includes('\n')) return inline(text);
  const rendered = renderMarkdown(text).html.trim();
  const single = rendered.match(/^<p>([\s\S]*)<\/p>$/);
  return single ? single[1] : rendered;
}

function isBlockStart(lines, i) {
  const line = lines[i];
  if (BLANK.test(line)) return true;
  if (FENCE.test(line)) return true;
  if (HEADING.test(line)) return true;
  if (HR.test(line)) return true;
  if (QUOTE.test(line)) return true;
  if (matchItem(line)) return true;
  if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) return true;
  return false;
}

export function renderMarkdown(source) {
  const lines = String(source == null ? '' : source).replace(/\r\n?/g, '\n').split('\n');
  const n = lines.length;
  const html = [];
  const toc = [];
  const used = new Map();
  let i = 0;

  const uniqueId = (base) => {
    const count = used.get(base) || 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  while (i < n) {
    const line = lines[i];

    if (BLANK.test(line)) {
      i++;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const closeRe = fence[1][0] === '`' ? /^\s*`{3,}\s*$/ : /^\s*~{3,}\s*$/;
      const lang = fence[2] || '';
      const buf = [];
      i++;
      while (i < n && !closeRe.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      if (i < n) i++;
      const langAttr = lang ? ` data-lang="${escapeAttr(lang)}"` : '';
      const codeClass = lang ? ` class="language-${escapeAttr(lang)}"` : '';
      html.push(
        `<div class="code-block"${langAttr}><button class="code-copy" type="button" data-copy>复制</button><pre><code${codeClass}>${highlightCode(
          buf.join('\n'),
          lang
        )}</code></pre></div>`
      );
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length;
      const raw = heading[2];
      const id = uniqueId(slugify(stripInline(raw)));
      const plain = stripInline(raw);
      if (level === 2 || level === 3) toc.push({ level, text: plain, id });
      html.push(
        `<h${level} id="${id}">${inline(raw)}<a class="heading-anchor" href="#${id}" aria-label="链接到此节">#</a></h${level}>`
      );
      i++;
      continue;
    }

    if (HR.test(line)) {
      html.push('<hr>');
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const buf = [];
      while (i < n && !BLANK.test(lines[i]) && QUOTE.test(lines[i])) {
        buf.push(lines[i].replace(QUOTE, ''));
        i++;
      }
      html.push(`<blockquote>${renderMarkdown(buf.join('\n')).html}</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < n && isTableSeparator(lines[i + 1])) {
      const head = splitRow(line);
      const aligns = alignmentsOf(lines[i + 1]);
      i += 2;
      const rows = [];
      while (i < n && !BLANK.test(lines[i]) && lines[i].includes('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const th = head
        .map((c, k) => {
          const a = aligns[k] ? ` style="text-align:${aligns[k]}"` : '';
          return `<th${a}>${inline(c)}</th>`;
        })
        .join('');
      const tb = rows
        .map(
          (row) =>
            `<tr>${row
              .map((c, k) => {
                const a = aligns[k] ? ` style="text-align:${aligns[k]}"` : '';
                return `<td${a}>${inline(c)}</td>`;
              })
              .join('')}</tr>`
        )
        .join('');
      html.push(`<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tb}</tbody></table></div>`);
      continue;
    }

    if (matchItem(line)) {
      const list = parseListBlock(lines, i);
      html.push(list.html);
      i = list.next;
      continue;
    }

    const buf = [];
    while (i < n && !isBlockStart(lines, i)) {
      buf.push(lines[i].trim());
      i++;
    }
    if (buf.length) html.push(`<p>${inline(buf.join(' '))}</p>`);
    else i++;
  }

  return { html: html.join('\n'), toc };
}

export default renderMarkdown;
