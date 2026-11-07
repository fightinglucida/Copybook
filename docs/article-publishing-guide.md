# 技能之书：文章发布与配置完整指南

核对日期：2026-10-31。适用项目：`F:\linshutech\copybook`。正式网站：[技能之书](https://copybook-3w6.pages.dev/)。

本指南根据当前文章模板、页面模板、Hugo 配置、网页后台和授权接口整理。日常发布推荐直接编辑 Markdown，再通过 Git 推送到 `main`。本地保存、Git 提交、Cloudflare 部署是三个不同步骤，部署成功后文章才会在线上更新。

## 目录

- [1. 最快发布一篇文章](#1-最快发布一篇文章)
- [2. 项目目录与发文的关系](#2-项目目录与发文的关系)
- [3. YAML 配置怎么写](#3-yaml-配置怎么写)
- [4. 文章参数完整说明](#4-文章参数完整说明)
- [5. 日期、草稿和置顶](#5-日期草稿和置顶)
- [6. 分类、标签与作者](#6-分类标签与作者)
- [7. 缩略图与正文图片](#7-缩略图与正文图片)
- [8. 免费下载与普通资源入口](#8-免费下载与普通资源入口)
- [9. 激活码付费资源](#9-激活码付费资源)
- [10. 正文 Markdown 写法](#10-正文-markdown-写法)
- [11. 地址与进阶参数](#11-地址与进阶参数)
- [12. 预览、检查、提交和上线](#12-预览检查提交和上线)
- [13. 网页后台的字段与限制](#13-网页后台的字段与限制)
- [14. 常见问题](#14-常见问题)
- [15. 发布检查单](#15-发布检查单)
- [16. 实现位置和核对依据](#16-实现位置和核对依据)

## 1. 最快发布一篇文章

### 1.1 新建文件

在 PowerShell 中执行：

```powershell
Set-Location -LiteralPath 'F:\linshutech\copybook'
hugo new content "excel-study-guide.md"
```

命令在 `content/excel-study-guide.md` 创建文章，使用 `archetypes/default.md` 的默认配置。生成时 `draft: true`，即草稿。也可以手工创建 `.md` 文件，每篇一个文件；不要覆盖现有文件。

文件名建议使用稳定的英文或拼音短横线命名，标题可以写中文。

### 1.2 普通知识文章：完整可复制模板

将新文件替换为以下内容，并修改标题、时间和正文：

```yaml
---
title: "零基础 Excel 学习路线"
date: 2026-10-31T09:00:00+08:00
draft: false
pinned: false
paid: false
categories: "学习资料"
tags: ["学习", "工具"]
author: "Lucida"
description: "适合零基础读者的 Excel 学习顺序、练习方法和常见问题。"
thumbnail: "/images/thumbs/tool-office.webp"
---

这里写文章开头，说明适合谁读、可以学到什么。

## 先学什么

从单元格、工作表和常用公式开始。

## 怎么练习

每天选择一张真实表格完成一个小练习。
```

这篇文章没有下载配置，因此文末没有下载区。分享网盘使用第 8 节模板，需要激活码使用第 9 节模板。示例时间是北京时间，正式使用时换成实际发布时间。

### 1.3 预览并发布

```powershell
npm run serve
```

打开终端提示的本地地址，通常是 `http://localhost:1313/`。确认后按 `Ctrl+C` 结束预览，运行：

```powershell
npm run build
git status --short
git add -- "content/excel-study-guide.md"
git diff --cached
git commit -m "content: publish Excel study guide"
git push origin main
```

使用新图片时，还要加入相应图片文件。**提交前检查 `git diff --cached`，只提交本次准备发布的文件**，不要直接 `git add .` 把其他未完成工作一起发布。

等待 Cloudflare Pages 的 `main` 部署成功，再打开正式网站核对。仅本地预览或 `git commit` 不会更新线上。

## 2. 项目目录与发文的关系

| 路径 | 用途 | 日常是否修改 |
|---|---|---|
| `content/*.md` | 文章正文及顶部配置 | 是 |
| `content/文章目录/index.md` | 与图片放在同目录的文章资源包 | 多图文章可选 |
| `content/_index.md` | 首页元信息，不是一篇普通文章 | 通常不用 |
| `static/images/` | 公开图片，发布后对应 `/images/` | 有新图时 |
| `static/images/thumbs/` | 已有的本地 WebP 缩略图库 | 可直接引用 |
| `archetypes/default.md` | 新建文章的默认配置 | 想改所有新文章默认值时 |
| `config.toml` | 全站域名、时区、作者、分页、分类体系 | 通常不用 |
| `static/admin/config.yml` | 内容后台的表单字段 | 普通发文不用 |
| `data/publication_dates.json` | 旧文章日期回填映射 | 新文章不用填，直接写 `date` |
| `layouts/` | 排序、缩略图、下载等展示逻辑 | 普通发文不用 |
| `functions/`、`wrangler.jsonc` | 付费校验接口及授权服务连接 | 普通发文不用 |
| `docs/` | 项目操作说明，不会成为网站文章 | 查阅即可 |
| `public/` | 构建生成的文件 | 不手改，不作为文章源文件提交 |
| `design-preview/` | 旧的设计审核原型 | 不是正式文章编辑入口 |

公开文章、图片和静态文件都可以被访客读取。付费下载地址、提取码、管理员密钥、激活码库存放在授权系统，不放进博客公开目录和 Git 仓库。

## 3. YAML 配置怎么写

两个 `---` 之间是配置，第二个 `---` 后面是正文：

```yaml
---
title: "文章标题"
date: 2026-10-31T09:00:00+08:00
draft: false
categories: "学习资料"
tags:
  - "学习"
  - "资源"
---

从这里写正文。
```

基本规则：

- 参数名和冒号用英文半角，冒号后留空格。
- `true`、`false` 不加引号。不要写 `pinned: "true"` 或 `paid: "false"`，它们是字符串，可能造成错误行为。
- 缩进用空格，不用 Tab。嵌套参数每层推荐两个空格。
- 标题、描述、网址、提取码建议加引号；数字提取码也写成 `"0012"`，避免前导零丢失。
- 标签既可写成 `["学习", "工具"]`，也可使用多行数组。
- 同一层参数只写一次，修改原值，不要重复追加。
- 文件使用 UTF-8 编码。示例中的网盘标识和销售网址需要替换为真实内容。

## 4. 文章参数完整说明

“必填”表示可靠发布的建议；“模板默认”表示运行新建命令时自动生成的值。

### 4.1 基础与展示

| 参数 | 类型／示例 | 是否填写 | 作用、默认值与注意事项 |
|---|---|---|---|
| `title` | 字符串：`"Excel 学习路线"` | 必填 | 列表、详情、搜索、分享标题；页面自动追加网站名，不必手写“· 技能之书” |
| `date` | 时间：`2026-10-31T09:00:00+08:00` | 新文章必填 | 发布日期和列表排序的主要来源，建议写完整时区 |
| `draft` | 布尔值：`false` | 发布前确认 | 模板默认 `true`；正式普通构建排除草稿。删除此字段相当于默认非草稿 |
| `pinned` | 布尔值：`true` | 可选 | 模板默认 `false`；为 `true` 时首页优先并显示“置顶”，不改变分类／标签／RSS 的时间排序 |
| `categories` | 字符串：`"学习资料"` | 建议必填 | 分类索引、侧栏、分类徽标、详情导航及自动缩略图库；推荐一篇一个分类 |
| `tags` | 字符串数组：`["学习", "工具"]` | 建议 2～5 个 | 标签页、搜索、热门标签、帖子标签；列表最多取前三个，手机可能进一步精简，详情展示全部 |
| `author` | 字符串：`"林书"` | 可选 | 列表、详情和本帖信息的作者；未填使用全站作者，当前为 `Lucida`。填一个名字，不填对象／数组 |
| `description` | 字符串，一两句简介 | 建议填写 | SEO 和社交分享描述；未填通常从摘要提取，不是首页摘要段落 |
| `summary` | 字符串，短摘要 | 可选 | Hugo 摘要，影响 RSS 和未填 `description` 时的描述来源；首页没有独立摘要栏 |
| `thumbnail` | 图片路径：`"/images/thumbs/tool-office.webp"` | 可选 | 列表左侧缩略图，最高优先级；不自动插入正文、不替换分享大图 |
| `cover` | 图片路径：`"/images/my-post/cover.webp"` | 可选 | 列表缩略图备用值，优先级低于 `thumbnail` 及资源包约定图片 |
| `mood` | 字符串：`"五星"`／`"empty"` | 可选 | 历史分类体系，会生成 `/mood/` 相关页面；当前紧凑列表和详情不显示星级。模板默认空字符串 |

### 4.2 下载与付费

| 参数 | 类型／示例 | 适用场景 | 作用 |
|---|---|---|---|
| `paid` | 布尔值：`false`／`true` | 所有文章 | 模板默认 `false`；为 `true` 时使用服务端激活码下载校验。**只锁下载区，正文仍公开** |
| `resource_id` | 字符串：`"copybook-excel-basics"` | 付费必填 | 与授权后台“资源编号”完全一致；不是 App ID、套餐 ID、文章地址或激活码 |
| `purchase_url` | HTTPS 网址 | 付费可选 | “前往购买”的跳转地址；为空或不是 `https://` 开头时显示“购买入口待配置” |
| `downloads` | 对象 | 免费网盘推荐 | 文末网盘入口，包含 `baidu` 和／或 `quark`；付费文章不在这里写真实地址 |
| `downloads.baidu.url` | 百度完整分享网址 | 免费百度资源 | 生成百度按钮，主机名须为 `pan.baidu.com` |
| `downloads.baidu.code` | 字符串：`"abcd"` | 可选 | 显示并可复制提取码；为空时尝试链接 `pwd`，再尝试正文中的百度提取码 |
| `downloads.quark.url` | 夸克完整分享网址 | 免费夸克资源 | 生成夸克按钮，主机名须为 `pan.quark.cn` |
| `downloads.quark.code` | 字符串：`"1234"` | 可选 | 显示并可复制提取码；为空时尝试链接 `pwd` |
| `link` | HTTP(S) 网址 | 旧文章或普通资源 | 网盘地址回退来源；没有百度／夸克下载项时显示“前往资源页面”。新网盘文章推荐用 `downloads` |

普通文章不分享资源时，可以删除 `link`、`downloads`。付费文章推荐把它们整个删除，真实下载配置只保存在授权系统。

## 5. 日期、草稿和置顶

### 5.1 发布日期

日常只写 `date` 最清楚：

```yaml
date: 2026-10-31T09:00:00+08:00
```

需要区分创作与发布时：

```yaml
date: 2026-10-30T20:00:00+08:00
publishDate: 2026-10-31T09:00:00+08:00
```

当前模板优先使用 Hugo 计算出的 `.PublishDate`，此例显示和排序使用 10 月 31 日；没有 `publishDate` 时通常回退到 `date`。仍没有有效日期时，尝试历史映射 `data/publication_dates.json`，然后尝试 `.Date`、Git 作者时间。

新文章自己填写 `date`。历史回填表不会在每次发文时自动新增记录；Git 作者时间也不保证等于首次发布时间。修改正文不会自动提升排序，`lastmod` 不控制当前列表顺序。

### 5.2 草稿与未来文章

| 情况 | 结果 |
|---|---|
| `draft: true` + `npm run build` | 不进入正常生产结果 |
| `draft: false` 且日期已到 | 可正常生成 |
| `npm run serve` | 显示草稿，因为实际运行 `hugo server -D` |
| `hugo server -D -F` | 同时预览草稿和未来文章 |
| `publishDate` 在未来 | 普通构建暂不发布，到期后需要重新构建 |
| `expiryDate` 已过期 | 普通构建不再生成；已上线旧页面还需重新部署才能消失 |

**写未来日期不等于配置好了自动定时发布。** 本站是静态站；没有另设定时构建时，Cloudflare 不会仅因时间到了自动重新生成文章。

### 5.3 置顶

```yaml
pinned: true
```

首页顺序：“置顶组按发布时间倒序 → 普通组按发布时间倒序”，排序后再分页，每页 20 篇，不会每页重复置顶。取消时改为 `false` 或删掉字段。

分类叫“置顶学习资料”不产生置顶效果；真正置顶仍须 `pinned: true`。`weight` 不能替代这个开关。发布时间完全一致时，不建议依赖它们之间的固定先后顺序。

## 6. 分类、标签与作者

推荐写法：

```yaml
categories: "学习资料"
tags: ["学习", "英语", "资源"]
author: "林书"
```

Hugo 自动生成分类和标签页，无需手建索引文件。新分类会出现在侧栏，通常按文章数量排列。已知名称使用固定色系，未知名称自动分配色系，不用给文章设置标签颜色。

现有规则支持的常见分类有：`学习资料`、`编程`、`软件工具`、`电子书`、`AI资源`、`音乐资源`、`影视资源`、`电影`、`副业项目`、`电商`、`图片资源`、`自媒体`、`其他资源`。这些是图库和图标规则中的名称，不限制新增分类，也不要求每个分类都有文章。

统一命名：“电子书”和“电子书籍”会成为不同分类。分类字段是复数 **`categories`**，不要误写成 `category`。Hugo 也接受数组 `categories: ["学习资料", "编程"]`，但当前导航和自动缩略图主要取一个分类，新文章推荐单分类。

作者名字会改变页面上的发布者；页面 HTML 的作者元信息仍取全站作者配置。姓名前的小方块显示姓名首字，不是可配置的作者照片。

## 7. 缩略图与正文图片

### 7.1 列表缩略图的实际优先级

1. 文章的 `thumbnail`。
2. 文章资源包中以 `thumbnail`、`cover`、`featured` 开头的匹配资源。
3. 文章的 `cover`。
4. 根据分类／匹配标签选取本地图库；匹配标签图库可以覆盖分类图库。
5. 通用图库回退。

**当前不会自动读取正文第一张图片作为缩略图。** 资源包有多张约定命名图片时，建议明确指定 `thumbnail`，不要依赖匹配顺序。自动图库按文章路径稳定选择；改名或移动文章可能改变自动分配的图片。

使用已有图片：

```yaml
thumbnail: "/images/thumbs/study-book-coffee.webp"
```

还可以使用：`/images/thumbs/tool-office.webp`、`/images/thumbs/code-lines.webp`、`/images/thumbs/book-library.webp`、`/images/thumbs/ai-robot.webp`、`/images/thumbs/film-cinema.webp`、`/images/thumbs/music-guitars.webp`。

自己上传时，将文件放在 `static/images/my-post/cover.webp`，配置：

```yaml
thumbnail: "/images/my-post/cover.webp"
```

路径不带 `static`，也不能填 `F:\...`。列表图是紧凑裁切显示，适合主体居中的方图，不适合密集文字截图。它不自动变成详情页封面或社交分享大图。

### 7.2 正文图片方式 A：集中放在 static

```text
content/excel-study-guide.md
static/images/excel-study-guide/step-1.webp
static/images/excel-study-guide/step-2.webp
```

正文引用：

```markdown
![第一步：打开工作表](/images/excel-study-guide/step-1.webp "打开后的界面")
```

### 7.3 正文图片方式 B：文章资源包

```text
content/excel-study-guide/
  index.md
  cover.webp
  step-1.webp
```

文章文件用 `index.md`，不要误写成 `_index.md`。正文可用 `![操作示意](step-1.webp)`，当前图片模板会正确解析资源。资源包的 `cover.webp` 也能自动作为缩略图，通常不必再写 `cover: "cover.webp"`。

如果显式配置资源包缩略图，应使用它最终的站内路径，例如 `/excel-study-guide/cover.webp`，并确保与文章输出 URL 一致；更简单的是保留约定命名让资源包自动解析。

Markdown 图片可以点击放大，Esc 关闭；独立占一行的图片，其引号标题会显示为图注。只设置缩略图不会在正文插入图片，正文图需要自己写图片语法。

## 8. 免费下载与普通资源入口

### 8.1 免费网盘文章：完整模板

```yaml
---
title: "表格基础练习资料"
date: 2026-10-31T09:00:00+08:00
draft: false
pinned: false
paid: false
categories: "学习资料"
tags: ["学习", "工具", "资源"]
description: "配合表格入门学习的公开练习资料与操作说明。"
thumbnail: "/images/thumbs/tool-office.webp"
downloads:
  baidu:
    url: "https://pan.baidu.com/s/替换为真实分享标识"
    code: "abcd"
  quark:
    url: "https://pan.quark.cn/s/替换为真实分享标识"
    code: ""
---

这里介绍资料内容、适用人群和使用方法。

## 包含内容

- 练习文件
- 使用说明
```

下载面板自动位于完整正文之后，不用自己写按钮。只有一个网盘就删除另一个子项；免费面板仍展示两个服务商，缺少的显示“暂未提供”。没有提取码就填 `""` 或删除 `code`。

### 8.2 读取优先级与提取码

每个网盘先读自己的 `downloads`。未配置网址时，从旧 `link` 和正文中找对应网盘，带 `pwd=` 的候选通常优先。不要在一个资源里配置多份不一致的旧分享地址。

提取码先用 `code`，再读网址中的 `pwd`。百度还会尝试读取正文 `提取码：abcd`／`提取码: abcd`；夸克没有这个正文提取码回退。新文章推荐明确配置，避免自动猜测。

网址已经有 `pwd=旧码`、但 `code` 填了新码时，当前模板不会自动覆盖网址里的旧值。应让两者一致，或删除网址中的 `pwd`，只填 `code`。

免费入口允许 HTTP／HTTPS，建议使用 HTTPS 完整分享网址。系统不自动检测分享有效期；更新分享链接后还要检查正文旧地址。

### 8.3 普通外部网站或其他网盘

```yaml
paid: false
link: "https://example.com/resource"
```

未识别到百度／夸克下载项时，文末显示“前往资源页面”。可用于网站、在线工具、迅雷等其他入口，不会自动生成它们的品牌 Logo 或提取码面板。

## 9. 激活码付费资源

**正文、目录、图片和摘要仍公开，只有下载区需要激活码。** 不要把应受保护的地址、提取码、二维码、截图入口或其他绕过链接放进公开内容。

### 9.1 先配置授权系统

打开[林书授权系统](https://linshu-license-center.pages.dev/)，按顺序操作：

1. **应用管理**：使用“技能之书”，App ID 为 `app_copybook`。
2. **套餐管理**：为本资源新建独立永久或按天套餐；每个资源单独买码，不共用其他资源套餐。当前免登录入口不支持次数额度套餐。
3. **受保护资源**：填写唯一编号和标题，选择该应用及套餐，填写真实百度／夸克地址与提取码，状态设为启用。一个套餐只绑定一个资源。
4. **授权码批次**：选相同应用和套餐，生成、导出激活码，在淘宝等平台销售。测试码和销售库存不提交博客 Git。
5. **博客文章**：只配置相同的资源编号、购买页面和公开介绍。

资源创建后不允许更换产品和套餐；可修改标题、下载地址和状态。改变售卖范围时，新建资源编号及套餐，避免旧码意外获得其他商品权限。

### 9.2 付费文章完整模板

```yaml
---
title: "Excel 实战课程资料包"
date: 2026-10-31T09:00:00+08:00
draft: false
pinned: false
paid: true
resource_id: "copybook-excel-basics"
purchase_url: "https://example.com/buy/excel"
categories: "学习资料"
tags: ["学习", "工具"]
author: "Lucida"
description: "课程目录、适用人群和学习说明，购买后使用激活码获取下载地址。"
thumbnail: "/images/thumbs/tool-office.webp"
---

这里介绍课程内容和适用人群。

## 资源目录

- 入门讲解
- 配套练习
- 案例资料

购买后，在文末输入本资源的激活码，即可查看网盘下载地址。
```

`copybook-excel-basics` 是已有示例编号；发布新商品必须替换为该商品在授权后台创建的编号。`example.com` 也要换成实际销售链接；没有购买页时填写 `purchase_url: ""`，显示“购买入口待配置”。

`resource_id` 必须小写英文或数字开头，后续只允许小写英文、数字、`-`、`_`，总长 1～96 字符，须与授权后台完全一致。

### 9.3 付费文章的内容边界

`paid: true` 时，正文或任意元数据中出现百度／夸克 HTTP(S) 网盘地址会阻止构建。真实链接不能写进 `link`、`downloads`、描述或摘要，应只放在授权后台。

检查防止常见明文泄漏，但不识别所有二维码、截图、编码地址和第三方网盘。仍要人工确认公开材料中没有绕过入口。正文全文本身不是保密内容，也会进入搜索。

旧免费资源转付费前，先在网盘生成新链接，再配置授权后台；Git 历史、旧部署、其他人的收藏里可能还留着旧地址，单纯删除当前正文无法追回。

### 9.4 用户访问规则

- 无需账号，正确码只解锁对应资源。同一浏览器可以分别解锁多份。
- 本机会话最长 30 天；换浏览器、清理 Cookie 或会话到期后，可重新输入原码。
- 永久套餐不因浏览器会话到期而失效；按天套餐从首次激活计时，重输原码不会续期。
- 每次取下载信息都重新校验。停用产品、套餐、资源或匿名码后，后续请求会被拒绝；已经显示／复制走的地址无法收回。
- 原账号体系的设备数量设置不用于本免登录入口；没有购买者身份绑定，持有码的人也可能转发使用。
- `expiryDate` 是 Hugo 文章日期，不是授权套餐期限；套餐期限在授权系统管理。

需要维护接口和部署细节时，参阅 [paid-resources.md](paid-resources.md)。

## 10. 正文 Markdown 写法

页面会显示文章主标题，正文通常从简介和 `##` 二级标题开始，不必再写一次 `# 文章标题`。

````markdown
## 资源介绍

普通段落之间空一行。

**重点内容**，以及 [查看说明](https://example.com/help)。

### 资料清单

- 视频课程
- 配套文档

### 使用顺序

1. 阅读说明。
2. 完成练习。

> 这里是补充提示或引用。

![图片说明](/images/my-post/step-1.webp "独立图片的图注")

| 内容 | 说明 |
|---|---|
| 第一课 | 基础操作 |
| 第二课 | 实战案例 |

```python
print("Hello")
```
````

推荐 Markdown 图片和链接，不依赖原始 HTML；当前没有启用任意原始 HTML 渲染，也没有自定义短代码组件库，不要随意写 `{{< button >}}` 等未实现组件。

普通正文外链不会自动获得下载按钮的“新窗口”行为。`<!--more-->` 可用于划分 Hugo 摘要，但不会隐藏后半篇文章，更不会产生付费阅读全文。全文搜索取文章完整纯文本，不只取摘要。

## 11. 地址与进阶参数

仅在需要时使用：

| 参数 | 示例 | 作用及当前限制 |
|---|---|---|
| `slug` | `"excel-basics"` | 控制 URL 末级名称；根目录文章通常变为 `/excel-basics/`，不改变标题 |
| `url` | `"/resources/excel-basics/"` | 指定完整站内路径，建议 `/` 开头和结尾；不同于 `downloads.*.url` |
| `aliases` | `["/old-excel-guide/"]` | 旧地址生成 Hugo 跳转页；不等同于自动在 Cloudflare 创建服务器端 301 规则 |
| `publishDate` | `2026-11-01T09:00:00+08:00` | 正式发布时间，影响过滤及排序；到期仍需重新构建 |
| `expiryDate` | `2027-01-01T00:00:00+08:00` | 到期后在下一次普通构建中不再生成，非授权期限 |
| `lastmod` | `2026-10-31T12:00:00+08:00` | Hugo 最后修改时间，可供默认站点地图等使用；当前页面不显示“更新于”，也不按它排序 |
| `summary` | `"一句话摘要"` | Hugo 和 RSS 摘要，不会生成首页摘要区 |
| `weight` | `10` | 当前首页不靠它置顶，请使用 `pinned` |

保留旧地址的示例：

```yaml
slug: "excel-basics"
aliases:
  - "/old-excel-guide/"
```

已发布后改文件名、移动目录、转换资源包，都可能改变网址。先保存旧地址，再用 `url` 保留或用 `aliases` 跳转。付费 `resource_id` 不要因为文章改名而随意修改。

### 当前没有实现的字段或效果

- `avatar`、旧 SVG 头像和 `data/avatars.json` 已不使用。
- 文章 `og_image`、`images` 不控制当前分享图；模板只读全站 `params.og_image`。
- `price`、`password`、`activation_code`、`download_url`、`baidu_url` 等不是现有下载／付费配置，任意添加不会生效。
- 文章阅读量、点赞数、价格徽标、作者简介没有对应展示逻辑。
- `paid: true` 不能把整篇正文设置为保密。

## 12. 预览、检查、提交和上线

### 12.1 环境

需要 Hugo Extended、Node.js 和 Git，依赖安装命令是 `npm install`。当前模板已用 Hugo Extended 0.152.1 验证，太旧版本可能不支持图片渲染钩子。可用 `hugo version`、`node --version` 检查。

### 12.2 普通预览

```powershell
Set-Location -LiteralPath 'F:\linshutech\copybook'
npm run serve
```

这个命令包含草稿，所以“本地看到了”不代表生产会发布。未来文章可用 `hugo server -D -F`。端口被占用时可用 `hugo server -D --port 18479`，地址看终端实际提示。

### 12.3 付费完整预览

Hugo server 没有授权 Functions；激活码联调需要两边同时运行：

```powershell
# 终端一：授权 API
Set-Location -LiteralPath 'F:\linshutech\授权系统\apps\worker'
npx wrangler dev --local --port 8796
```

```powershell
# 终端二：博客及本站授权接口
Set-Location -LiteralPath 'F:\linshutech\copybook'
npm run build
npm run serve:access
```

通常访问 `http://localhost:18477/`。本地授权库要先应用迁移并建立产品、套餐、资源、测试码；生产码不会自动出现在本地。若用了专门的 `--persist-to` 数据库目录，迁移和开发服务必须使用同一个目录。

Service Binding 使用 `LICENSE_CENTER` 连接服务名 `linshu-license-center-api`，不用在文章里写管理员令牌和 API 密钥。只发普通文章不需要重新部署授权 Worker。

### 12.4 构建检查

```powershell
npm run build
```

失败时先修复报错。可用 `hugo list drafts`、`hugo list future`、`hugo list expired` 定位没有进入生产构建的文章。

涉及付费时可额外运行：

```powershell
npm run typecheck:access
npm run check:paid
```

`check:paid` 要求结果中至少有一篇付费文章。如果都是免费文章，会报 `Expected at least one gated resource page`，这不代表普通文章构建失败。不要为了通过检查把真实网址放回付费文章。

`public/` 是输出目录。普通 `hugo` 不应理解成必定清空所有旧文件；检查删文结果时可使用新的空输出目录，避免旧文件误导。不要手改生成的 `public/index.html`。

### 12.5 提交并确认线上

```powershell
git status --short
git diff -- "content/excel-study-guide.md"
git add -- "content/excel-study-guide.md" "static/images/excel-study-guide/step-1.webp"
git diff --cached
git commit -m "content: publish Excel study guide"
git push origin main
```

没用新图片时删掉命令中的图片路径。检查暂存区仅包含要发布的文件。Cloudflare Pages 的 `copybook` 项目完成这次 `main` 部署后，再检查首页、详情、日期、置顶、图片、下载入口；付费页还要看未解锁状态和源码。

文章标题、购买链接、置顶等博客内容变化需要重新构建。授权后台的网盘地址或停用状态变化，通常直接影响后续接口请求，不需要重新构建博客。

## 13. 网页后台的字段与限制

本站 `/admin/` 是**内容编辑后台**，林书授权系统是**产品、资源和激活码后台**，两者用途不同。

内容后台仍使用 Decap CMS＋原有 `git-gateway`／Netlify Identity。Cloudflare 静态托管不会自动提供这个登录服务。本指南确认了配置文件，不等于已验证后台登录可用；若无法登录，用 Markdown＋Git 发布即可。

表单已配置：标题、置顶、付费、资源编号、购买链接、发布时间、旧链接、百度／夸克地址及提取码、Mood、Categories、Tags、Body。表单中 Mood、Categories、Tags、Body 设为必填，这与手写 Markdown 可省略某些字段不同。

表单尚未配置 `author`、`description`、`thumbnail`、`cover`、`slug`、`url`、`aliases`、`summary`、`publishDate`、`expiryDate`、`lastmod`。需要它们时直接编辑 Markdown，不要假设表单里有开关。

后台上传图位置是 `static/images/`，公开图片前缀是 `/images/`。

## 14. 常见问题

| 现象 | 排查方法 |
|---|---|
| 本地有文章，线上没有 | 检查草稿、未来日期、Git 是否推送和 CF 是否部署成功 |
| 日期不正确／待补充 | 填有效 `date`，检查 `publishDate`，不要依赖历史映射或 Git 自动推断 |
| 置顶没生效 | 检查布尔值 `pinned: true`、是否看首页、是否部署；“置顶”分类名不会触发 |
| 更新正文却没排最前 | 当前按发布时间，不按文件修改时间或 `lastmod` |
| 缩略图空白 | 检查路径、文件提交、大小写；别写 `static/` 或本地硬盘路径 |
| 正文首图没成为缩略图 | 当前不做自动提取，配置 `thumbnail` 或资源包约定图片 |
| 图片本地正常，线上 404 | 图片漏提交、大小写不同、误用反斜线、资源包 URL 不匹配 |
| 免费下载区没出现 | 检查 `paid`、`downloads`／`link`、网盘主机名和完整分享网址 |
| 网盘提取码报错 | 检查 `pwd` 与 `code` 一致性及网盘分享本身 |
| 付费文章构建失败 | 检查编号格式及正文／元数据是否仍含网盘地址 |
| 购买入口待配置 | `purchase_url` 为空或非 HTTPS |
| 激活码失败 | 核对资源编号、套餐绑定、码套餐、启用状态、有效期、本地／生产环境 |
| Hugo 预览不能解锁 | 改用 Pages 本地服务并运行授权 Worker |
| 新分类图片不专属 | 未知分类用通用回退，需要时直接指定 `thumbnail` |
| 网页后台缺字段 | 按当前配置未暴露，请编辑 Markdown |
| 删除后本地还看到旧页 | 确认不是旧 `public/` 或设计原型，使用新空目录构建 |

## 15. 发布检查单

- [ ] 标题、实际日期、分类正确，`draft: false`。
- [ ] 时间带时区，未来日期是有意设置。
- [ ] `pinned`、`paid` 为不带引号的布尔值。
- [ ] 分类、标签没有拼写或重复命名问题。
- [ ] 图片路径正确，新图片已加入 Git。
- [ ] 免费资源的分享链接和提取码一致且可用。
- [ ] 付费真实地址只在授权后台，公开材料没有绕过入口。
- [ ] 付费编号、套餐、卡密批次及销售链接对应。
- [ ] 构建成功，按需检查付费功能。
- [ ] 暂存区只包含要发布的改动。
- [ ] 推送后 CF 部署成功，正式网址已打开验证。

## 16. 实现位置和核对依据

本指南涵盖当前默认文章模板、后台字段，以及主题实际读取的作者、缩略图、描述；进阶部分补充常用 Hugo 时间和地址参数。

| 功能 | 源文件 |
|---|---|
| 新建默认值 | [archetypes/default.md](../archetypes/default.md) |
| 全站配置、命令 | [config.toml](../config.toml)、[package.json](../package.json) |
| 后台字段 | [config.yml](../static/admin/config.yml) |
| 排序、置顶、分页 | [card.html](../layouts/partials/card.html)、[sorted-pages.html](../layouts/partials/sorted-pages.html)、[pinned-first.html](../layouts/partials/pinned-first.html) |
| 列表、详情 | [copy-card.html](../layouts/partials/copy-card.html)、[single.html](../layouts/_default/single.html) |
| 日期回退 | [publication-date.html](../layouts/partials/publication-date.html) |
| 缩略图 | [thumb-url.html](../layouts/partials/thumb-url.html) |
| 正文图片 | [render-image.html](../layouts/_default/_markup/render-image.html) |
| 免费下载 | [download-data.html](../layouts/partials/download-data.html)、[downloads.html](../layouts/partials/downloads.html) |
| 付费校验、展示 | [paid-policy.html](../layouts/partials/paid-policy.html)、[paid-downloads.html](../layouts/partials/paid-downloads.html) |
| SEO、RSS、搜索 | [meta.html](../layouts/partials/meta.html)、[rss.xml](../layouts/_default/rss.xml)、[index.json](../layouts/index.json) |
| 付费运营细节 | [paid-resources.md](paid-resources.md) |

Hugo 通用语法可查官方 [Front matter](https://gohugo.io/content-management/front-matter/)、[文章资源包](https://gohugo.io/content-management/page-bundles/)、[新建内容命令](https://gohugo.io/commands/hugo_new_content/)。通用文档提供的字段不代表本站主题都会展示，页面表现以当前模板为准。
