# 上线指南：从零到「域名能打开」

这份文档分成九步。第 0 步是你那个「忘了的域名」的结论，第 1 步是找回方法，第 2 步认清成本，
第 3–5 步把站点真正跑起来，第 6–9 步是日常维护与以后的路线。

---

## 0. 结论：你的地址是 `https://kay529.github.io/zero-one/`

2026-09-24 实测：

| 检查项 | 结果 |
| --- | --- |
| GitHub 账号 `kay529` | **存在**，注册于 2022-06-07 |
| 该账号的公开仓库数 | **0** |
| 仓库 `kay529/zero-one` | **404，已不存在** |
| `https://kay529.github.io/zero-one/` | **404 · Site not found**（站点已下线） |

也就是说：**账号是你的、用户名还在，但当年那个仓库已经没了（被删除，或转成了私有仓库），
站点跟着下线。** 本地也没有备份（`D:\前端练习` 已经不在了），所以内容需要重新写。

好消息是**地址可以原样收回**：在 `kay529` 账号下新建一个名为 `zero-one` 的仓库，
用 GitHub Pages 发布，访问地址就还是 `https://kay529.github.io/zero-one/`。
如果你只想用这个地址，可以直接跳到 **第 4 节（路线 B：GitHub Pages）**。

### 这是「项目站」，部署前要知道的一件事

`https://kay529.github.io/zero-one/` 是**项目站**（站点挂在 `/zero-one/` 子路径下），
不是用户站（用户站长这样：`https://kay529.github.io/`）。区别在于：
**站内所有链接都不能用以 `/` 开头的绝对路径**（比如 `/style.css`），否则会跑到域名根去、全部 404。

本项目所有链接都是相对路径，已经实测过：把 `dist/` 挂在 `/zero-one/` 子路径下爬全站，
**44 个站内 URL 全部返回 200，HTML 中绝对根路径引用数为 0**。所以直接部署即可，不用改任何代码。

`site.config.json` 里的 `site.url` 已经填成 `https://kay529.github.io/zero-one`，
canonical、Open Graph 分享图、RSS、sitemap 都会自动跟着正确。

> 小提示：项目站里的 `robots.txt` 不会被爬虫读取（它们只认域名根目录的那个），
> 这个文件放着无害。想让 sitemap 被发现，去 Google Search Console 手动提交
> `https://kay529.github.io/zero-one/sitemap.xml` 即可。

### 如果你更想要干净的 `https://kay529.github.io/`

新建一个名字正好是 `kay529.github.io` 的仓库，把同一套代码放进去，
再把 `site.url` 改成 `https://kay529.github.io`。同一份代码两边都能跑，不需要改别的。

---

## 1. 当年那个域名是怎么找回来的（存档，以后不用再找）

你是通过「想起仓库名」找到的：`kay529.github.io/zero-one` → 用户名 `kay529`、仓库 `zero-one`。
下面是通用的找回路径，留给以后的自己。

你本机**没有留下任何痕迹**（没有 `~/.gitconfig`、没有 SSH 私钥、没有 `gh` 登录缓存），所以只能从线上找。按下面顺序试，通常第 1 或第 2 步就能找到。

### 方法 A：翻邮箱（最快，成功率最高）

登录你三年前可能用过的邮箱，搜索这几个关键词：

```
GitHub                     确认注册时的欢迎邮件
verify your email          GitHub 注册验证邮件，正文里会有用户名
github.io                  如果开过 Pages，会有构建通知
域名注册成功 / 实名认证      国内注册商的邮件
whois / 域名到期提醒
```

GitHub 的验证邮件正文里通常会直接写「Hi **你的用户名**」，一封就够。

### 方法 B：GitHub 允许用邮箱登录

很多人不知道：**GitHub 登录不需要用户名**。

1. 打开 <https://github.com/login>
2. 用**邮箱 + 密码**登录（邮箱输入框在顶部，用户名那栏不是必填）
3. 忘了密码就点 `Forgot password?`，GitHub 会把重置链接发到邮箱
4. 登录后访问 <https://github.com/settings/profile>，右上角就是你的用户名
5. 再访问 `https://github.com/<用户名>/<用户名>.github.io`，如果当年开过 Pages，这里会有仓库

### 方法 C：如果你的「域名」是**自己注册的**（不是 github.io）

「GitHub 的域名」有两种可能，这点要先确认：

| 情况 | 表现 | 找回方式 |
| --- | --- | --- |
| GitHub Pages 免费二级域名 | 长得像 `username.github.io` | 用方法 A / B 找回用户名即可 |
| 在注册商买的独立域名 | 长得像 `xxx.com` / `xxx.top` | 登录注册商控制台，或用 whois 反查 |

如果是独立域名，挨个登录你可能用过的注册商看「我的域名」：

- 阿里云（万网）：<https://dc.console.aliyun.com/next/index#/domain/list/all-domain>
- 腾讯云（DNSPod）：<https://console.cloud.tencent.com/domain/all-domain>
- 华为云、西部数码、Namesilo、Namecheap、GoDaddy、Cloudflare Registrar

都找不到，就查 whois 看注册商和到期时间：

- <https://who.is> 或 <https://www.whois.com/whois/>
- 命令行（Windows）：`nslookup 你猜的域名`

> **域名过期是很常见的坑。** 域名到期后有 30 天左右续费宽限期，之后进入约 75 天赎回期（赎回费几百元），再之后被释放——释放后可能被抢注，就只能换域名了。所以**先确认到期日，别拖**。

### 方法 D：直接让我帮你查

把候选域名告诉我（哪怕只是猜测），我可以帮你确认它现在是否还在解析、指向哪里、能不能直接用。找到之后我帮你写好接入配置。

---

## 2. 成本账：为什么建议**先不上云主机**

个人博客是纯静态站点，本质是一堆 HTML 文件。云主机对你来说是**用不上的算力**，却要你承担运维成本和备案时间。

| 方案 | 首年 | 续费 | 需要备案 | 上线耗时 | 运维负担 |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare Pages（本方案）** | **¥0** | **¥0** | 不需要 | 约 30 分钟 | 无 |
| GitHub Pages | ¥0 | ¥0 | 不需要 | 约 40 分钟 | 无 |
| 腾讯云轻量 2核2G/3M/40G | ¥68–99（新用户秒杀） | ¥208–300 | **必须** | 1–3 天 | 有 |
| 阿里云轻量 2核2G/3M/40G | ¥38–99（新用户秒杀） | ¥198+ | **必须** | 1–3 天 | 有 |
| 华为云耀云 2核2G/2M | ¥70–168 | ¥220+ | **必须** | 1–3 天 | 有 |

两个容易被忽略的点：

1. **首年价 ≠ 持有成本。** 新用户秒杀价是获客手段，第二年续费普遍翻 2–4 倍。算五年总成本时请用续费价。
2. **国内节点必须 ICP 备案。** 未备案的域名解析到国内服务器，80/443 端口会被运营商拦截，网站根本打不开。备案本身免费，但要 7–20 个工作日，且要求服务器剩余时长 ≥ 3 个月。

所以结论是：**先花 0 元把站跑起来，把钱花在你真正需要的东西上。**

### 域名大概多少钱

| 后缀 | 首年 | 续费 | 建议 |
| --- | --- | --- | --- |
| `.com` | ¥55–85 | ¥75–100 | 长期持有最省心，续费稳定，推荐 |
| `.cn` | ¥20–45 | ¥35–60 | 需要实名认证，国内认可度高 |
| `.top` | ¥5–15 | ¥25–40 | 首年便宜、续费也不贵，性价比高的备选 |
| `.xyz` | ¥6–12 | **¥60–100** | 首年极便宜但续费翻十倍，**不建议长期用** |

> 只看首年价是新手最常踩的坑。下单前一定要在价格详情页找到「续费价」那一行。

---

## 3. 路线 A（推荐）：Cloudflare Pages

免费、无限带宽、免费 HTTPS、全球 CDN，而且构建就是你项目里的 `node build.mjs`。

### 3.1 把代码推到 GitHub

在项目目录（`personal-blog/`）里执行：

```bash
git init
git add .
git commit -m "feat: 初始化个人博客"
git branch -M main
git remote add origin https://github.com/kay529/zero-one.git
git push -u origin main
```

> 先在 <https://github.com/new> 建一个名为 `zero-one` 的仓库（Public）。
> 仓库名必须正好是 `zero-one`，访问地址才会是 `https://kay529.github.io/zero-one/`。
> 不要勾选 "Add a README file"，否则推送时会冲突。

### 3.2 在 Cloudflare 里创建 Pages 项目

1. 注册 / 登录 <https://dash.cloudflare.com/>（邮箱注册即可，不需要信用卡）
2. 左侧 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权 GitHub，选中刚才那个仓库
4. **构建设置**照抄下面这张表：

| 字段 | 填什么 |
| --- | --- |
| Framework preset | `None` |
| Build command | `node build.mjs` |
| Build output directory | `dist` |
| Root directory | 留空（如果博客放在仓库的子目录里，就填那个子目录名） |

5. 展开 **Environment variables**，加一条：

| 变量名 | 值 |
| --- | --- |
| `NODE_VERSION` | `22` |

> 这条不能省。Cloudflare 默认的 Node 版本可能低于本项目要求，不加会构建失败。

6. 点 **Save and Deploy**。大约 30 秒后你会拿到一个 `https://<项目名>.pages.dev` 的地址，**这一步结束站点就已经上线了**。

### 3.3 以后的更新流程

改完内容后：

```bash
git add .
git commit -m "post: 新增一篇笔记"
git push
```

推送即自动重新构建部署，不需要你做任何其他操作。

---

## 4. 路线 B（备选）：GitHub Pages

如果不想用 Cloudflare，这套代码同样可以跑在 GitHub Pages 上。项目里已经放好了 `.github/workflows/deploy.yml`，你只需要：

1. 把代码推到 GitHub（同上）
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**
3. 推一次代码（或手动触发 workflow）

Actions 会自动执行 `node build.mjs` + `node tools/check.mjs`（死链自检），然后发布。

对比一下两条免费路线：

| | Cloudflare Pages | GitHub Pages |
| --- | --- | --- |
| 带宽 | 不限量 | 约 100 GB/月（软限制） |
| 站点体积 | 20,000 文件 / 单文件 25 MiB | 1 GB |
| 每月构建次数 | 500 次 | 基本够用 |
| 国内访问 | 较快（有国内边缘节点） | 一般 |
| 部署预览 | 每个分支都有预览链接 | 无 |

**建议用 Cloudflare Pages**，主要差别在国内访问速度。

---

## 5. 把域名接上去

### 5.1 先做一件事：改 `site.config.json`

在接入域名**之前**，先把配置里的 `site.url` 改成你的真实域名（带 `https://`，结尾不要斜杠）：

```json
"url": "https://your-domain.com"
```

这会影响 canonical 链接、Open Graph 分享卡片、RSS 和 sitemap——SEO 全靠它。改完重新构建一次。

### 5.2 方案一（推荐）：把 DNS 托管到 Cloudflare

1. Cloudflare 控制台 → **Add a site** → 输入你的域名 → 选 **Free** 计划
2. Cloudflare 会给你两个 nameserver 地址，形如：

```
xxx.ns.cloudflare.com
yyy.ns.cloudflare.com
```

3. 去你**域名注册商**的控制台，把域名的 DNS 服务器改成上面这两个
4. 回 Cloudflare 等状态变成 **Active**（通常几分钟到几小时）
5. 进 Pages 项目 → **Custom domains** → **Set up a custom domain** → 输入域名

Cloudflare 会自动创建解析记录并签发证书，你什么都不用配。这套方案的好处还有：apex 域名（不带 www）用 CNAME 扁平化直达 Pages，免费 SSL 自动续期，还附送一层 CDN。

> 注意：国内注册商（阿里云 / 腾讯云）修改 NS 前，域名必须已完成实名认证，否则改不了。

### 5.3 方案二：DNS 留在原注册商

如果不想动 NS，就在原注册商加解析记录：

| 记录类型 | 主机记录 | 记录值 |
| --- | --- | --- |
| CNAME | `www` | `<项目名>.pages.dev` |
| CNAME | `@`（apex） | `<项目名>.pages.dev` |

**apex 那一条要看注册商是否支持。** 阿里云云解析、DNSPod 支持在 `@` 上加 CNAME，但如果你在 apex 用了 CNAME，就**不能同时保留 MX 记录**（比如企业邮箱会失效）。

更稳妥的做法：apex 写一条 `301` 跳转到 `www`，把 `www` 作为主域。

### 5.4 验证

```bash
nslookup your-domain.com          # 看解析是否生效
curl -I https://your-domain.com   # 看是否返回 200 且带 HTTPS
```

解析生效通常几分钟，最长 24 小时（取决于 TTL）。

---

## 6. 日常怎么写文章

> 所有字段的完整说明和例子都在 **[`content/README.md`](./content/README.md)**，下面只是最常用的三件事。
> 现在 `content/` 是空的（刻意的空模板）：两个 JSON 都是 `[]`，`posts/` 里没有文件。
> 页面会显示虚线框提示，首页会显示「内容还在路上」，不是出错。

### 写一篇新笔记

在 `content/posts/` 下新建文件，文件名以日期开头：

```
content/posts/2026-10-01-我的第一篇笔记.md
```

文件开头写 frontmatter：

```markdown
---
title: 我的第一篇笔记
date: 2026-10-01
tags: [随笔]
summary: 一句话摘要，会显示在卡片和 RSS 里。
---

正文从这行开始。Markdown 语法都用得上：

## 二级标题

- 列表
- 表格
- 代码块（自动语法高亮）

> 引用块
```

加 `draft: true` 可以标记为草稿，构建时会自动跳过。

### 加论文 / 加项目

直接编辑 `content/publications.json` 或 `content/projects.json`，按现有条目的结构复制一份改内容即可。字段说明：

- `featured: true` → 会出现在首页的「精选」区域
- `selfName` → 作者列表里跟你名字匹配的会被加粗下划线
- `abstract` → 填了就会在卡片上出现可折叠的「摘要」

### 改个人信息

全部集中在 `site.config.json`，带 ★ 的几个字段必改：

| 字段 | 作用 |
| --- | --- |
| `site.title` ★ | 你的名字，显示在导航栏、页脚、版权 |
| `site.initials` ★ | 头像和 favicon 里的字母缩写 |
| `site.url` ★ | 真实域名 |
| `site.email` ★ | 邮箱 |
| `site.affiliation` ★ | 单位 / 学校 |
| `hero.stats` ★ | 首页三个数字 |
| `social[].href` ★ | GitHub / Scholar / ORCID 链接 |
| `theme.accent` | 主题色，改一个色值全站换色 |

### 三条命令

```bash
node build.mjs        # 构建到 dist/
node preview.mjs      # 本地预览 http://localhost:4321
node tools/check.mjs  # 自检：死链、meta 标签、RSS/sitemap
```

也可以直接用 npm 脚本：`npm run build` / `npm run dev` / `npm run check`。

### 简历 PDF

把简历文件放到 `static/cv.pdf`，首页的「下载简历」按钮就会自动生效。没有这个文件时，按钮会自动指向在线简历页，不会出现死链。

---

## 7. 以后想上云主机，怎么搬

等你真的需要后端能力（评论审核、会员、数据接口）时再买。迁移成本很低，因为 `dist/` 是纯静态文件，搬到哪都能跑。

### 7.1 选型

| 场景 | 建议 |
| --- | --- |
| 只做静态博客 | 别买，继续用 Pages |
| 想学 Linux / Nginx | 腾讯云或阿里云轻量 2核2G，**挑有秒杀的时候买** |
| 想让国内访问最快 | 国内节点 + ICP 备案（7–20 工作日） |
| 不想备案 | 香港 / 新加坡节点，免备案，延迟约 45ms |

### 7.2 Nginx 配置（直接抄）

```nginx
# /etc/nginx/conf.d/blog.conf
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://your-domain.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name www.your-domain.com;

    ssl_certificate     /etc/nginx/ssl/your-domain.com.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
    return 301 https://your-domain.com$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/ssl/your-domain.com.pem;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 1d;

    root  /var/www/blog;
    index index.html;

    gzip on;
    gzip_min_length 1024;
    gzip_types text/html text/css application/javascript image/svg+xml application/xml text/plain;

    # 没有 .html 后缀的地址也能访问，并让 404 走自定义页面
    location / {
        try_files $uri $uri.html $uri/ /404.html;
    }

    location ~* \.(css|js|svg|woff2|png|jpg|jpeg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

### 7.3 部署命令

本地构建完，一条命令同步上去：

```bash
node build.mjs
rsync -avz --delete dist/ root@<服务器IP>:/var/www/blog/
```

Windows 上用 scp（PowerShell）：

```powershell
node build.mjs
scp -r .\dist\* root@<服务器IP>:/var/www/blog/
```

### 7.4 HTTPS 证书

| 方式 | 适用 | 说明 |
| --- | --- | --- |
| Cloudflare 回源证书 | 域名已托管在 CF | 15 年有效期，一次配置永久有效，最省事 |
| acme.sh + Let's Encrypt | 任意服务器 | 90 天自动续期，一条命令签发 |
| 云厂商免费证书 | 国内服务器 | 现在多为 3 个月有效期，需要手动续 |

acme.sh 签发（DNS 验证，不受备案和端口限制）：

```bash
curl https://get.acme.sh | sh -s email=you@example.com
~/.acme.sh/acme.sh --issue -d your-domain.com -d www.your-domain.com --dns dns_cf
~/.acme.sh/acme.sh --install-cert -d your-domain.com \
  --key-file       /etc/nginx/ssl/your-domain.com.key \
  --fullchain-file /etc/nginx/ssl/your-domain.com.pem \
  --reloadcmd      "systemctl reload nginx"
```

---

## 8. 常见问题

**Q：解析改了多久生效？**
通常几分钟到 1 小时。如果是改 NS，一般 10 分钟到 24 小时（受原 TTL 影响）。用 `nslookup your-domain.com` 确认。

**Q：`pages.dev` 在国内能访问吗？**
能，Cloudflare 有国内边缘节点，速度比 GitHub Pages 好，但不如国内备案节点稳定。要求极致速度就只能备案 + 国内服务器。

**Q：图片放哪？**
小图直接放 `static/`（会一起复制到 `dist/`），比如 `static/images/fig1.png`，文章里写 `![说明](/images/fig1.png)`。图多了建议放图床或 Cloudflare R2，避免仓库膨胀。

**Q：想要评论功能？**
用 [giscus](https://giscus.app/)（基于 GitHub Discussions，免费、无广告）。在 `lib/render.mjs` 的 `renderPost` 里加一段 script 即可。

**Q：想换主题色？**
改 `site.config.json` 里的 `theme.accent`，重新构建，全站配色跟着变。

**Q：构建失败提示 Node 版本不对？**
确认 Cloudflare Pages 的环境变量里有 `NODE_VERSION=22`。

**Q：我改了内容但线上没更新？**
检查是否 `git push` 成功，然后在 Pages 项目的 **Deployments** 标签页看这次构建的日志。

---

## 9. 上线前检查清单

- [ ] `site.config.json` 里 6 个带 ★ 的字段已替换
- [ ] `site.url` 是真实域名（带 https://，无结尾斜杠）
- [ ] `content/about.md` 已改成自己的经历
- [ ] `content/publications.json` / `projects.json` 已换成真实成果
- [ ] `content/posts/` 里的示例文章已删除或替换
- [ ] `static/cv.pdf` 已放入（可选）
- [ ] 本地跑过 `node build.mjs && node tools/check.mjs`，输出 `✓ 所有内部链接……均正常`
- [ ] 域名到期时间已确认，自动续费已开启
