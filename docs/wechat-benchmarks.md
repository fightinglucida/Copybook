# 公众号对标库

本地运行 `npm run serve`，打开 `http://localhost:1313/gzh/`。对标库每页最多显示 30 个账号。搜索、筛选和排序覆盖全部账号。

## 新增、更新和移除账号

- **新增**：将采集系统 `static/mp_accounts/` 中选中的账号子文件夹整体复制到 Hugo 的 `content/gzh/mp_accounts/`，保留文件夹名及内部结构。每个子文件夹会自动生成一张卡片和一个详情页。
- **更新**：在 Hugo 的账号子文件夹里添加或移出要展示的文章。站内正文来自保留的 Markdown，正文引用的本地图片随文章导入。旧版同名 JSON、阅读数据 CSV，或目录内的 `articles.json` 也可以提供标题、摘要或原文入口。如果同一篇文章同时有 Markdown 和索引记录，移除两个来源后才会从列表消失。
- **移除**：将整个账号子文件夹移出 `content/gzh/mp_accounts/`。下一次构建会从卡片目录、筛选索引和静态输出中移除该账号。

改好目录后，重新运行 `npm run serve` 预览，或运行 `npm run build` 生成 `public/` 后部署。使用 Cloudflare Pages 时，构建命令为 `npm run build`，输出目录为 `public`。`content/gzh/_index.md` 管理入口标题和简介。现有账号的原地址、分类和排序已经迁入各自目录，新账号直接使用采集目录即可。

## 账号资料和历史统计

构建会读取账号目录里的 `account_profile.json`、`avatar.*`、`read_trend_30d.json`、`account_metrics.json` 和旧版文章索引。弹窗左侧显示可用的账号资料、历史统计及近 30 天阅读趋势。卡片显示阅读趋势、统计区间内的阅读量和发文量、文章总数及有阅读数据的篇数。收录数按当前可展示的文章计算。文章总数使用已采集的历史统计，所以可能高于站内收录数。只有趋势且没有完整统计快照时，可在账号目录的 `hugo-account.json` 设定 `total_articles` 来补充采集文章总数。统计快照里的文章只用于补充统计与已保留文章的阅读、点赞和原文链接。

构建只读取 Copybook 内的账号子文件夹，自动生成页面和静态索引。有 `account_metrics.json` 时使用目录内已有的历史统计。缺少快照时，从目录内的趋势文件和已收录文章计算可用统计。`hugo-account.json` 用于调整排序、分类、页面路径等账号设置，`articles.json` 可以补充手选文章，这两个文件按需添加。

账号页和弹窗的历史文章每页最多显示 12 篇，默认按阅读量从高到低排序，也可按发文日期正序或倒序查看。搜索覆盖账号全部可预览文章。首屏只加载当前页条目，翻页、搜索或更改排序时按需读取静态索引，打开文章时才加载正文。索引中有原文链接的文章会显示「打开微信原文」。只有索引的条目可以显示摘要或跳到微信阅读。

## 配置历史文章下载

复制采集系统的账号文件夹后，构建会从 `account_profile.json` 自动读取 `baidu_netdisk_url`（百度网盘）和 `quark_netdisk_url`（夸克网盘）。账号弹窗只显示已填分享地址的网盘按钮。点击按钮后，用对标库通用口令解锁。两个字段都为空时，账号资料和文章仍照常显示。

需要配置其他网盘或手工填写提取码时，可以在该账号目录使用 `downloads.json`。`code` 是网盘提取码，可省略，`other` 可以填多项。

```json
{
  "baidu": { "url": "https://pan.baidu.com/s/示例", "code": "abcd" },
  "quark": { "url": "https://pan.quark.cn/s/示例" },
  "other": [{ "name": "阿里云盘", "url": "https://www.alipan.com/s/示例" }]
}
```

构建从 `config.toml` 的 `[params.wechat_benchmark]` 读取 `download_password` 来加密分享地址。请用引号填写口令，以保留前导零。只有该字段为空或省略时，才读取 `WECHAT_BENCHMARK_PASSWORD` 环境变量。通过 Hugo 管理器启动预览、检查生产构建或验证待发布文件时，也会执行账号同步。保存配置后重新构建，或在管理器里停止再启动预览。

`download_password` 会以明文保存在源码配置中。若源码仓库公开，请把字段留空，并在本机或部署平台的构建环境设置 `WECHAT_BENCHMARK_PASSWORD`。

`account_profile.json` 是构建输入，可能包含采集端写入的明文分享地址。向公开仓库提交账号前，把真实地址保存在该账号目录下由 Git 忽略的 `downloads.json` 中，并清空 `account_profile.json` 的网盘链接字段。运行 `npm run wechat:encrypt -- <downloads.json 路径>`，将生成的密文作为 `downloads_encrypted` 写入同目录的 `hugo-account.json`，保留其中已有的账号设置。`download_providers` 可填写 `baidu`、`quark` 或 `other`，用于分别显示对应入口。省略时使用统一的「网盘下载」入口。

构建优先使用已经保存的密文。更换分享链接或通用口令时，使用本地的 `downloads.json` 重新加密，并更新 `hugo-account.json` 中的密文和网盘类型。公开仓库的构建可直接使用密文。

口令校验和解密在浏览器进行，支持 HTTPS 和 localhost。关闭下载弹窗后再次查看下载，需要重新输入通用口令。静态文件中的密文可被下载并离线猜测，四位数字口令尤其容易被穷举。共用口令和已解锁的第三方分享地址都可以被转发。

## 配置付费购买入口

在 Hugo 管理器的「网站设置 → Hugo 配置文件」中编辑 `config.toml`，将 `[params.wechat_benchmark]` 下的 `purchase_url` 填成第三方发码平台的 HTTPS 商品链接。

```toml
[params.wechat_benchmark]
  purchase_url = "https://example.com/product/wechat-benchmark"
```

保存后重新构建。配置有效时，「前往付款」会在新标签页打开商品页。链接为空或格式无效时，按钮会停用。账户资料、历史文章和已有口令的解锁流程照常可用。

在发码平台把该商品的发货内容设为与站点构建所用口令一致。平台完成收款和发码，访客付款后回到对标库输入口令。更换通用口令时，需更新已保存的密文、同步修改平台发货内容并重新构建站点。
