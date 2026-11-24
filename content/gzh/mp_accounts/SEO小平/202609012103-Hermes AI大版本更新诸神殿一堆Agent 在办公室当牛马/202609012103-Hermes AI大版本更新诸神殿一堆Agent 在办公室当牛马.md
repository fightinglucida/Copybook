# Hermes AI大版本更新：诸神殿？一堆Agent 在办公室当牛马

Hermes Agent 发了 v0.21.0，官方起名 The Pantheon Release。Pantheon，诸神殿。

听着唬人。翻完 release notes，我的画面是：这不就是给一群 Agent 开了间办公室，让它们当牛马吗。

![图片](https://mmbiz.qpic.cn/mmbiz_png/xmZsCMmouH9ibKldULnrq2rbyZEM6e50BlUoFPZonbSyxL7WPc52DsEvezPDbdl48ChOSFn7ZS3jQUDNxtkbkUvY4gMydvnebBs81KW3b4RU/640?wx_fmt=png&from=appmsg)

而且这次是真入职。以前它们是工具箱里的工具，要用的时候拿出来；现在它们有名字、有头像、有工位、还能拉群，是正经同事了，输入框里直接 @ 就行。

**Bot Mode 内置进桌面应用。**

每个 Agent 有名字、有头像、有员工名册、有自己的工位，还能进类似 Discord 的群聊。以前你是在用工具，现在你是在跟同事共事 —— 能叫出名字，有固定工位，聊过什么还能翻旧账。

**hermes peer 让同事之间能私聊了。**

Agent 可以按 handle 互相发私信，跨 profile、跨 gateway 都行。关键是对话都会进各自的 canonical Bot Chat—— 相当于企业微信聊天记录，可查、可追溯。以前多 Agent 最大的问题就是它们之间干了啥你完全看不见，现在聊天记录都是你的。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/xmZsCMmouH8IucnvPv02xXhj8IutwxCHY2cPficwvgHuSx9n2Ym2m4KcOR7aTKGkCyxQ9Sk0QjJYe8blBu04ic2YyicT4moTU0FgxHzu1mcY5o/640?wx_fmt=png&from=appmsg)

**Cron 终于有记忆了。**

官方原话：scheduled jobs stopped being goldfish—— 定时任务不再是只有几秒记忆的金鱼。现在的 cron 会加载、更新持久记忆，continuity=true 把上次输出带到下次。定时任务最气人的不是不会跑，而是每次都像第一天上班：昨天提醒过的今天再提醒一遍。一堆工程词，解决的朴素问题就一个：让这个天天来上班的牛马，别每天都像第一天入职。

**Subagents 可以实时调度了。**

老板视角：能看到谁在干活谁在摸鱼，能中途给某个 child 改方向，能提前掐掉一条支线还保留部分成果，花了多少钱也摆给你看。以前派任务是真黑箱，门锁着，只能最后收一沓报告；现在门开条缝，可观察、可干预、可约束 —— 比「更聪明」管用，聪明但管不住的员工最会整大活。

**MCP command center 是给供应商队伍装了个运维台。**

servers 和 catalog 合成一个页面，health checks 提前提醒你哪个账号快过期，还有成本用量面板。接的 MCP 越多越需要它，不然就是一堆 server、一堆 token、一堆快过期的认证 —— 外包供应商管理噩梦。这不是洁癖，是活命，每多接一个服务就多一个翻车入口。

![图片](https://mmbiz.qpic.cn/mmbiz_png/xmZsCMmouH9Xq7FU1AibTg5iaUA1iaFFHLlqHicc7Eud4ic7edq1KvN8DFicDicHyHlS6F08AUfEcf7M4gnPAyTuswje5RkOO8FNHKRuNKUqYTrVj4/640?wx_fmt=png&from=appmsg)

**Agent 终于能碰真电脑了。**

内置浏览器不只是能看，还能导航、点击、读内容。这块我还没亲手跑过，不敢装。但方向很对：Agent 不该永远活在隔离的文本框里，很多真活都在网页上。当然能碰电脑就有边界问题，所以安全加固放同一个版本，合理。

**安全这次是真上心。**

AGENTS.md、skills、memory 这些受保护指令文件，写入永远要 approval。最危险的死法就是被外部内容诱导偷偷改掉自己的长期指令 —— 那就不是 bug，是连人带工位一起被端了。还做了一轮脱敏清扫，Windows 危险命令进 approval，macOS 权限更新后能保留。Agent 产品成熟的标志不是 demo 多炸，是开始认真处理权限、审计、日志脱敏这些不浪漫的事。

**模型和供应商也很热闹。**

新增 Meta Model API（Muse Spark）等一批 provider，模型目录加了 GLM-5.3-Flash、qwen3.8-max、Gemini 3.7 Flash 等。最实用的是 model_overrides，能自己修补模型的上下文、价格或能力，不用等官方发版 —— 模型更新太快，上层不能自我修补就会被底层拖着走。

这版还有很多杂项修复，release notes 长到贡献者 760+ 位、约 5,800 次提交、2,475 个已合并 PR。但我今天不想被数量淹没，就抓一条线：

Hermes v0.21.0 不是把工具箱做得更大，是终于让 Agent 们入职了 —— 给名字、给工位、给记忆、给同事、给调度台、给门禁，正式成为能长期共事的部门。

这就是「诸神殿」的意思。不是因为每个神都更强，而是他们开始住进同一栋办公楼：有关系、有秩序、有边界，当然，也会有办公室政治。

单看很散，连起来是一条清楚的路线：让 Agent 从「能回话」变成「能在长期运行的工作系统里打长工」。

我的理解就一句话：Hermes Agent 正从「我能帮你干活」，走向「我能和别的 Agent 一起，在可追溯、可管理、有授权的办公室里长期干活」。

诸神殿也好，办公室也好，活儿得能一直干下去，才算数。