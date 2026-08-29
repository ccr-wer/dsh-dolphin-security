# Agent Note: 宠物碎碎念跟随上下文与当前会话

Status: implemented

## Problem

宠物的内心独白（碎碎念）与用户正在看的内容对不上。碎碎念引擎只以模型流式输出的 chunk 文本为输入：关键词规则按子串触发（讨论"错误处理"也会唤醒报错心境），按输出量累积的环境池则播放纯人设台词（"窗外鸟叫了两声"），与会话在干什么毫无关系。碎碎念还挂在宿主全局视图字段上、绑定 displaySession（最近一次有意义事件所在会话）——用户在会话 B 时，会话 A 的碎碎念会接管可见气泡。两处错位：内容类别错位与会话归属错位。

## Decision

碎碎念引擎改为情境驱动与结果驱动，碎碎念按会话归属。

- 分类通道（chatter.ts WhisperCategory，十个键）：投影把"正在干什么"喂进来——流式 chunk 类型对应思考 / 写回复，tool/call 的运行工具族（读/找→reading，写/改→editing，shell→running，搜索/记忆→searching，git，派活/清单→delegating，浏览器等）对应各自类别。绝不引用真实内容：无工具名、路径、模型原文。分类冷却保持 9 秒。
- 结果通道（WhisperResult: pass / fail / done）：测试全绿只由"通过且判定为测试工具"的 tool/result 触发（投影在 tool/call 时按名称与 command/code 参数标记测试调用；tool/result 的 message.source 只有 callId），报错由失败的 tool/result 或出错的回合触发，完成由 completed 回合触发。结果通道决不读模型文本。结果冷却 5 秒（与共享的 last-whisper 时钟相比），真实时刻除非刚说过话否则总能被听见。
- 环境音量池与关键词规则删除；全部池子 round-robin 确定性轮转，语音包按键可覆盖。
- 气泡归属（service.ts PetSessionView.whisper，pet M6）：每个会话的碎碎念挂在自己的气泡上，同样 8 秒 TTL；全局 snapshot.whisper 字段移除。气泡栈优先展示 GUI 当前会话（浏览器半区通过现有 /api/pet/state 轮询附带 ?current= 查询上报 ctx.sessions.list.getSnapshot().current，会话切换时立即重轮询），当前会话未上报或没有气泡时回退最近活动会话。精灵动画仍跟随最近有意义事件。
- 语音包契约：whispers.generic / whispers.rules 替换为按键覆盖的 whispers.categories（十个 WhisperCategory 键）与 whispers.results（pass / fail / done）；显式空数组静音该类或结果。旧字段被忽略并告警（"no longer supported"）。schema 孪生文件 contracts/voice-pack-v1.schema.json 同步更新并在测试中漂移锁定。

## Alternatives considered

- 保留关键词心境但重写语料（讨论中的方案 A）：否决——目标是内容类别对齐；文本子串匹配无法知道会话在干什么，讨论里只提到关键词也会继续误触发。
- 在碎碎念中引用真实内容（方案 C，如路径、工具名、用户原话）与 LLM 生成碎碎念通道（方案 D）：讨论中被用户否决——宠物气泡不需要真实内容，LLM 通道会破坏插件确定性、离线、零成本的设计。
- 纯客户端重排气泡栈（方案 1b）：否决——碎碎念仍绑定 displaySession，会继续劫持用户正在看的气泡；宿主作为排序与归属的唯一事实源，行为才可单测。
- 保留全局 whisper 字段做兼容：否决——浏览器与宿主半区同包发布，陈旧字段会继续保留错位。

## Consequences

碎碎念从此与用户所见基本对得上，且永不点名真实对象；结果心境不可能再对模型文本误触发。voice.json 契约变更：使用 whispers.generic / whispers.rules 的包仍能加载（告警并忽略），但字段不再生效——文档、README 配对与 schema 孪生已在同一次变更中更新。气泡栈顺序在 GUI 当前会话与最近活动会话不一致时改变；精灵动画规则不变。行为由 chatter 测试（分类轮转、结果冷却、静音）、service 测试（当前会话优先排序、按会话归属碎碎念、全绿/报错/完成心境）、voice-pack 测试（新归一化、旧字段告警、schema 漂移锁定）与 PetSprite 测试（按气泡渲染碎碎念）覆盖。真实 GUI 验证待用户重载 bundle 后执行。

