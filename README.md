崔博凯的个人主页
我的个人网站源码，包含作品列表、项目、笔记和关于页。
在线地址：kay529.github.io/zero-one
这个仓库里有什么
zero-one/
├── README.md                 你正在看的文件
├── LICENSE                   CC BY-SA 4.0（内容授权）
├── .github/workflows/        推送到 main 后自动构建并发布到 Pages
└── personal-blog/            网站本体，构建脚本和内容都在这里
网站是一套零依赖的静态站点生成器：只用 Node 自带的模块，没有 npm install，
没有 node_modules，克隆下来就能跑。
本地构建
需要 Node.js 18 或更高版本。
cd personal-blog
node build.mjs        # 构建到 dist/
node preview.mjs      # 本地预览 http://localhost:4321
node tools/check.mjs  # 自检：死链、meta 标签、RSS / sitemap
不要手动改 dist/，它是构建产物，每次构建都会被覆盖。
改内容
想改文字或加东西，全部在 personal-blog/content/ 里，不需要懂代码：
我想……
改哪个文件
改「关于」页的自我介绍
content/about.md
加一篇论文 / 作品
content/publications.json
加一个项目
content/projects.json
写一篇笔记
content/posts/ 下新建 .md 文件
改网站标题、导航、邮箱、主题色
上层 personal-blog/site.config.json
每个字段的写法和例子见 personal-blog/content/README.md，
里面有常见错误的说明（Markdown 的换行、注释、标题层级这些坑）。
改完提交，GitHub Actions 会自动重新构建并发布，一两分钟后刷新线上地址即可。
部署
托管在 GitHub Pages 上，免费、无需服务器、无需备案。流程见
personal-blog/DEPLOY.md。
当前生效的配置：仓库 Settings → Pages → Source 设为 GitHub Actions，
本仓库的 main 分支一旦有新提交就自动部署。
授权
本站的文章、图片等文字内容采用
CC BY-SA 4.0
授权：欢迎转载和改编，只需署名、衍生作品沿用同样的协议。详见 LICENSE。
第三方依赖的授权情况见 personal-blog/THIRD-PARTY-NOTICES.md。
联系
- GitHub：@kay529
- 邮箱：2024124166@chd.edu.cn
