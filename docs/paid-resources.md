# 免登录激活码与逐资源解锁

本功能复用林书授权系统（产品 App ID：`app_copybook`）。每篇付费资源对应一个独立套餐和资源编号；Excel 的码无法解锁 Python。普通访客无需账号，输入购买后收到的激活码即可获取对应网盘地址。

## 发布一份新资源

1. 在授权后台「套餐管理」中，为“技能之书”创建独立的永久或按天套餐。当前接入不支持次数额度套餐。
2. 在「受保护资源」中选择应用和该套餐，设置唯一资源编号，例如 `copybook-excel-basics`，填写标题、百度/夸克链接及提取码。一个套餐只能绑定一个资源。资源创建后不允许更换应用和套餐，以免旧码获得其他商品权限。
3. 在「授权码批次」中选择相同应用与套餐，生成并导出激活码，在淘宝或其他平台自行销售。销售页面不参与本站支付处理。
4. 在 Hugo 文章中设置以下字段；正文只放公开介绍、图片和目录。网盘链接和提取码保存在授权后台。

```yaml
paid: true
resource_id: copybook-excel-basics
purchase_url: "https://你的实际销售页面"
```

`purchase_url` 未填写时显示“购买入口待配置”。免费文章使用 `paid: false`，沿用 `downloads`、`link` 和正文链接的原有逻辑。

付费文章的 `resource_id` 必须与授权后台完全一致，支持小写英文、数字、短横线、下划线，最长 96 个字符。构建会拒绝把百度或夸克地址放进付费文章正文或元数据（包括标题、摘要、`link`、`downloads`），防止重新进入 HTML、搜索索引及 RSS。

## 访问与授权规则

- 激活码作为免登录凭证，可在换浏览器、清除 Cookie 后再次验证。不会创建用户账号。
- 本机使用 HttpOnly Cookie 保存随机会话，最长 30 天；激活码本身不存入 localStorage，前端也拿不到会话令牌。同一浏览器可同时保留多个资源的授权。
- 每次获取网盘地址都会重新查询资源、应用、套餐和激活码状态。停用资源、套餐、产品或已激活的免登录码后，后续请求立即被拒绝。
- 按天授权从首次激活开始计时，重复输入原码不会延长有效期。兑换截止日期仅限制首次激活。
- 后台“已兑换”的免登录码支持禁用。恢复后重新输入原码可继续使用，但不会重置其首次激活时间。原有账号授权仍由“授权记录”管理。
- 验证接口有限流，且会核对激活码对应的套餐。所有授权及下载接口均返回 `private, no-store`。

购买者可以转发自己的激活码和已显示的网盘地址。免登录模式没有购买者身份绑定，也不使用原账号模式的设备数量限制。之前已公开的分享链接及历史部署无法靠当前页面追回；正式售卖前请替换为新的分享链接。

## Cloudflare 部署与本地验证

Pages 通过 `wrangler.jsonc` 的 `LICENSE_CENTER` Service Binding 连接 `linshu-license-center-api`。无需把管理员令牌、授权系统密钥或真实网盘地址放进博客仓库。授权中心的 `ANONYMOUS_LICENSE_APP_IDS` 允许列表包含 `app_copybook`。

先部署授权系统的 `0007_anonymous_resource_access.sql` 数据库迁移及 Worker，再部署博客。页面仅通过本站 `/api/access/` 获取授权信息。Cookie 为同站、HttpOnly；HTTPS 部署额外设置 Secure。

运行 `npm run build`，然后 `npm run serve:access` 预览完整流程；同时需运行授权系统的本地 Worker，服务名与绑定一致。仅运行 Hugo server 不包含授权 API。

验证命令：

```sh
npm run typecheck:access
node scripts/check-paid-output.mjs public
```

`check-paid-output.mjs` 还支持用环境变量 `PRIVATE_RESOURCE_CONFIG` 指向仓库外的私有资源 JSON，扫描整个构建目录，检查受保护链接是否出现在其他公开文件中。私有配置和测试激活码不得提交 Git。

授权系统的 `scripts/anonymous-access-e2e.mjs` 验证逐资源权限、多个资源会话、重复激活、撤销、过期、非法链接、错误输入及限流；博客的 `scripts/test-access-http.mjs` 验证完整 Service Binding 和 Cookie 链路。测试均限制在本地运行。
