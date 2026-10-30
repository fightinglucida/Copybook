# 发布文章与下载配置

激活码付费资源请先阅读 [免登录逐资源授权](paid-resources.md)。付费文章的真实链接需要在授权系统配置，不能填写在文章正文或下方免费资源的 `downloads` 字段中。

正式地址：https://copybook-3w6.pages.dev/ 。界面仅提供浅色模式。

## 首页置顶

在文章头部设置 `pinned: true`，即可让帖子排在首页列表最前面，并在标题旁显示“置顶”标记。后台编辑文章时也可以打开“首页置顶”开关。取消置顶时改为 `pinned: false` 或删除该字段。

多篇置顶帖之间按发布时间从新到旧排列；所有普通帖子紧随其后，也按发布时间从新到旧排列。先排序再分页，每篇文章只出现一次。置顶仅影响首页，分类、标签及 RSS 继续按原有发布时间排序。未配置 `pinned` 的历史文章按普通帖子处理。

```yaml
pinned: true
```

## 新建文章

新建文章使用 `hugo new content/文章名称.md`，修改生成的 Markdown，完成后将 `draft` 设为 `false`。发布日期使用文章的 `publishDate` 或 `date`；未填写日期的历史文章使用 `data/publication_dates.json` 中记录的 Git 首次加入时间，供列表、详情、搜索与 RSS 一致展示。历史回填时间代表仓库收录时间，不能保证等于最初创作时间。

```yaml
---
title: "文章标题"
date: 2026-10-30T18:00:00+08:00
draft: false
categories: "学习资料"
tags: ["学习", "资源"]
downloads:
  baidu:
    url: "https://pan.baidu.com/s/真实分享标识"
    code: "abcd"
  quark:
    url: "https://pan.quark.cn/s/真实分享标识"
    code: ""
---

这里写正文。

![图片说明](/images/你的图片.jpg "可选图片注释")
```

将图片放在 `static/images/` 下，或将文章改为包含 `index.md` 和图片的 page bundle。正文支持 Markdown 图片、引用、列表、表格和代码块；图片可以点击放大，按 Esc 关闭。下载区自动放在正文之后。

网盘优先读取 `downloads`；未配置时兼容旧的 `link` 字段和正文中的百度、夸克链接。只提供一个网盘时，另一个入口显示“暂未提供”。链接中的 `pwd` 会作为提取码，百度正文中的“提取码：abcd”也可识别。没有网盘链接但存在普通 `link` 时，显示“前往资源页面”。这些入口仅呈现已配置的地址，不检测网盘分享的有效期。

后台字段也已加入发布日期和两种网盘配置。后台仍依赖原有 git-gateway 登录服务；本次没有迁移其认证后端。也可以直接编辑 Markdown 后提交。

帖子列表使用本地 WebP 缩略图；可以通过文章的 `thumbnail` 或 `cover` 字段指定图片，未指定时按分类、标签及文章路径稳定选择缩略图。品牌 Logo 来源记录在 `docs/brand-assets.md`，字体和图标授权位于 `static/licenses/`。

运行 `npm run serve` 本地预览，运行 `npm run build` 构建至 `public/`。Cloudflare Pages 的主分支为 `main`，构建输出目录应为 `public`，Hugo 版本至少为 0.152.1。界面 CSS 与 JS 由 Hugo 内置管道压缩并生成内容哈希。
