# Codex和Claude Code 模块化AI建站，可长期维护

我是2016年开始做独立站的SEO小平。今年已经10年了。最近AI建站很多人都在尝试，因为AI大多数是创建的纯静态网站，这个SEO小平太有经验了，因为十年前SEO小平创建的网站也有纯静态网站，也有Saas网站。而且这多年虽然SEO小平换到了不同的公司，但是每个公司里在SEO小平的坚持下都还保留了多多少少的几个纯静态电商网站（前端静态，后端结算支付这些是动态数据库）。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/xmZsCMmouHibDCViar1vDM2vMtqqQCEFpHfVuo0JfqTmJ1IxGfhu4L4Y1nfZiajZZDq5sqtVUkyF4Us2VXLF3zR6FFhyUO8n5MkLrrl895WM5s/640?wx_fmt=png&from=appmsg)

截图就是SEO小平自己公司的电商网站，纯静态网站，一直都能持续更新，现在收录数都有8000+ ， 之前做了很多程序化SEO自动生成一些新页面，所以现在未收录的数量达到了2万多，不过大部分被删除了。

![图片](https://mmbiz.qpic.cn/mmbiz_png/xmZsCMmouH9JV8F5ejkWN3BibOJh2cKMml0xUNRp8W2UAAtt5lau1gVibLTkp2Bfgugl5iaxgbJC221kF8icQiaap2PsJW8oHUCX4J36icI0y00fU/640?wx_fmt=png&from=appmsg)

在2026年5月我们的纯静态网站的流量都还是很好的。甚至都还在增长。我们创建这个纯静态网站的时候没有现在的Trae，也没有Cursor, 更没有Claude Code 和Codex 这么好用的AI工具。

我们当时是由PHP程序员把每种类型的页面模板打好，我们SEO运营就复制PHP程序员打好的HTML模板去填充新内容发布成新页面。我们直接使用Sublime编辑HTML代码，然后FTP发布到服务器。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/xmZsCMmouH9JmJibh7WRg6VwN1bFBmhcmX6Micia5WO5U0rNGaob8zs1nXuAcSo5Uy1A4J0ZWYDZyntvfJCSxicQ8CQdKVjlbPRSmhD5Z2mzB8k/640?wx_fmt=png&from=appmsg)

现在有了Codex 和Claude Code的AI助手，能把我们十年前那种纯静态网站效率提升十倍。那今天SEO小平就从AI时代的纯静态独立站开始聊聊。绝对的干货，让你成为AI建站老司机。

大家用Codex 或者 Claude Code这些 AI 做纯静态站，都只想着 "快点把网站做出来"，从来没提前规划过架构。 你把网站当成了 AI 一次性给你吐出来的一堆 HTML 文件，而不是一个可以持续维护的系统。

结果经常出错，例如：

每次发新页面，你都要重新写几百字的提示词："导航栏要这样，页脚要那样，配色要这个，URL 要那样..."改个导航，你要把所有页面的导航都改一遍，不然有的页面对，有的不对；过了半年，你忘了当时的提示词，忘了设计规则，这个网站就成了 "祖传代码"，碰都不敢碰；更惨的是，过两年你换了电脑，对话记录全没了，这个网站就彻底废了，只能重做。

而且我发现，很多人嘴里的 "AI 建站"，根本不是真的纯静态建站。 就是用 AI 生成个 HTML，然后复制粘贴到 WordPress 里发文章 —— 这算什么 AI 纯静态建站？这就是拿 AI 当个写代码的工具，本质还是用 WP 当后台，跟我们要的 "纯静态、低成本、高 SEO" 根本不是一回事。

那有没有办法，让纯静态 AI 建站，也能像 WordPress 一样好用？ 改哪个模块就改哪个，发新页面只需要说内容，不用管导航页脚，哪怕过 2 年你忘了所有提示词，只要找到项目里的文件，照样能维护？

当然有！这就是我最近摸透的方法：用Claude Code或者Codex 的 Skill，把你的网站彻底模块化、模板化。就像SEO小平十年前让程序员把每个页面类型都做成模板，我要发布博客就复制博客模板来新建页面，我要发布产品页面就复制产品来创建新页面，以此类推。

## 什么是 Skill？为什么它能解决维护问题？

很多人可能听过 Skill，但不知道这东西到底能解决我们建站的什么问题。

简单说：**Skill 就是给 AI 的 "标准化作业 SOP"**。所以你自己要先了解穿件一个网页需要什么SOP，然后让AI沿用你的方法提升效率。

你把 "导航栏要怎么做"、"博客页要遵循什么规则"、"SEO 要加什么结构化数据" 这些重复的、固定的规则，打包成一个独立的模块。 一次定义，永久复用。是不是很熟悉啊，其实这就是WordPress的主题的意思。

以后不管什么时候，只要你调用这个 Skill，AI 就会严格按照你定的规则来干活，不用你再重复教一遍。

它的结构特别简单，每个 Skill 就是一个文件夹，核心就是一个`SKILL.md`文件。

它和你之前用的那种一次性提示词完全不一样：

提示词是会话级的，对话关了就没了；Skill 是持久化的，存在你的项目里，永远在。提示词是碎片化的，每次都要重新写；Skill 是模块化的，调用就行。提示词是全量加载的，每次都要占你的 token；Skill 是按需加载的，只有用到的时候才加载，省超多 token。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/xmZsCMmouHicJLoCYE3SXxqqVy17wmaibxVZNvsOWuzVZf5F7BVpBCKrPYnUE2qAMax4QiamZFO2fNuRjcUibrp6MFRDWGJgCRfNLM3pByTjIk4/640?wx_fmt=png&from=appmsg)

## 第一步：提前规划你的 Skill 架构，像 WordPress 一样拆模块

核心思路就是：把网站拆成 "通用基础模块" 和 "页面模板模块"，就像 WordPress 那样。一句话说透，你即便用AI工具建站也必须是先要创建这个网站的主题，然后才去创建网站的内容，下面我提到的各种Skill其实就是主题之下的各个模块而已。

先做：通用基础 Skill（所有页面都要用）

这些是所有页面都要用到的东西，做一次，所有页面都能用。我给你列一下我常用的几个（以下只是简略举例，实际比这个要更详细才行）：

**全局 UI 规范 Skill**：定义整个网站的配色、字体、间距、响应式规则，比如主色调是 #2563eb，字体用 Inter，移动端断点是 768px，所有页面都必须遵循这个。**导航栏 Skill**：统一的导航组件，包含所有的链接、样式、移动端适配，改导航只需要改这个 Skill，所有页面自动更新。**页脚 Skill**：统一的页脚，版权、备案信息、友链、联系方式，改页脚只改这一个。**URL 规则 Skill**：定义所有页面的 URL 格式，比如博客是`/blog/{{slug}}`，产品是`/products/{{slug}}`，所有页面都不能乱。**全局 SEO Skill**：定义全局的 SEO 规则，比如 meta 标签的格式，图片必须加 alt，必须加面包屑导航，这些所有页面都要遵守。

### 再做：页面模板 Skill（不同页面用不同模板）

这部分就和 WordPress 的模板一模一样，不同类型的页面，用不同的 Skill。 不管你是做博客站，还是电商站，还是企业站，都能对应上。

比如做博客站，你需要这几个 Skill：

`blog-list-skill`：博客列表页的模板，自动列出所有博客，分页，每个博客显示标题、摘要、日期。`blog-post-skill`：博客详情页的模板，这个是最常用的！`blog-category-skill`：博客分类页的模板。`blog-tag-skill`：博客标签页的模板。

如果是电商站，你再加这几个：

`product-list-skill`：产品列表页。`product-detail-skill`：产品详情页，内置 Product 结构化数据，自动加价格、库存的标记。`product-category-skill`：产品分类页。`brand-page-skill`：品牌页。

### 自定义页面 Skill

除了上述各种类型的页面，你还可以自己增加其他模板，有一些独立的页面，比如案例展示、关于我们、联系我们、FAQ 这些，外接第三方表单界面，外接第三方聊天工具代码界面，这些你也可以做Skill，用来生成这些独立的页面，当然也可以直接单个生成，因为这些页面的数量本来就少。

看到了吗？这个 Skill 把所有的规则都定死了。其实就是像WordPress和Shopify一样给你主题和模板限制死，以后你要改什么就只需要改模板，而不是把全部页面都去改一遍，这样会导致大量页面出现bug

## 你像改导航就只去导航的Skill改一个文件即可，其他页面不受影响。用起来有多爽？发博客只需要一句话，改视觉颜色这些也只改一个Skill就全网站同步。

建好这些 Skill 之后，你会发现，维护网站简直太轻松了。

### 发新博客？一句话的事

以后你要发新博客，根本不用写一堆提示词。 你只需要跟 Codex 说一句话：

调用`blog-post-skill`，帮我发布一篇新博客，标题是《2026 年小语种 SEO 的新机会》，大纲是：1. 英语市场的内卷现状 2. 小语种市场的空白机会 3. 普通人的落地方法。。。。。。

就这一句话！ AI 就会自动帮你生成完整的博客页面：

自动加好统一的导航、页脚自动生成正确的 URL自动加好所有的 SEO 标签、结构化数据自动把你的内容整理成符合规范的页面 你什么都不用管，直接把生成的 HTML 文件部署上去就行！

比如，过了半年，过 2 年忘了所有提示词？Codex的上下文也没了，甚至你电脑都换了，本地电脑的文件全删了，只要线上还有你的Skill在，照样能维护，所以文章开头你看到SEO小平自己公司的纯静态网站有8000多个页面，照样是能正常维护，新增和删除都可以不断更新。

这就是可维护性！你的网站不是一堆零散的 HTML 文件，它是一个有规则、有架构的系统，这些规则都持久化在你的 Skill 里，永远不会丢。

## 不必担忧：AI建站会不会有流量

## 第一必须进行全面关键词调研，找到有搜索量的词去创建内容

## 其实看了SEO小平自己公司的纯静态网站你已经知道答案了，肯定是有流量。本质是你自己有没有使用SEMrush或者Ahrefs去调研关键词的问题。不是你拿到AI就疯狂铺页面数量，你要调研关键词啊，看教程：给小白的宝典:SEO关键词调研和布局-文字+视频

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/xmZsCMmouH9E0pe3GbmBPvrXlgJIhBrDZN1NHGnXEgB1BBNvRPLFdIjTWAVr1C9dPX6kicjoYIHiaLfMBgibvvdjsjxvWDMprjhIHFr0A26tWI/640?wx_fmt=png&from=appmsg)

## 如截图这样，你的找到有搜索量的你的行业关键词去做内容才有可能有流量，不是你想创建什么就写什么。

## SEO小平多年的实战经验：没有进行关键词调研，不准建网站，无论是AI创建还是人工创建，都必须先调研关键词，后创建网站

## 第二网站上线一个小时内必须使用尖叫青蛙进行诊断。

## 尖叫的青蛙是模拟谷歌蜘蛛对你网站进行爬行，并告知你诊断结果，你要看哪里有404 ，哪里有301， Title缺少了还是重复了，H标签布局了关键词了吗？等等

![图片](https://mmbiz.qpic.cn/mmbiz_png/xmZsCMmouH8CPc0epw7cyQmqLNJ9I3gS9D75t9NYicGrkicxAfZwuk9q3nKLPxW5ibA3uGL2aN9EXRAVX4CWXxks54kqWeBqic13EWg4rJDWj1s/640?wx_fmt=png&from=appmsg)

## 还有纯净态网站最容易产生孤岛页面，例如你本地创建了80个页面，发布到服务器之后尖叫青蛙只爬到50个页面，就意味着蜘蛛找不到其他30个页面，你就白做了30个页面。这就是你内链规划有问题，SEO小平有两篇文章详细介绍了SEO网站的内链规划：

## SEO小平参加深圳WordPress线下沙龙MeetUp

## 独立站SEO内链布局指南

## 当然AI建站的方式方法很多，SEO小平提到的是我自己实操的方法，其他方法你们也可以尝试。尤其我们AI建站群我看到很多程序员有其他软件来操作。SEO小平的思路就是按照WordPress的主题模块化的思路来AI建站。根据SEO小平的策略去开始你的AI建站吧。