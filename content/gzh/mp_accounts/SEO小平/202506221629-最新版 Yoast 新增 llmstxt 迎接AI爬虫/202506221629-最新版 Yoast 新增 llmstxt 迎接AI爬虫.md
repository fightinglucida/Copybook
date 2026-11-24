# 最新版 Yoast 新增 llms.txt 迎接AI爬虫

大家好！我是SEO小平，微信号直接复制Xiao_Ping_Up，或者扫描二维码

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/rlH2gcoQxhkRB490mCeWrWNVdufJFGXfEficjyYxR4L76GTgOPjekL1FFsuRo8iaf25Gejw5kX9osU77iandX9nww/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&tp=webp)

这几天在给陪跑学员教授Yoast SEO插件的时候发现最新版的Yoast是有llms.txt 一键生成的功能了。和你网站的xml站点地图一样，是一键生成的，不浪费你的时间，无需任何繁琐的工序即可完成，超级简单。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/rlH2gcoQxhmcQ2YibeWiaPTQo7ibcMTb23oLApuz6jmmMgXUTzUynoPZ5fBU06EMvPudgO4FJutWbiaf3qpja4RgHw/640?wx_fmt=png&from=appmsg)

Yoast自己的官方网站也上传了llms.txt 供AI爬虫抓取

https://yoast.com/llms.txt

注意：要最新版的Yoast插件才有此功能，旧版本的目前还没看到有这个功能。

既然现在不需要大家复杂的去手动制作 llms.txt 了，大家能加就加上吧，毕竟Yoast这里轻点一下按钮即可完成，不要什么成本，不花什么时间，主打一个“总比没有要好”。

其实一个多月之前就有SEO行业的朋友们来问llms.txt  这到底有没有用，我是觉得没太大作用的，因为AI你做为一个新生事物，你读取不了现有网站，你不可能让现在所有网站为你而改变去做一堆 llms.txt ，应该是你AI爬虫自己进行技术提升来升级你们的抓取和理解能力。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_jpg/rlH2gcoQxhmcQ2YibeWiaPTQo7ibcMTb23occCzic6y4mbibqibqdyFc7Og99ZXrEibIOscvlCGuf0MmztL71lhO4wsPQ/640?wx_fmt=jpeg&from=appmsg)

什么是llms.txt

`llms.txt`标准的提出旨在解决一个根本性挑战：大型语言模型（LLM）难以高效地解析标准网页，这些网页通常充斥着与核心内容无关的 HTML、JavaScript、CSS 和广告。对于上下文窗口有限的模型而言，这种解析过程缓慢、容易出错且效率低下。

为应对此问题，Answer.AI 的 Jeremy Howard 于 2024 年 9 月首次提出了一项解决方案：引入一个简单、结构化的纯文本 Markdown 文件（`/llms.txt`），作为 AI 的“备忘单”或“发现指南”。它能直接将 LLM 指向最核心、人类可读的内容，并剥离掉所有噪音。此外，该提案还鼓励网站通过在原始 URL 后附加.md来提供页面的纯净 Markdown 版本，使内容能被 AI 工具直接消化

#### 主要 AI 开发商的官方对 llms 的评价

**谷歌 (Gemini)**：谷歌的 John Mueller 态度明确。他在 Bluesky 上表示：“**仅供参考，目前没有任何 AI 系统使用 llms.txt**”。他还说，服务器日志显示，消费者级别的 LLM 会抓取网页，但“它们中没有一个会去抓取 llms.txt 文件”。他对该标准未来的采用表示深度怀疑，将其比作买彩票，并类比为早已过时的keywords元标签。![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/rlH2gcoQxhmcQ2YibeWiaPTQo7ibcMTb23o9eLJC2x18HzczCxiau7KehUQor3TyG4lJoVCPURejtaR70QKhVhXumg/640?wx_fmt=png&from=appmsg)**OpenAI (ChatGPT)**：OpenAI 为其爬虫（如`GPTBot`、`ChatGPT-User`）发布的官方文档中并未提及`llms.txt`。ChatGPT官方文档只详细地说明了如何使用`robots.txt`来授予或拒绝访问。**Anthropic (Claude)**：同样，Anthropic 为其爬虫（如`ClaudeBot`、`Claude-User`）发布的文档也详细说明了通过`robots.txt`进行控制，甚至提到了非标准的`Crawl-delay`指令，但完全没有提到`llms.txt`。尽管 Anthropic 自己的文档网站和一些相关项目使用了`llms.txt`文件，但公司官方的爬虫政策并未承认其是用于控制外部网站的机制。

llms.txt 不是AI的灵丹妙药，核心还是要关注内容本身的质量

**专注于内容质量和结构**。为人类编写清晰、组织良好的内容。使用正确的 HTML 标题（H1, H2 等）、列表和结构化数据（Schema.org）。这使得内容对*人类和 AI*都更容易解析，是比依赖一个单独文件远为有效的策略。**`llms.txt`照样添加上，但不要花太多精力**既然Yoast能轻松搞定，那肯定还是把他添加上，总之没有坏处，有没有AI流量的好处，还不知道。![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/rlH2gcoQxhmcQ2YibeWiaPTQo7ibcMTb23oLUhO3k2XtI8LfO3vf3yCy1SNHRQXc3HTcKTzaRGm9tgDkX3AEWic2OA/640?wx_fmt=png&from=appmsg)

关注我的公众号，我会持续更新独立站SEO干货。

微信号直接复制Xiao_Ping_Up，或者扫描二维码

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/rlH2gcoQxhkRB490mCeWrWNVdufJFGXfEficjyYxR4L76GTgOPjekL1FFsuRo8iaf25Gejw5kX9osU77iandX9nww/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&tp=webp)

**以往的文章也是干货，欢迎阅读和转发**

**[独立站 SEO 全面指南](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484576&idx=1&sn=e0490ea52b034bc7e14f29c62cb10370&scene=21#wechat_redirect)**

**[SEO 必备 HTML 代码知识](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484548&idx=1&sn=beed5dc3dc0ffb5d19814d989f1e8832&scene=21#wechat_redirect)**

**[SEO必须知道的谷歌算法](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484229&idx=1&sn=be2d3c77f0cc700d86d7a87024160b86&scene=21#wechat_redirect)**

**[Google SEO 术语扫盲贴，你是否都知道这些含义](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247485251&idx=1&sn=3da8de24af79374bb653a71f861c0311&scene=21#wechat_redirect)**

**[社媒短视频流量那么大，2025还要不要做外贸独立站](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484804&idx=1&sn=07050c94b1708c7417f44ada4182f377&scene=21#wechat_redirect)**

**[AI就是个充气娃娃，摆弄什么姿势（知识）取决于你的技术](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247485194&idx=1&sn=4a412a4af95e1b9947eaeb552411ca43&scene=21#wechat_redirect)**

**[谷歌算法又双叒叕更新？Google SEO算法为啥一直在更新？](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247485213&idx=1&sn=9c3f9f31ba5a403c096ccf73aa12e7b3&scene=21#wechat_redirect)**

**[谷歌SEO需要多久才会有效果?](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484395&idx=1&sn=a38ed3b0a768e5a9741bb87f9ad61ff3&scene=21#wechat_redirect)**

**[给小白的宝典:SEO关键词调研和布局-文字+视频](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484348&idx=1&sn=98d34eea3199b8a4781f43d27a9b627c&scene=21#wechat_redirect)**

**[Google内部的顶级域名变更对小语种 SEO 没有任何影响](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247485316&idx=1&sn=d86ca70b42bc6c676f012102ebffec9d&scene=21#wechat_redirect)**

**[SEO外链就是 “伟哥”，SEO小平教你怎么服用](https://mp.weixin.qq.com/s?__biz=Mzg4MDczMTExNg==&mid=2247484621&idx=1&sn=ed91aa336a68c1914d122965f7e13af3&scene=21#wechat_redirect)**