# 崔博凯的个人站

一套**零依赖**的静态站点生成器。没有 `npm install`，没有 `node_modules`，只用 Node 自带的模块。

项目位置：`D:\personal-blog`　·　计划上线地址：`https://kay529.github.io/zero-one/`

## 快速开始

```bash
node build.mjs        # 构建到 dist/
node preview.mjs      # 本地预览 http://localhost:4321
node tools/check.mjs  # 自检：死链、meta 标签、RSS/sitemap
```

## 目录结构

```
personal-blog/
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
