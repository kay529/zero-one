# 第三方资源声明

本项目**零运行时依赖**——没有 `package.json` 里的 `dependencies`，没有 `node_modules`，
构建时只用 Node.js 自带的模块（`node:fs`、`node:path`、`node:url` 等）。

下面列出站点里用到的、不是本仓库自己写的资源。全部为自由 / 开源授权，可商用，
无需在页面上署名，这里做统一记录，方便日后核查。

## 字体

| 字体 | 用途 | 授权 | 说明 |
| --- | --- | --- | --- |
| 系统字体栈 | 全站 UI 与正文 | 随操作系统 | 未内嵌任何 Web Font，直接调用系统中文字体（Windows 的「微软雅黑」、macOS 的「苹方」等），因此不产生授权问题，也不额外消耗流量 |
| 等宽字体栈 | 代码块、标签、徽章 | 随操作系统 | 同上（Consolas / SF Mono / Menlo 等） |

**没有使用 Google Fonts 等第三方字体 CDN**，所以站点在国内访问不会因为字体被墙而卡住。

## 图标

导航栏、联系方式、主题切换等图标全部是手写的内联 SVG，代码在本仓库的
`personal-blog/lib/render.mjs` 里，随本项目一起授权。没有引入 Font Awesome、
Iconfont 之类的图标库。

## 脚本

站点前端**没有引入任何第三方 JS 库**——没有 jQuery、没有框架、没有 CDN 引用。
搜索、标签筛选、主题切换、目录高亮都是 `personal-blog/static/main.js` 里自己写的，
一共十来 KB。

Markdown 渲染器和代码高亮同样是自己实现的（`personal-blog/lib/markdown.mjs`），
没有用 marked / markdown-it / highlight.js。

## GitHub Actions

自动部署用到的是 GitHub 官方 Action，均为 MIT 授权，只在构建时运行、不进产物：

| Action | 用途 |
| --- | --- |
| `actions/checkout` | 拉取仓库代码 |
| `actions/setup-node` | 准备 Node.js 环境 |
| `actions/configure-pages` | 读取 Pages 配置 |
| `actions/upload-pages-artifact` | 打包 `dist/` |
| `actions/deploy-pages` | 发布到 GitHub Pages |

## 如果以后加了新东西

往站点里加入第三方资源时，在这个文件里补一行：资源名、用途、授权、来源链接。
特别是这几类，容易忘记：

- 从网上找的图片、插画、图标（哪怕是免费图库，也记一下来源，方便日后证明）
- 复制的代码片段（注意是 MIT 还是 GPL，GPL 有传染性）
- 论文里的图表（除非是自己画的，否则通常不能直接转载，需要授权）
