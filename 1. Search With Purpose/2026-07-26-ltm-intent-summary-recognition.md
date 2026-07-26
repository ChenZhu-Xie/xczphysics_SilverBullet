# LTM 意图恢复与长时高分辨率总结：Recognition 与参考架构

日期：2026-07-26  
状态：研究结论与后续 skill 改造输入；不是已经实现的规范

## 1. 本文要解决的问题

直播说明稿的输入不是一篇结构良好的文章，而是一条长时间、高采样率、多模态、部分失真的个人活动流。系统需要同时做到：

1. 从数千个原子事件中找出一天或一场直播实际只有少数几条的工作主线。
2. 保留每条主线内部足够细的决定、实现、验证、失败和结果。
3. 区分“看到了/调查了某项目”和“实际修改、验证或发布了该项目”。
4. 不把相关事件拆散，也不把同时出现但无关的事件强行拼接。
5. 让任何高层结论都能回到原始证据，而不是经过多轮自然语言摘要后失去来源和不确定性。
6. 在 reviewer 拒绝局部事实时做局部修复，而不是让整条流水线从早期阶段重新生成。

这个问题更像“宽画幅 + 高时空分辨率”的成像问题，而不只是材料领域的高通量问题。它有两个必须同时维持的轴：

- **覆盖范围**：数小时、一天或更长。
- **分辨率**：分钟级 episode，乃至关键原子事件。

正确的工程对应物不是一张无限大的高分辨率图，也不是把全部像素交给一个模型，而是一个保留原始数据的**多尺度金字塔**：raw event → episode → workstream/thread → livestream/day → public summary。每一层都是索引和视图，不应成为不可逆地替代下层证据的唯一真相。

## 2. 已关闭的数据库事故

`truth_time.sqlite3` 的数据库和源代码修复已经完成。2026-07-26 复核结果：

- 当前数据库 `PRAGMA quick_check` 返回 `ok`。
- `899c82a fix: fail closed on database corruption` 增加了 SQLite 输出路径保护、只读报告连接和损坏时停止 collector 写入。
- `5041230 fix: make summary output writes atomic` 在 `batch-init` 产生文件系统副作用前执行完整性预检，并把 summary 输出改成同目录临时文件、同步和原子替换。

此前取证得到的历史结论仍值得保留，供后续安全设计参考：

- 损坏不是高频读取造成的。多个 SQLite B-tree 页面被 collection-ledger JSON/UUID 文本覆盖，且存在大量同偏移逐字节匹配。
- 本轮生成在新 acquisition 产生前已经检测到 malformed database，因此读取只是暴露了损坏。
- Pieces LTM 大数据库当时仍健康；YASB 曲线消失是因为 widget 无法从 truth-time 小数据库取得可信直播/会话区间，而不是密度数据丢失。
- Pieces 数据库和 event-logger 数据库职责、schema 不同，不能互相替换。

本文后续不再把数据库损坏视作当前 blocker，但保留一条长期原则：**任何生成型输出都不得拥有覆盖 canonical evidence store 的路径能力；读取健康检查必须先于派生输出。**

## 3. 现行 skill 的已确认问题

详细 A/B 结果见 [2026-07-23/24 新旧体系对比](production/2026-07-23-24-current-system-comparison.md)。现行工作流见 [produce-youtube-stream-summary](../../skills/produce-youtube-stream-summary/SKILL.md)。

当前体系不是全面变差：

- 最终事实安全性和 evidence coverage 提升。
- 双 reviewer、raw claim packet 和 release recomputation 确实拦截了计划/完成状态错写、evidence 错绑和过强 Portal。

但首次生成、层级质量和成本退化。观测到的关键数据包括：

- 两天分别处理 3,346 和 3,995 个 raw events。
- 初始 curation 被切成 37 个固定大小 chunk。
- 一次完整执行启动了 90 个子 agent，并有 24 次 follow-up；其中 54 次是 curation worker 或其重试。
- 初版 reviewer context 膨胀到 1,214,449 和 929,515 bytes，最终仍分别达到 178,556 和 190,215 bytes，逼近 196,608-byte 上限。
- 7 月 24 日最终有 50 条 evidence、27 条 claim 和 23 个平铺 root，说明 coverage 增加并没有自动产生好的主题层级或原子 claim。

根因不是简单的“agent 能力不够”，而是：

> 单个 agent 的上下文负担下降了，但总语义熵没有下降；系统增加了有损压缩边界、冷启动、错误继承和缓存失效面。

固定 200-event 时间块优化的是输入字节，不是语义 episode。一个 workstream 可跨越多个块；一个块也可包含多个并行 workstream。chunk worker 产生一次错误状态判断后，reducer 只能看到其自然语言摘要，没有 raw evidence 足以推翻它。错误随后被 outline 和 claim ledger 结构化，直到最终 reviewer 重新接触原文才暴露。

reviewer 发现 curation 的 `summary`、`activity_kind` 或状态错误时，返回 curation 在语义上通常是正确的；只改 outline 会掩盖坏 evidence。真正的问题是当前系统没有稳定 evidence ID 上的定点 curation patch，也没有逐 claim 的 review cache，因此一个局部改变会触发大范围重建和全部 review 失效。

## 4. 本机 Pieces OS 调查

### 4.1 可见的数据与模型层

本机 Pieces OS 安装显示它不是单一 raw-event 数据库，而是多层系统：

- `workstreamEvents`
- `workstreamSummaries`
- `workstreamPatternEngineSources`
- `signals`
- `tags`
- `conversationMemories`
- annotations 和 temporal hierarchical summaries

这些 `vector_db/*.sqlite` 本身主要是向量索引元数据：`uuid`、`idx`、固定 512 维、CRC、创建/访问时间等。它们不是一张可直接 SQL 读取完整叙事文本的友好事实表；真正的事件、annotation 和关联对象通过 Pieces 对象层/API/MCP 水化。

当前本机日志暴露了以下运行时行为：

- `google/gemini-3.1-flash-lite` 经 OpenRouter 被用于高频事件内容抽取，返回的结构包括 persons、file paths、URLs、topical/thematic tags 和 description。
- `x-ai/grok-4.3` 经 OpenRouter 对跨事件 `signal` 执行 `ADD`、`UPDATE`、`ASSOCIATE` 等操作。其输入可达到数万字符，说明它处理的是累积的候选工作信号，而非单帧 OCR。
- 安装包还含有 TIME span/classifier、MiniLM、event/query tagger、代码/文本分类、Tagify 和多种 embedding ONNX 模型。这支持“专用小模型/向量模型先过滤与标注，再调用较大 LLM”的判断。
- 本机音频链路为本地 `Moonshine TinyQ` transcription，并用 PyAnnote 做 diarization/fingerprint。日志中能看到静音、无 speaker segment 和延迟确认 owner 的分支。
- vision 链路会过滤 duplicate OCR，并给事件保留 `readable` 状态；本次 raw recall 仍展示了大量字符识别错误和路径变形。

这些模型是**当前机器、当前配置和当前版本的运行时观测**，不能被写成 Pieces 的固定产品契约。尤其不能据此声称所有 workstream summary 都必然由 Grok 或 Gemini 生成。

### 4.2 Pieces 的真实组织方式

在约 50 分钟的当前活动窗口中，Pieces memory 查询返回 99 个 events，却尚无 workstream summary。大量 vision events 是同一终端/编辑器画面的重复采样，并包含 OCR 路径错字。与此同时，native agentic engine 已在持续更新几个 `signal`。

这说明 Pieces 的关键中间层不是“每 30 分钟直接把 raw events 总结一次”，而是：

1. 捕获、清洗和去重 micro-events。
2. 抽取人、文件、URL、主题、描述等结构。
3. 维护可增量 ADD/UPDATE/ASSOCIATE 的 signal/workstream 假设。
4. 再形成阶段 summary 和日/周/月等 temporal roll-up。
5. 查询时从 events、summaries、annotations、signals 和 profile 中做检索与组合。

Pieces 官方资料也描述了 Workstream Pattern Engine 对 micro-events 的过滤、关联和周期 roll-up，并称工作流摘要通常按 30 分钟产生。参考：

- [Pieces：Workstream Pattern Engine 与 on-device classifiers](https://pieces.app/about)
- [Pieces：每 30 分钟的 Workstream Activity roll-up](https://pieces.app/blog/code-documentation)
- [Pieces：memory contamination 的 entry / roll-up / query-time 三层处理](https://pieces.app/blog/interview-about-ltm)

### 4.3 Pieces prompt 的可见边界

Pieces 是闭源编译应用。本机可见：

- 模型/Provider
- prompt 长度
- 部分 response preview
- 输出 JSON schema 和 signal operations
- API/MCP 数据模型

本机没有发现可审计的完整 prompt/skill 原文。不能把从 response schema 反推出的行为当作拿到了官方 prompt。可借鉴的是其**分层数据模型、增量 signal 图和 temporal roll-up**，不是复制一个并不存在于本地明文中的 prompt。

## 5. screenpipe 调查

调查固定在 screenpipe commit [`afcee637`](https://github.com/screenpipe/screenpipe/tree/afcee637bb263ada9ac34911052f693553c4333a)。当前仓库许可证是 source-available，而不是旧资料中常写的 MIT；代码和内置 pipe prompt 仍可检查。

### 5.1 内置 prompt 没有想象中复杂

[Day Recap pipe](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-core/assets/pipes/day-recap/pipe.md) 的核心要求是：

- 读取 pipe-local `memory.md`，积累少量可复用 lesson。
- 查询最近 16 小时。
- 每次 limit 10，最多 5 次 search。
- 优先用 raw SQL 做 app usage。
- 按 Summary / Accomplishments / Key Moments / Unfinished Work / Patterns 输出。
- 只报告可验证内容。

[Standup](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-core/assets/pipes/standup-update/pipe.md) 和 [Time Breakdown](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-core/assets/pipes/time-breakdown/pipe.md) 同样简短。Meeting Summary 更成熟，因为它有明确的 `meeting_ended` trigger、canonical meeting interval、audio/OCR 双模态查询、speaker correction 和写回规则，但它处理的是天然具有边界的单次会议。

因此，screenpipe 并没有公开一个已经解决“全天多主线细粒度意图恢复”的神奇 prompt。它的优势主要在 prompt 前面的数据平面。

### 5.2 真正值得借鉴的是 bounded activity API

[activity-summary 实现](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-engine/src/routes/activity_summary.rs) 做了大量确定性压缩：

- accessibility tree 优先，OCR fallback。
- event-driven capture，而不是固定频率保存大量相同帧。
- 相邻 frame 间隔小于 300 秒才计为 active time。
- app/window 时间用 SQL 计算。
- key text 在整个时间范围内分桶均衡抽样，避免最新一小时吞掉一周上下文。
- screen/audio snippets 去重、截断，总数默认 8、最多 12。
- memories 默认最多 5。
- 返回 `data_status`、`query_status` 和下一步 query guidance，让 agent 区分“真的没活动”和“查询没命中”。
- 只有需要逐字引用或 frame ID 时才升级到 raw `/search`。

这正是当前 event-logger skill 缺少的一层：**先用确定性程序把输入变成 bounded, balanced, typed context，再让 LLM 做语义判断。**

### 5.3 screenpipe database 的可查询性

screenpipe 当前 schema 把以下对象显式存入 SQLite：

- frames：时间、app、window、browser URL、focused、full text、document path。
- elements：accessibility/OCR 来源、role、层级、bounds、OCR confidence。
- audio transcripts/chunks：时间、speaker、device、transcription。
- UI events：click/key/scroll/app switch、元素角色/名称/路径、frame correlation。
- meetings：canonical start/end、app、attendees、note。
- memories：内容、来源、source context、tags、importance、FTS。
- outputs：pipe/agent 产物及其元数据。

文本搜索已收敛为 `frames.full_text + FTS5`，element tree 保留细粒度结构。相关 schema：

- [elements table](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-db/src/migrations/20260301000000_create_elements_table.sql)
- [frames.full_text consolidation](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-db/src/migrations/20260312000000_consolidate_search_to_frames_full_text.sql)
- [persistent memories](https://github.com/screenpipe/screenpipe/blob/afcee637bb263ada9ac34911052f693553c4333a/crates/screenpipe-db/src/migrations/20260310000000_create_memories.sql)

## 6. Pieces 与 screenpipe：哪个 database 对 LLM 更友好

| 维度 | Pieces OS | screenpipe |
|---|---|---|
| 直接 SQLite 可读性 | 较差；可见 vector DB 多为索引元数据，完整对象需 API/MCP 水化 | 较好；frames/elements/audio/UI events/meetings/memories 均有公开 schema |
| 原始文本质量 | 以视觉 OCR/readable 为主，本机观测有明显重复和字符错误 | accessibility-first，OCR fallback，并能保留 element role/bounds/confidence |
| 高层语义 | 强；已有 summaries、annotations、signals、tags、profile 和 temporal roll-ups | 中等；有 memories/tags/meetings/activity-summary，但日总结仍主要由 pipe agent 临时合成 |
| 审计透明度 | 低到中；对象可取回，但 signal/summary prompt 与内部决策闭源 | 高；查询、schema、抽样和 pipe prompt 可审计 |
| 查询时 token 控制 | MCP 已区分 DESCRIPTION、SUMMARY 和 temporal roll-up，但 hydration 仍可能很大 | activity-summary 明确 bounded、balanced、deduped，可关闭重字段 |
| 意图恢复 | 有 signal graph 的产品实现，但仍会误关联 | 没有完整任务图；主要依赖 agent 从 bounded evidence 综合 |

结论：

- **如果直接面向数据库和自定义 deterministic tooling，screenpipe 更友好。**
- **如果通过产品 API/MCP 获取预计算高层语义，Pieces 更省第一轮总结工作。**
- Pieces 的高层语义不能替代 raw evidence，因为其 OCR、event description 和 signal association 本身也是推断。
- screenpipe 的公开、结构化原始表也不能自动解决意图；它只是给了更好的观测和查询面。

最好的参考方案不是二选一，而是：

> screenpipe 式可审计 raw/event schema 与 bounded activity API  
> + Pieces 式增量 signal/workstream 图与多时间尺度 roll-up  
> + event-logger 的 canonical truth boundaries、claim provenance 和 release checks。

## 7. 为什么“人很容易总结，LLM 却被细节淹没”

人不是从键鼠日志重新推断自己的一天。本人拥有系统没有的隐变量：

- 当前目标和优先级。
- 对项目所有权、角色和背景的长期记忆。
- “我只是在参考它”与“我要修改它”的主观区分。
- 哪一步是尝试、哪一步是结果、哪一个失败改变了计划。
- 被打断后仍保持的 task set。

LLM 看到的只是 noisy observations。即使日志完全忠实，意图也不由观测唯一决定。同一串操作“打开外部仓库 → 搜索代码 → 运行测试”既可能是研究、依赖评估、复现 bug，也可能是准备贡献代码。

科学上，这属于：

- **部分可观测的 goal/plan recognition**
- **latent-state sequence segmentation**
- **multi-object event correlation / process mining**
- **active inference with clarification**

仅靠被动观测不存在保证正确的唯一解。成熟方法不会强迫系统过早选一个故事，而会：

1. 保存多个候选假设及概率/置信度。
2. 利用后续动作更新早期判断。
3. 在高影响、低置信度处分配一次低成本的人类校正。
4. 把用户校正存成稳定 prior，而不是只修当前文案。

关于 noisy/partial observations 下用对话修正 goal belief，可参考 [Dialogue for Goal Recognition](https://arxiv.org/abs/2310.02462)。

## 8. 需要关联图，但不是“只建一个知识图谱”

### 8.1 推荐的数据模型

设原始观测为 \(x_i\)，其隐藏 episode/workstream 为 \(z_i\)，事件角色为 \(r_i\)，workstream 的目标/状态为 \(g_k\)。系统需要估计：

\[
P(z_i, r_i, g_k \mid x_{1:i}, G_{i-1}, M_{user})
\]

其中：

- \(G\) 是随时间增量更新的 event-object-thread graph。
- \(M_{user}\) 是用户明确确认的项目、角色、习惯和否定规则。
- 输出应是 calibrated belief，不是立即变成确定事实的自然语言。

图至少需要以下节点：

- Event：不可变原始事件或规范化 action。
- Artifact/Object：repo、file、URL、issue、command cwd、conversation、person、application。
- Episode：局部连续活动段。
- Thread/Workstream：可跨中断恢复的主线。
- Goal/Hypothesis：调查、实现、验证、发布等候选意图。
- Claim：最终可发布的原子陈述。

边必须是有类型、方向、时间和来源的：

- `observed_in`
- `acts_on`
- `reads_from`
- `modifies`
- `produces`
- `verifies`
- `depends_on`
- `continues`
- `interrupts/resumes`
- `supports/contradicts`
- `candidate_member_of`

每条推断边应保存：

- source event IDs
- confidence
- feature contributions
- valid time / superseded time
- model/rule version
- accepted/rejected/uncertain

[Graphiti](https://github.com/getzep/graphiti) 可参考其 episode provenance、temporal validity 和 incremental graph construction；但通用实体关系图不能替代 task/goal model。我们的 ontology 必须显式包含 action state 和 evidence role。

### 8.2 不应只按图的 connected component 聚类

“同一用户”“同一终端”“同一编辑器”这类高连接对象会把整天连成一个 giant component。Object-Centric Process Mining 已指出，把多对象事件强压成单一 case 会产生 divergence、convergence 和 deficiency。

[OCEL 2.0](https://www.ocel-standard.org/) 的启发是：事件可以同时关联 repo、文件、issue、person、app 等多个对象，并给关系加 qualifier；不要一开始就给每个事件强制唯一 project/case ID。图上的 episode/workstream 是后续可修订的投影。

[PM4Py](https://github.com/process-intelligence-solutions/pm4py) 可用于 object-centric event log、过程发现和 conformance 分析，但它更适合在我们的事件规范化和 object linking 之后使用。

## 9. 区分“浏览/调查”和“实际开发”

不应让单个页面标题或 LLM topic 决定 activity kind。应先产生动作状态序列：

1. `observe`：只看到页面、窗口或输出。
2. `investigate`：搜索、导航、对比、读取多个来源。
3. `plan/decide`：形成明确方案或选择。
4. `modify`：文件、配置、数据库、远端对象发生写入。
5. `execute`：运行 build/test/script/tool。
6. `verify`：结果被检查，并与预期比较。
7. `publish`：commit/push/release/deploy 或外部写入成功。

判断“正在开发某项目”的强证据包括：

- 工作目录或编辑文件属于该 repo。
- 可观察到写入/diff。
- build/test 的 cwd 和 target 指向该 repo。
- commit/push/release 的对象与状态可验证。
- 多个动作组成 modify → execute → verify 的因果链。

浏览 GitHub、阅读 README、搜索 issue 和查看别人的代码，最多支持 `observe/investigate`，除非后续动作把这些来源连接到本地 artifact 或明确决策。外部项目可以是 `reference_object`，不应自动成为 `owned_workstream`。

## 10. 推荐的多尺度 pipeline

### S0 — Truth boundary

继续由 event-logger/OBS/YouTube 确定直播边界。LTM 不决定 canonical interval。

### S1 — Deterministic normalization

- 合并近重复截图/OCR。
- 保留 raw text、normalized text、modality、confidence、source ID。
- 优先 accessibility/structured tool result；OCR/audio 作为带置信度的观测。
- 把命令、cwd、文件写入、git、测试和发布结果解析成 typed actions。
- 对没有状态证据的文本禁止升级为完成事实。

screenpipe 的 event-driven capture、balanced sampling、idle-gap 和 bounded snippets 可直接作为设计参考；ActivityWatch 的 heartbeat merge 与 canonical events 也值得参考：[ActivityWatch data model](https://docs.activitywatch.net/en/latest/buckets-and-events.html)。

### S2 — Event-object graph

把每个 normalized event 与 repo/file/URL/person/conversation/tool/result 建立硬边或软边。硬边来自路径、ID、cwd、git hash 和工具返回；LLM 只补软语义边。

### S3 — Online segmentation

先用时间 gap、app/window/cwd 变化、entity set 变化、文本 embedding 变化和 action-state transition 找候选边界。可以用 Bayesian Online Change Point Detection 或 PELT 作为 baseline：

- [Bayesian Online Changepoint Detection](https://arxiv.org/abs/0710.3742)
- [ruptures](https://github.com/deepcharles/ruptures)

边界只是候选，不能因短暂切到浏览器就结束 thread。需要允许 interruption/resume。

### S4 — Episode role/state inference

对每个小 episode 输出机器可校验对象，而不是散文：

```json
{
  "episode_id": "ep-...",
  "time_range": ["...", "..."],
  "primary_objects": ["repo:event-logger"],
  "reference_objects": ["repo:screenpipe"],
  "roles": ["investigate", "verify"],
  "state_before": "...",
  "state_after": "...",
  "claims": [
    {
      "proposition": "...",
      "status": "observed|planned|implemented|verified|published",
      "source_ids": ["..."],
      "confidence": 0.86
    }
  ],
  "candidate_threads": [
    {"thread_id": "thread-...", "probability": 0.78}
  ]
}
```

一个 episode 可以暂时属于多个候选 thread，直到后续证据消歧。

### S5 — Incremental thread/signal maintenance

借鉴 Pieces 的 `ADD/UPDATE/ASSOCIATE`：

- 新建 thread。
- 将 episode 关联到现有 thread。
- 更新 thread 的 current state、open questions、artifacts 和 next action。
- 合并或拆分 thread，但保留历史 operation ledger。
- 用户拒绝过的 association 进入 rejected-edge ledger；source scope 未变化时不得自动复活。

### S6 — Multi-resolution roll-up

不要让 LLM 重写上一层散文。每层都从结构化 episode/thread cards 和必要 raw anchors 计算：

- 15–30 分钟：episode cards。
- 1–2 小时：thread state transitions。
- 整场直播：主线 + 关键阶段 + 少数跨线 Portal。
- 日/周：从 thread state 和高重要度 claims 聚合。

高层 summary 保存对下层 claim IDs 的引用。需要细节时向下 drill，不把所有细节塞进 reviewer。

### S7 — Outline 与原子 claims

先选主线，再在每条主线内部排序阶段。一个公开 node 可包含多个显示行，但 claim ledger 必须按原子命题拆分，尤其不能把“计划、实现、验证、发布”合在一个 claim。

### S8 — Delta review 与定点修复

review issue 规范化为：

```text
artifact_id + field/path + issue_type + source_ids + dependency_scope
```

修复规则：

| reviewer 发现的问题 | 修复范围 |
|---|---|
| wording/range/hierarchy 错，evidence 正确 | outline patch |
| evidence summary/activity state 错，source IDs 正确 | curation item patch，ID 不变 |
| 缺少 source | 只扩展受影响 episode 的 source scope |
| Portal 错 | patch/remove exact edge |
| 评分分歧 | arbitration，不生成新内容 |

每个 claim 单独做内容哈希；未变化 claim 复用 reviewer verdict。只复审变化 claim 及父子/Portal dependency closure，最后再做一次便宜的 global consistency pass。

## 11. OCR 与 transcription 污染应怎样处理

不能只要求 LLM“自行判断信不信”。可靠做法是让数据层携带证据质量：

- `source_modality`: accessibility / OCR / audio / command / file diff / API result。
- `source_confidence`: OCR confidence、ASR confidence、speaker resolution confidence。
- `corroboration_count`: 不同模态是否独立支持。
- `state_strength`: observation < inferred < explicit action result。
- `raw_preserved`: 是否可回看原帧/音频/命令结果。
- `contradictions`: 同一事实的冲突来源。

推荐的信任优先级不是全局固定，而是按 claim 类型：

- 屏幕文字：accessibility > OCR。
- 命令是否成功：process exit/result > 屏幕 OCR。
- 文件是否修改：filesystem/git diff > LLM description。
- 发布是否完成：remote/API/git result > 对话中说“准备发布”。
- 人名/发言：明确 name tag + 同时段 speaker evidence > 单独声纹或 OCR。

低质量来源可以用于发现候选主题，但不能单独把状态升级到 implemented/verified/published。

## 12. 建议的首轮实验

不要立即重写整个 skill。先在 7 月 23/24 两个已有 production run 上做离线实验：

1. 从 raw events 构建 deterministic normalized actions 和 event-object graph。
2. 比较三种切分：
   - 当前固定 200-event chunk。
   - 纯 change-point episode。
   - change-point + object/thread resume。
3. 让同一模型只完成 episode card，不直接写 summary。
4. 用一个增量 thread reducer 维护 5–10 条候选主线。
5. 从 thread cards 生成 outline，再使用现有 raw-claim reviewer。
6. 做消融：
   - 有/无 Pieces summary annotations。
   - 有/无 signal graph。
   - 有/无用户稳定 memory/project registry。
   - one-shot review 与 delta review。

评价指标应包括：

- state accuracy：planned/implemented/verified/published 是否正确。
- pairwise episode F1：应同组的 event pair 是否同组。
- thread purity / coverage：主线是否混入无关事件、是否漏掉关键阶段。
- hierarchy quality：roots、重复父子、复合 claim、scanability。
- provenance completeness：每个 claim 是否可回 raw。
- calibration：0.8 confidence 的判断是否约 80% 正确。
- reviewer packet bytes 和总 token。
- repair locality：一个错误平均使多少 artifact/review 失效。
- convergence：一次 consolidated repair 后是否通过。

## 13. 可参考的开源/可审计项目

| 项目/方法 | 借鉴点 | 不应直接照搬 |
|---|---|---|
| [screenpipe](https://github.com/screenpipe/screenpipe) | accessibility-first、event-driven capture、bounded activity-summary、公开 schema/pipes | 简短 Day Recap prompt 没有解决多主线意图恢复 |
| [ActivityWatch](https://github.com/ActivityWatch/activitywatch) | heartbeat merge、AFK intersect、canonical events、server-side transform | 数据较低层，不含充分语义或因果状态 |
| [OCEL 2.0](https://www.ocel-standard.org/) | 多对象 event graph、qualified relations、避免过早单 case | 它是事件数据/过程分析标准，不是个人意图模型 |
| [PM4Py](https://github.com/process-intelligence-solutions/pm4py) | process discovery、object-centric mining、conformance | 需要先有较干净的 activity/object extraction |
| [Graphiti](https://github.com/getzep/graphiti) | temporal edges、episode provenance、incremental graph、hybrid retrieval | 通用 KG 容易把细腻动作压成模糊关系 |
| [ruptures](https://github.com/deepcharles/ruptures) / BOCPD | 候选 episode 边界 | 单独 change point 不会识别中断后恢复的 task |
| [TaskTracer](https://web.engr.oregonstate.edu/~tgd/publications/iui2005-tasktracer.pdf) | task context、资源与任务关联、任务切换 | 早期系统通常依赖更多显式 task 标注 |

## 14. 对 skill 改造的优先顺序

P0：保留现有 canonical boundary、raw provenance、claim review 和 release checks。

P1：在 LLM 前增加 deterministic `activity-summary/episode-candidate` 层，完成去重、均衡采样、action parsing、object linking 和 packet budgeting。

P2：把固定 chunk curation 改成 episode card；显式列出 action/activity enum，并保留 confidence、state 和 primary/reference objects。

P3：实现增量 thread/signal operation ledger，以及 rejected-edge/issue memory。

P4：实现 stable IDs、curation JSON Patch、per-claim hash、delta review 和 dependency-closure rebuild。

P5：加入低摩擦的人类 intent correction：

- “这是参考项目，不是我在开发的项目。”
- “这两段属于同一主线。”
- “这个动作仍是计划，尚未完成。”

这些校正应写入 project/user prior，使未来 pipeline 少做推断，而不是只修当前稿。

最终目标不是让一个更大的模型读完全部 LTM，而是让模型只看到：

1. 少数候选主线及其状态；
2. 每条主线少量、覆盖全程的 episode cards；
3. 对当前 claim 必要的 raw evidence；
4. 明确的未知、冲突和用户 prior。

这样才会接近本人总结一天时使用的信息结构和成本。
