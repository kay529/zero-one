# content/ 怎么填

改完这里的任何文件，在项目根目录跑一次 `node build.mjs` 就会重新生成网站。
`本文件不会被读取`，它只是给你自己看的手册，可以随时删掉。

---

## 一、`about.md` —— 「关于」页

普通 Markdown，直接写就行。支持标题、列表、表格、引用、代码块、图片。

正文的 **一级标题（`#`）会显示在页面里**，但页面的 `<title>` 和顶部大标题
用的是 `site.config.json` 里的 `site.title`，所以那里也要改。

---

## 二、`publications.json` —— 「作品」页

一个数组，每条是一个作品。字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✔ | 标题 |
| `authors` | | 字符串数组。跟 `selfName` 匹配的作者会被加粗+下划线 |
| `selfName` | | 你自己的名字，用来高亮。不填则用 `site.config.json` 的 `site.title` |
| `venue` | | 期刊/会议/平台名，显示成左上角的小标签 |
| `type` | | `conference` / `journal` / `preprint` / `thesis` / `workshop`，决定类型标签 |
| `year` | | 数字。列表默认按年份从新到旧排 |
| `summary` | | 一两句话，显示在卡片上（最多 3 行） |
| `abstract` | | 填了会出现可展开的「摘要」折叠块 |
| `award` | | 比如「最佳论文提名」，会显示成金色标签 |
| `tags` | | 字符串数组，会自动生成标签页 |
| `links` | | `[{"label":"PDF","href":"...","icon":"pdf"}]`，icon 可选 `pdf`/`code`/`link`/`external` |
| `featured` | | `true` 会优先出现在首页 |

最小可用的例子：

```json
[
  {
    "title": "我的第一个作品",
    "authors": ["崔博凯"],
    "venue": "某个比赛 / 某本期刊",
    "type": "conference",
    "year": 2026,
    "summary": "一句话说清它解决了什么问题。",
    "tags": ["标签一"],
    "links": [{ "label": "PDF", "href": "https://example.com/a.pdf", "icon": "pdf" }],
    "featured": true
  }
]
```

---

## 三、`projects.json` —— 「项目」页

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | ✔ | 项目名 |
| `year` | | 数字 |
| `status` | | `active`（进行中）/ `wip`（构思中）/ `archived`（已归档） |
| `summary` | | 一两句话说明这个项目做什么 |
| `tags` | | 技术栈或分类 |
| `links` | | 同 publications |
| `featured` | | `true` 优先出现在首页 |

---

## 四、`posts/` —— 「笔记」页

一个 `.md` 文件 = 一篇文章。文件名建议用日期开头：

```
content/posts/2026-10-01-我的第一篇笔记.md
```

开头的 frontmatter：

```markdown
---
title: 我的第一篇笔记
date: 2026-10-01
tags: [随笔, 前端]
summary: 一句话摘要，会显示在卡片和 RSS 里。
---

正文从这里开始。
```

| 字段 | 说明 |
| --- | --- |
| `title` | 标题。**不填的话会用文件名** |
| `date` | `YYYY-MM-DD`。**不填的话会从文件名里取** |
| `tags` | `[A, B]` 或分行写 `- A` |
| `summary` | 不填会自动取正文第一段 |
| `slug` | 自定义网址（默认用文件名去掉日期前缀） |
| `updated` | 更新时间，填了会在文章顶部显示 |
| `draft` | `true` 表示草稿，构建时跳过 |

正文支持：标题（自动生成右侧目录）、**粗体**、*斜体*、~~删除线~~、`行内代码`、
围栏代码块（**构建期语法高亮**）、有序/无序列表（含嵌套）、引用块、表格、分隔线、图片。

---

## 五、一些小规则

- **标签**：所有 `tags` 会自动汇总成 `/tags.html` 和每个标签的独立页面，不需要手动维护
- **空数组没问题**：`[]` 就是「还没填」，页面上会显示一行虚线框提示，站点不会看起来坏掉
- **首页**：只渲染有内容的区块；三块都空时会显示一段「内容还在路上」的说明
- **作者高亮**：`authors` 里跟 `selfName` 匹配的会被加粗加下划线，用来突出「这是我自己」
- **JSON 不要写注释**，也不要多留逗号，会解析失败
