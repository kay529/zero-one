# 崔博凯的个人站

一套**零依赖**的静态站点生成器。没有 `npm install`，没有 `node_modules`，只用 Node 自带的模块。

**线上地址：<https://kay529.github.io/zero-one/>**（已上线，就是你看到的那个站）

> 这份文件是给「改代码的人」看的。只想改文字内容的话，
> 看 [`content/README.md`](./content/README.md) 就够了，不用读这里。

## 授权

- **站点的文字、图片等内容**：CC BY-SA 4.0，全文见仓库根目录的 [`../LICENSE`](../LICENSE)
- **构建器代码**：随站点一起以 CC BY-SA 4.0 授权（个人站，不单独拆分协议）
- **第三方资源**：见 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)

页脚的 `© 2022–2026 崔博凯 · CC BY-SA 4.0` 由 `site.config.json` 的
`site.startYear` 和 `site.license` 两个字段生成。授权名一旦公开就**不可撤销**
（这是 CC 协议的硬规定），想换名字前先想清楚怎么写。

> **为什么不是 CC BY-NC-SA 4.0？** GitHub 的授权识别**不支持任何非商用（NC）变体**
> —— choosealicense.com（识别数据源）里只有 `cc-by-4.0` / `cc-by-sa-4.0` / `cc0-1.0`
> 三个 CC 协议。带 NC 的话，无论 LICENSE 写得多标准，仓库页永远显示 `Other`、
> 永远不会有授权徽章。
>
> 另外：**NC 限制的是「别人能不能拿你的内容赚钱」，跟「你自己会不会侵权」无关。**
> 自己是否侵权取决于内容来源（图片、字体、他人成果）干不干净，与选哪个协议无关。

## 快速开始

```bash
node build.mjs        # 构建到 dist/
node preview.mjs      # 本地预览 http://localhost:4321
node tools/check.mjs  # 自检：死链、meta 标签、RSS/sitemap
```

## 目录结构

```
personal-blog/              ← 本目录
├── THIRD-PARTY-NOTICES.md 用到的第三方资源及授权
├── site.config.json       ★ 全站配置（名字、域名、导航、主题色）
├── build.mjs              构建入口
├── preview.mjs            本地预览服务器
├── tools/check.mjs        产物自检（死链扫描）
├── lib/
│   ├── markdown.mjs       Markdown 渲染器 + 构建期语法高亮
│   └── render.mjs         页面模板、RSS、Sitemap、SVG 资源
├── content/
│   ├── README.md          ★★ 怎么填内容：所有字段的说明和例子都在这
│   ├── about.md           ★ 「关于」页正文
│   ├── publications.json  ★ 作品 / 成果列表
│   ├── projects.json      ★ 项目列表
│   └── posts/*.md         ★ 文章（Markdown + frontmatter）
├── static/                直接复制的静态资源（style.css / main.js / cv.pdf / images/）
├── dist/                  构建产物（已 gitignore）
├── .github/workflows/     可选的 GitHub Pages 自动部署
└── DEPLOY.md              ★ 上线指南
```

**要加内容，先看 [`content/README.md`](./content/README.md)。**

> 授权全文 `LICENSE` 放在**仓库根目录**、不在本目录里 ——
> GitHub 只扫描仓库根来识别授权，放子目录不会被认。

## 当前状态

内容目录是**空的**（一份刻意的空模板）：

- `publications.json`、`projects.json` 都是 `[]`
- `content/posts/` 里没有文章
- 页面会显示一行虚线框提示（比如「还没有添加作品。」），首页会显示一段「内容还在路上」的说明——
  空站不会看起来像坏掉了

还需要你替换的占位内容（构建时会在日志里列出来）：

- `site.config.json` 里的 `site.email`（现在还是 `you@example.com`）
- `site.location`、`site.affiliation`（现在是空字符串）
- `static/cv.pdf`（可选，放了首页的简历按钮就会生效）

## 特性

- 卡片网格布局，响应式，亮 / 暗 / 跟随系统三种主题
- 构建期 Markdown 渲染 + 语法高亮，正文无需脚本即可阅读
- 客户端搜索 + 标签筛选（Ctrl/Cmd + K 聚焦）
- 文章目录高亮、阅读时长、上一篇 / 下一篇、相关文章
- 自动生成 RSS、sitemap.xml、robots.txt、404 页、标签索引
- 作品卡片支持会议 / 类型 / 获奖徽章与可折叠摘要；关于页有打印样式
- 完整 SEO：canonical、Open Graph、Twitter Card、自动生成 OG 图片
- 死链自检脚本，CI 里也会跑
- 全站链接都是相对路径，**用户站 / 项目站 / 自定义域名三种部署方式都不用改代码**，
  只改 `site.config.json` 的 `site.url`

## 上线

见 **[DEPLOY.md](./DEPLOY.md)**。

结论版：推到 `kay529/zero-one` 仓库 → 仓库 Settings → Pages → Source 选 GitHub Actions → 推代码即自动部署。
地址就是 `https://kay529.github.io/zero-one/`（仓库名必须正好是 `zero-one`）。
