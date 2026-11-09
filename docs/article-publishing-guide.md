# 技能之书：文章发布与配置完整指南

核对日期：2026-11-07。适用项目：`F:\linshutech\copybook`。正式网站：[技能之书](https://copybook-3w6.pages.dev/)。

本指南根据当前文章模板、页面模板、Hugo 配置、网页后台和资源入口整理。日常发布推荐直接编辑 Markdown，再通过 Git 推送到 `main`。本地保存、Git 提交、Cloudflare 部署是三个不同步骤，部署成功后文章才会在线上更新。

## 目录

- [1. 最快发布一篇文章](#1-最快发布一篇文章)
- [2. 项目目录与发文的关系](#2-项目目录与发文的关系)
- [3. YAML 配置怎么写](#3-yaml-配置怎么写)
- [4. 文章参数完整说明](#4-文章参数完整说明)
- [5. 日期、草稿和置顶](#5-日期草稿和置顶)
- [6. 分类、标签与作者](#6-分类标签与作者)
- [7. 缩略图与正文图片](#7-缩略图与正文图片)
- [8. 免费下载与普通资源入口](#8-免费下载与普通资源入口)
- [9. 外部购买与发码平台](#9-外部购买与发码平台)
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
categories: "学习资料"
tags: ["学习", "工具"]
author: "Lucida"
description: "适合零基础读者的 Excel 学习顺序、练习方法和常见问题。"
cover: "/images/my-post/cover.webp"
---

这里写文章开头，说明适合谁读、可以学到什么。

## 先学什么

从单元格、工作表和常用公式开始。

## 怎么练习

每天选择一张真实表格完成一个小练习。
```

这篇文章没有下载配置，因此文末没有下载区。分享网盘使用第 8 节模板，跳转外部购买平台使用第 9 节模板。示例时间是北京时间，正式使用时换成实际发布时间。

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
| `wrangler.jsonc` | Cloudflare Pages 静态输出目录配置 | 普通发文不用 |
| `docs/` | 项目操作说明，不会成为网站文章 | 查阅即可 |
| `public/` | 构建生成的文件 | 不手改，不作为文章源文件提交 |
| `design-preview/` | 旧的设计审核原型 | 不是正式文章编辑入口 |

公开文章、图片和静态文件都可以被访客读取。需要收费的资源，在文章中填写外部平台商品入口；购买、发码和下载交付由目标平台处理。

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
- `true`、`false` 不加引号。不要写 `pinned: "true"`，它们是字符串，可能造成错误行为。
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
| `categories` | 字符串：`"学习资料"` | 建议必填 | 分类索引、侧栏、分类徽标、详情导航及默认文字封面；推荐一篇一个分类 |
| `tags` | 字符串数组：`["学习", "工具"]` | 建议 2～5 个 | 标签页、搜索、热门标签、帖子标签；列表最多取前三个，手机可能进一步精简，详情展示全部 |
| `author` | 字符串：`"林书"` | 可选 | 列表、详情和本帖信息的作者；未填使用全站作者，当前为 `Lucida`。填一个名字，不填对象／数组 |
| `description` | 字符串，一两句简介 | 建议填写 | SEO 和社交分享描述；未填通常从摘要提取，不是首页摘要段落 |
| `summary` | 字符串，短摘要 | 可选 | Hugo 摘要，影响 RSS 和未填 `description` 时的描述来源；首页没有独立摘要栏 |
| `thumbnail` | 图片路径 | 可选 | 兼容旧封面配置；未填 `cover` 时读取 |
| `cover` | 图片路径：`"/images/my-post/cover.webp"` | 可选 | 首页及分类、标签列表的4:3封面，优先于 `thumbnail`；未配置图片时显示分类名称 |

### 4.2 下载与外部入口

| 参数 | 类型／示例 | 适用场景 | 作用 |
|---|---|---|---|
| `downloads` | 对象 | 公开网盘推荐 | 文末网盘入口，支持 `baidu`、`quark` 和 `other`；只显示填写了有效链接的项 |
| `downloads.baidu.url` | 百度完整分享网址 | 免费百度资源 | 生成百度按钮，主机名须为 `pan.baidu.com` |
| `downloads.baidu.code` | 字符串：`"abcd"` | 可选 | 显示并可复制提取码；为空时尝试链接 `pwd`，再尝试正文中的百度提取码 |
| `downloads.quark.url` | 夸克完整分享网址 | 免费夸克资源 | 生成夸克按钮，主机名须为 `pan.quark.cn` |
| `downloads.quark.code` | 字符串：`"1234"` | 可选 | 显示并可复制提取码；为空时尝试链接 `pwd` |
| `downloads.other` | 数组 | 其他网盘 | 每项填写 `name`、`url`、可选 `code`；支持任意数量，按填写顺序显示 |
| `link` | HTTP(S) 网址 | 网盘或外部平台 | 非百度／夸克的外部网址优先显示“前往资源页面”，适合购买、发码平台；填写百度／夸克地址时作为网盘回退来源 |

普通文章不分享资源时，可以删除 `link`、`downloads`。跳转外部购买平台时只需填写 `link`，不必配置网盘地址或其他付费参数。

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

现有规则支持的常见分类有：`学习资料`、`编程`、`软件工具`、`电子书`、`AI资源`、`音乐资源`、`影视资源`、`电影`、`副业项目`、`电商`、`图片资源`、`自媒体`、`其他资源`。这些是分类和图标规则中的名称，不限制新增分类，也不要求每个分类都有文章。

统一命名：“电子书”和“电子书籍”会成为不同分类。分类字段是复数 **`categories`**，不要误写成 `category`。Hugo 也接受数组 `categories: ["学习资料", "编程"]`，但当前导航和文字封面主要取一个分类，新文章推荐单分类。

作者名字会改变页面上的发布者；页面 HTML 的作者元信息仍取全站作者配置。姓名前的小方块显示姓名首字，不是可配置的作者照片。

## 7. 缩略图与正文图片

### 7.1 每篇文章的4:3列表封面

首页、分类和标签列表统一使用4:3封面。将图片放到 `static/images/文章目录/`，在文章顶部填写：

详情页右侧也使用同一张4:3封面，固定排列在“本帖信息”上方；没有图片时显示分类文字封面。窄屏下沿用原有侧栏隐藏规则。

```yaml
cover: "/images/my-post/cover.webp"
```

推荐1200×900像素或其他4:3图片。非4:3图片会居中裁切填满，不拉伸。路径不包含 `static`，也不要填写电脑硬盘路径。正文图片仍需使用 Markdown 图片语法，封面不会自动插入正文或替换社交分享图。

读取顺序：

1. 文章顶部的 `cover`。
2. 兼容旧字段 `thumbnail`。
3. 文章资源包中以 `cover`、`thumbnail`、`featured` 开头的图片。
4. 没有图片时显示文章的第一个分类名称；没有分类时显示“未分类”。

不再根据分类、标签或文章路径自动分配预设图片，也不会自动取正文第一张图片。网页后台可以通过“列表封面”上传或选择图片。

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

文章文件用 `index.md`，不要误写成 `_index.md`。正文可用 `![操作示意](step-1.webp)`，当前图片模板会正确解析资源。资源包的 `cover.webp` 也能自动作为封面，或显式填写 `cover: "cover.webp"`。

资源包封面支持相对资源名（如 `cover: "cover.webp"`），也可以使用图片最终的站内路径。

Markdown 图片可以点击放大，Esc 关闭；独立占一行的图片，其引号标题会显示为图注。只设置缩略图不会在正文插入图片，正文图需要自己写图片语法。

## 8. 免费下载与普通资源入口

### 8.1 免费网盘文章：完整模板

```yaml
---
title: "表格基础练习资料"
date: 2026-10-31T09:00:00+08:00
draft: false
pinned: false
categories: "学习资料"
tags: ["学习", "工具", "资源"]
description: "配合表格入门学习的公开练习资料与操作说明。"
cover: "/images/my-post/cover.webp"
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

下载面板自动位于完整正文之后，不用自己写按钮。配置几个有效网盘链接，就显示几个对应入口。没有填写链接的网盘不会显示；只有一个入口时占满一行。没有提取码就填 `""` 或删除 `code`。

只提供夸克网盘：

```yaml
downloads:
  quark:
    url: "https://pan.quark.cn/s/替换为真实分享标识"
    code: "1234"
```

此时只显示夸克网盘，百度及其他网盘不会占位。

其他网盘添加到 `other` 列表，可与百度、夸克同时使用：

```yaml
downloads:
  baidu:
    url: "https://pan.baidu.com/s/替换为真实分享标识"
    code: "abcd"
  quark:
    url: "https://pan.quark.cn/s/替换为真实分享标识"
    code: "1234"
  other:
    - name: "阿里云盘"
      url: "https://example.com/replace-with-aliyun-share"
      code: "5678"
    - name: "其他网盘名称"
      url: "https://example.com/replace-with-share"
      code: ""
```

`example.com` 为占位网址，请替换为相应网盘的完整分享地址。上例会显示四个入口；删除不需要的项即可。其他网盘使用通用下载图标，按钮显示自己填写的名称。

### 8.2 读取优先级与提取码

填写非百度／夸克的外部 `link` 时，优先显示外部跳转按钮。否则，只要 `downloads` 中填写了任意网盘网址，就仅显示这些配置项，不再从正文或旧 `link` 补出其他网盘。完全没有填写网盘网址时，兼容从 `link` 和正文识别百度／夸克链接。

百度／夸克提取码先用 `code`，再读网址中的 `pwd`。百度还会尝试读取正文 `提取码：abcd`／`提取码: abcd`。其他网盘使用自己填写的 `code`，只展示和复制，不自动修改分享链接。

网址已经有 `pwd=旧码`、但 `code` 填了新码时，当前模板不会自动覆盖网址里的旧值。应让两者一致，或删除网址中的 `pwd`，只填 `code`。

免费入口允许 HTTP／HTTPS，建议使用 HTTPS 完整分享网址。系统不自动检测分享有效期；更新分享链接后还要检查正文旧地址。

### 8.3 普通外部网站

```yaml
link: "https://example.com/resource"
```

填写非百度／夸克的 HTTP(S) 外部网址时，文末优先显示“前往资源页面”。可用于购买平台、发码平台、网站、在线工具、迅雷等其他入口，不会自动生成它们的品牌 Logo 或提取码面板。此入口优先于 `downloads` 和正文中自动识别的网盘地址。

## 9. 外部购买与发码平台

本站负责内容介绍和入口展示。需要收费时，在第三方平台建立商品，将商品页面填入文章的 `link`；用户点击后在新窗口完成购买、领取和下载。

### 9.1 完整模板

```yaml
---
title: "怀旧老照片素材合集"
date: "2026-11-07 10:05:00"
draft: false
categories: "素材资源"
tags: ["老照片", "怀旧"]
link: "https://example.com/buy/old-photos"
---

这里介绍素材内容、目录、适用人群和使用场景。

需要获取完整素材，请点击文末的“前往资源页面”，在目标平台购买并下载。
```

将 `example.com` 替换为实际商品或发码页面，按钮会直接打开该地址。文章只需配置一个 `link`，其余交易与交付设置均在目标平台完成。

### 9.2 配置说明

- 外部平台链接优先于网盘配置和正文的网盘识别，只显示外部资源入口。
- 收费资源建议删除文章中的公开网盘地址和 `downloads` 配置，完整资源在外部平台交付。
- 普通网站、在线工具也使用同一个 `link` 字段；不需要收费时无需做其他配置。
- 本站不接入支付或发码 API；售价、订单、发码及下载交付均在目标平台管理。
- 本地运行 `npm run serve` 就可以预览文章和跳转按钮，无需额外后端服务。

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

普通正文外链不会自动获得资源入口按钮的“新窗口”行为。`<!--more-->` 可用于划分 Hugo 摘要，但不会隐藏后半篇文章，更不会产生付费阅读全文。全文搜索取文章完整纯文本，不只取摘要。

## 11. 地址与进阶参数

仅在需要时使用：

| 参数 | 示例 | 作用及当前限制 |
|---|---|---|
| `slug` | `"excel-basics"` | 控制 URL 末级名称；根目录文章通常变为 `/excel-basics/`，不改变标题 |
| `url` | `"/resources/excel-basics/"` | 指定完整站内路径，建议 `/` 开头和结尾；不同于 `downloads.*.url` |
| `aliases` | `["/old-excel-guide/"]` | 旧地址生成 Hugo 跳转页；不等同于自动在 Cloudflare 创建服务器端 301 规则 |
| `publishDate` | `2026-11-01T09:00:00+08:00` | 正式发布时间，影响过滤及排序；到期仍需重新构建 |
| `expiryDate` | `2027-01-01T00:00:00+08:00` | 到期后在下一次普通构建中不再生成 |
| `lastmod` | `2026-10-31T12:00:00+08:00` | Hugo 最后修改时间，可供默认站点地图等使用；当前页面不显示“更新于”，也不按它排序 |
| `summary` | `"一句话摘要"` | Hugo 和 RSS 摘要，不会生成首页摘要区 |
| `weight` | `10` | 当前首页不靠它置顶，请使用 `pinned` |

保留旧地址的示例：

```yaml
slug: "excel-basics"
aliases:
  - "/old-excel-guide/"
```

已发布后改文件名、移动目录、转换资源包，都可能改变网址。先保存旧地址，再用 `url` 保留或用 `aliases` 跳转。

### 当前没有实现的字段或效果

- `avatar`、旧 SVG 头像和 `data/avatars.json` 已不使用。
- 文章 `og_image`、`images` 不控制当前分享图；模板只读全站 `params.og_image`。
- `price`、`password`、`download_url`、`baidu_url` 等不是现有下载配置，任意添加不会生效。
- 文章阅读量、点赞数、价格徽标、作者简介没有对应展示逻辑。
- 文章全文公开，收费资源请通过外部平台交付。

## 12. 预览、检查、提交和上线

### 12.1 环境

需要 Hugo Extended、Node.js 和 Git，依赖安装命令是 `npm install`。当前模板已用 Hugo Extended 0.152.1 验证，太旧版本可能不支持图片渲染钩子。可用 `hugo version`、`node --version` 检查。

### 12.2 普通预览

```powershell
Set-Location -LiteralPath 'F:\linshutech\copybook'
npm run serve
```

这个命令包含草稿，所以“本地看到了”不代表生产会发布。未来文章可用 `hugo server -D -F`。端口被占用时可用 `hugo server -D --port 18479`，地址看终端实际提示。

### 12.3 构建检查

```powershell
npm run build
```

失败时先修复报错。可用 `hugo list drafts`、`hugo list future`、`hugo list expired` 定位没有进入生产构建的文章。

`public/` 是输出目录。普通 `hugo` 不应理解成必定清空所有旧文件；检查删文结果时可使用新的空输出目录，避免旧文件误导。不要手改生成的 `public/index.html`。

### 12.4 提交并确认线上

```powershell
git status --short
git diff -- "content/excel-study-guide.md"
git add -- "content/excel-study-guide.md" "static/images/excel-study-guide/step-1.webp"
git diff --cached
git commit -m "content: publish Excel study guide"
git push origin main
```

没用新图片时删掉命令中的图片路径。检查暂存区仅包含要发布的文件。Cloudflare Pages 的 `copybook` 项目完成这次 `main` 部署后，再检查首页、详情、日期、置顶、图片、下载入口；外部入口还应确认目标商品页面正确。

文章标题、资源入口、置顶等博客内容变化需要重新构建。目标平台上的价格、发码与下载交付设置在外部平台管理。

## 13. 网页后台的字段与限制

本站 `/admin/` 是**内容编辑后台**，只编辑文章和资源入口。

内容后台仍使用 Decap CMS＋原有 `git-gateway`／Netlify Identity。Cloudflare 静态托管不会自动提供这个登录服务。本指南确认了配置文件，不等于已验证后台登录可用；若无法登录，用 Markdown＋Git 发布即可。

表单已配置：标题、列表封面、置顶、发布时间、资源入口链接、百度／夸克及其他网盘地址、名称和提取码、Categories、Tags、Body。表单中 Categories、Tags、Body 设为必填，这与手写 Markdown 可省略某些字段不同。

表单尚未配置 `author`、`description`、`thumbnail`、`slug`、`url`、`aliases`、`summary`、`publishDate`、`expiryDate`、`lastmod`。需要它们时直接编辑 Markdown，不要假设表单里有开关。

后台上传图位置是 `static/images/`，公开图片前缀是 `/images/`。

## 14. 常见问题

| 现象 | 排查方法 |
|---|---|
| 本地有文章，线上没有 | 检查草稿、未来日期、Git 是否推送和 CF 是否部署成功 |
| 日期不正确／待补充 | 填有效 `date`，检查 `publishDate`，不要依赖历史映射或 Git 自动推断 |
| 置顶没生效 | 检查布尔值 `pinned: true`、是否看首页、是否部署；“置顶”分类名不会触发 |
| 更新正文却没排最前 | 当前按发布时间，不按文件修改时间或 `lastmod` |
| 缩略图空白 | 检查路径、文件提交、大小写；别写 `static/` 或本地硬盘路径 |
| 正文首图没成为缩略图 | 当前不做自动提取，配置 `cover` 或资源包约定图片 |
| 图片本地正常，线上 404 | 图片漏提交、大小写不同、误用反斜线、资源包 URL 不匹配 |
| 下载区没出现 | 检查 `downloads`／`link`、网盘主机名和完整分享网址 |
| 外部购买入口没出现 | 在 `link` 填写完整 HTTP(S) 网址；外部平台链接会优先展示 |
| 网盘提取码报错 | 检查 `pwd` 与 `code` 一致性及网盘分享本身 |
| 没有显示图片封面 | 填写 `cover` 并检查文件路径；未配置时使用分类文字封面 |
| 网页后台缺字段 | 按当前配置未暴露，请编辑 Markdown |
| 删除后本地还看到旧页 | 确认不是旧 `public/` 或设计原型，使用新空目录构建 |

## 15. 发布检查单

- [ ] 标题、实际日期、分类正确，`draft: false`。
- [ ] 日期和时间正确，未来日期是有意设置。
- [ ] `pinned` 为不带引号的布尔值。
- [ ] 分类、标签没有拼写或重复命名问题。
- [ ] 图片路径正确，新图片已加入 Git。
- [ ] 免费资源的分享链接和提取码一致且可用。
- [ ] 收费资源的 `link` 指向正确的外部商品或发码页面。
- [ ] 构建成功，已检查资源入口跳转。
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
| 下载与外部入口 | [download-data.html](../layouts/partials/download-data.html)、[downloads.html](../layouts/partials/downloads.html) |
| SEO、RSS、搜索 | [meta.html](../layouts/partials/meta.html)、[rss.xml](../layouts/_default/rss.xml)、[index.json](../layouts/index.json) |

Hugo 通用语法可查官方 [Front matter](https://gohugo.io/content-management/front-matter/)、[文章资源包](https://gohugo.io/content-management/page-bundles/)、[新建内容命令](https://gohugo.io/commands/hugo_new_content/)。通用文档提供的字段不代表本站主题都会展示，页面表现以当前模板为准。
