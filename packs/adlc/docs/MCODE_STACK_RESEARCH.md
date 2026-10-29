# MCode Stack 对 ADLC 的借鉴分析

研究日期：2026-10-29。上游基线：[MiniMax-AI/mcode-stack `d987793c2945e3455782180989322f6ce37b8363`](https://github.com/MiniMax-AI/mcode-stack/tree/d987793c2945e3455782180989322f6ce37b8363)。本地比较基线：ADLC 0.1.7 / Core 0.4.0。

后续实现及其验证边界见 [Core 0.5.0 / ADLC 0.1.8 适配记录](MCODE_STACK_ADAPTATION.md)。

本文区分三类内容：上游文件实际提供的能力、当前 ADLC 已有的能力、建议新增的本地设计。未安装或运行上游脚本，未使用真实模型做对照实验，未扫描个人会话或记忆。

## 1. 仓库实际提供什么

MCode Stack 提供个人/团队工作流、技能和 checklist。固定版本包含 Ronny 的 15 个工程技能、Jiachen 的 2 个技能，以及模板。两个插件清单的 `apps` 和 `mcpServers` 均为空；README 明确说明这里不含 MiniMax Code 源码。它适合补充 agent 的执行方法和运行质量管理，不能据此认定提供了新的 graph 调度、权限系统或生产监控平台。[README](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/README.md)、[Ronny 清单](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/.minimax-plugin/plugin.json)、[Jiachen 清单](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/jiachen/.minimax-plugin/plugin.json)

| 内容 | 已核实实现 | 不能从源码推出的结论 |
| --- | --- | --- |
| independent-review / harness-experiment / trajectory-review 等 | Markdown 步骤、输入边界、结果模板 | 宿主已强制隔离上下文；评测已自动运行；质量已有量化提升 |
| `scripts/check.mjs` | 校验插件/技能清单、frontmatter、marketplace 一致性；配置 CHECK_BASE 时检查版本递增；配置外部目录时调用官方 validator | 工程技能的行为可靠性通过测试；PR 审查结论正确 |
| `lifting-loops/scripts/digest.py` | 多来源会话解析、摘要、按来源和主机保存扫描游标；scan 与 mark 分开 | 自动识别所有根因、自动批准提案、完整实现台账状态机 |
| making-content | 有渲染、音频、素材和 lint 脚本；evals.json 有 4 个自然语言场景及预期行为 | 通用 ADLC 行为评测 runner；这些预期已有通过率数据 |

以上分别见：[结构校验](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/scripts/check.mjs)、[摘要及游标](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/jiachen/skills/lifting-loops/scripts/digest.py#L618-L685)、[内容 lint](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/jiachen/skills/making-content/scripts/lint.py)、[内容场景](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/jiachen/skills/making-content/evals/evals.json)。

固定 SHA 的 [validate 运行](https://github.com/MiniMax-AI/mcode-stack/actions/runs/40804451308) 查询时为 success。其 [工作流](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/.github/workflows/validate.yml) 执行结构校验及外部插件 validator，没有运行工程技能的真实模型评测。外部 validator checkout 未固定 ref，重新运行时可能改变依赖。仓库公开 releases 接口查询为空；tags 接口被连接器拒绝，未据此判断是否有标签。

## 2. 最值得借鉴的改进

下列优先级是对 ADLC 的建议，不是上游已经实现的本地功能。

### A. 独立评审增加输入隔离

上游要求 reviewer 使用新上下文，只接收 diff、需求、真实测试结果；不传作者聊天、计划、推理和自评。发现项必须有位置、理由和严重度，作者逐项验证后修复，也记录驳回原因。[independent-review](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/independent-review/SKILL.md#L15-L78)

**对 ADLC 的价值：高，优先做。** 现有独立执行身份可保留，再补 `review_context` 契约：候选版本/基准 SHA、原始需求与验收标准、完整 diff 或可读取引用、命令与真实结果。业务约束、已接受架构基线和必要周边代码通过明确引用可检索，避免把“只给三个输入”照搬成禁止了解必要上下文。作者自评放在初次独立评审结束后对照，避免先入为主。

建议由 PE / QA / Security 的独立评审执行消费，Core 校验候选版本、输入包标识和评审执行身份，宿主构建隔离上下文。增加 findings 的 `confirmed / rejected / fixed / open` 处理记录，保留验证方法和理由。接受该协议仍不保证 reviewer 一定找到缺陷，需要下面的行为评测。

### B. 给 ADLC 本身建立行为评测

上游给出明确实验纪律：固定模型、配置、工具和仓库；一次改一个变量；同一任务多次运行；记录逐题通过率、翻转任务、请求数、tokens、cache hit 和时间。评测应独立于被测 agent，不能由它边做任务边决定“通过”。[harness-experiment](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/harness-experiment/SKILL.md#L13-L67)

**对 ADLC 的价值：高，先建小样本。** Core 契约测试验证引擎规则；还需系统比较真实 agent 在改动前后是否遵守需求和正确使用规则。当前已有真实执行收据校验（Core 的 `scripts/real-evidence.mjs`），新增的是固定任务、重复运行和控制变量的对照评测，不能将现状描述为从未验证真实执行。建议固定 6–10 个代表场景：模糊需求澄清、缺陷根因、错误候选证据、独立审查漏项、人工例外、跨会话恢复、生产信号缺失。先为一个待改机制跑 baseline/candidate，每场景多次并公开 run count。没有采集到 token/cache 指标就标 unknown，不估算收益。

建议由 QA 维护任务及独立评分，CTO/PE 提出变更假设，宿主记录模型/参数/工具版本/pack digest/repo SHA。用现有 check runner 执行确定性检查，并增加真实 agent 调用的适配与报告；无需再建第二套生命周期编排。上线判据包括关键规则零回归和逐题结果，不能只看平均分。

### C. 技能发现、上下文预算与可恢复交接

上游把上下文分为可丢弃、当次摘要、持久记录；要求 memory 区分 session/project/user。context-tax 审计每类请求内容的大小、变化频率、必要性、位置和恢复路径；tool-budget 同时关注定义、结果和错误工具选择。[long-session-check](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/long-session-check/SKILL.md)、[context-tax-audit](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/context-tax-audit/SKILL.md)、[tool-budget-audit](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/tool-budget-audit/SKILL.md)

**对 ADLC 的价值：高，但先测量。** 已持久化的 run/attempt/decision 可作为事实来源。可新增按节点生成的工作摘要：目标、有效约束、最新候选、决定及理由、已排除方案、已验证结果、未完成动作和可读取引用。必须显示删减/截断和按需恢复入口。不能将截断的契约内容当作完整规范，也不应把所有历史输出写成长期规则。

一个可直接改进的入口是技能目录：当前插件为技能统一生成 `ADLC Pack <version> method: <id>` 描述，pack 主要储存 id/source/content/digest。上游的 engineering-small-prs、engineering-emergency-changes 等描述包含适用条件和排除条件。建议增补结构化 `description / triggers / nonTriggers / inputs / outputs` 元数据，并让具体节点按需要发现、加载技能；先验证触发准确率和遗漏率，再决定是否扩大使用。此处是本地实现建议，不表示上游拥有结构化触发引擎。[小 PR 技能](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/engineering-small-prs/SKILL.md)、[紧急变更技能](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/engineering-emergency-changes/SKILL.md)

先采样实际 dispatch 与宿主最终模型请求，区分注册的技能、被加载的技能、实际注入内容。字符上限不等于 token 预算；优化 prompt-cache 必须按实际 provider 机制和真实测量决定，不能直接采用文档中所有缓存绝对化描述。任务摘要的真实性可由 run/attempt/evidence 校验；最终提示装配及 cache 统计归宿主负责。

### D. 用轨迹和人工介入记录推动改进

trajectory-review 要求读取真实日志，标记未验证假设、无效重试、忽略信号、上下文浪费、约束漂移，定位最早失误或最脆弱步骤，再用实验验证修复。它明确反对把偶发细节直接升级成全局规则。[trajectory-review](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/trajectory-review/SKILL.md#L13-L66)

lifting-loops 将人工介入分为 Retry、Judge、Approve、Carry、Trigger、Stand in；以证据和 outcome signal 判断是否改进，避免把用户放弃误算为成功。台账具有 observed、candidate、proposed、graduated、reopened、retired 状态；优先删除失效规则、修改已有机制、增加机械检查，最后才新建 skill 或全局规则。[lifting-loops](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/jiachen/skills/lifting-loops/SKILL.md)、[台账与状态](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/jiachen/skills/lifting-loops/references/ledger.md#L37-L84)

**对 ADLC 的价值：中高。** 建议 PO/QA 复盘已结束的 graph，PE 分类技术原因，CTO/CPO 根据变更范围决定是否采纳。用现有 append-only 事件先做只读报告，再产出带证据、目标机制、成功指标的改进提案。指标以每个完成任务的非预期人工介入率配合任务成功率、缺陷率和返工率；有意设置的人工 release 授权不算待消灭的成本。

不直接移植上游扫描用户 HOME、会话、Obsidian 或记忆的默认范围。先限定当前项目已授权的 run/evidence；新增数据来源、保留期和可见范围由宿主明确管理。台账阈值（例如三次证据、八周退役）作为可调起点，不能未经校准变成 Core 通用规则。

### E. 小 PR、紧急变更、长命令生命周期

- **小 PR：** 上游强调一项完整行为、每步可工作、重构与行为分离、迁移 expand/contract。可补入 implementation plan 的 `change_sequence`，由 PE 决定依赖、每片验收和回滚，LE 执行。ADLC 的 backend/frontend/fullstack/parallel 是实现形状，与可独立交付的纵向切片是不同维度。[engineering-small-prs](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/engineering-small-prs/SKILL.md)
- **紧急变更：** 上游要求判定真实紧急条件、最小修复、记录跳过检查与原因、快速验证、后续正常审查。适合由 CTO/Security/QA 在当前 release-process 中提供受控流程分支，保留用户授权和事后任务。由于 pipeline 未定，本轮建议仍止于流程，不扩为发布认证或自动放行。[engineering-emergency-changes](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/engineering-emergency-changes/SKILL.md)
- **长命令：** 现有 bounded check runner 可继续使用。上游 checklist 可指导宿主补强同一进程前后台转移、固定 deadline、完成事件、输出引用、取消/重启清理、压缩后未读结果恢复。它只提供检查方法，没有这些运行时实现。[long-command-check](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/long-command-check/SKILL.md)

## 3. Agent 与职责：哪些该合并，哪些该保留

上游建议在有实测上下文退化、可并行且仅需结论的工作、工具/指令冲突时才分派子 agent，避免按部门名称机械拆分。紧密共享中间数据的 agent 可先通过实验逐一合并。[subagent-split-check](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/skills/subagent-split-check/SKILL.md)

在 ADLC 中，**决策角色、独立执行、模型会话是三个不同概念**。角色承载权限和责任；一个 agent 可绑定多角色，独立评审仍需不同执行身份。因此借鉴点是减少不必要的会话/交接，不能据“默认单循环”删除 CPO/CTO、人工 owner 或职责分离。该建议是本地适配判断；现有绑定要求见 [pack runtimeRequirements](../index.mjs)。

| 机制 | 建议主要责任 |
| --- | --- |
| 受控独立评审输入 | PE、QA、Security；宿主隔离，Core 检查身份/版本 |
| 行为评测与 trajectory review | QA 维护评分；PE 提案；CTO 决策；宿主采集 |
| 上下文/工具预算、长命令生命周期 | PE / 平台宿主；LE 使用 |
| 人工介入台账、改进提案 | PO 归纳、QA 度量、PE 分析、CTO/CPO 决策 |
| 小 PR / 迁移顺序 | PE 计划、LE 实现、QA 验证 |
| 紧急变更流程 | CTO、Security、QA；保留 authenticated human release authority |

## 4. 已有重叠与建议顺序

ADLC 0.1.7 已有独立执行约束、版本化证据、验收矩阵、架构基线、PR 交付契约、有限重试和 host check runner。Core 已保留 run/attempt/decision、人工恢复和幂等语义。上游可以补充执行质量与改进方法，不能据本次比较宣称上述能力缺失。现有映射见 [Factory / Blueprint 适配](FACTORY_BLUEPRINT_ADAPTATION.md)、[证据契约](EVIDENCE_CONTRACTS.md)。

### 本地源码核对

本地固定基线为 Core `cdb3088f02247bbd3dd5352dca9923ff82b4b2db`、ADLC `9c219f7aba9bbcf418544b7e186f929173874360`。以下行号对应这两个版本。

| 观察 | 本地证据 | 适配含义 |
| --- | --- | --- |
| 技能描述统一为名称和 pack 版本 | Core `src/plugin/manifest.mjs:10–14`；ADLC `index.mjs:30–33` | 增加语义明确的触发/排除条件；`desiredSkills` 配置本身不证明每次请求都注入所有技能全文 |
| 节点 issue 描述拼接角色的五份文档；有契约的节点还附证据契约全文 | Core `src/plugin/dispatch.mjs:67–74,175–181` | 可先盘点重复和无关内容，再以实验决定精简；不能据此推断宿主每次模型请求的真实内容 |
| 上游已完成节点的 output/artifacts/evidence 会进入下游上下文；主管阶段另含作者 selfReviews | Core `src/plugin/dispatch.mjs:87–117` | 目前有独立身份约束，但没有专门的初次评审输入隔离；自评继续留档，初次独立审查不预先展示 |
| 上下文限制是字符串 4,000 字符、数组/对象 40 项、对象深度 6 层 | Core `src/plugin/dispatch.mjs:77–84` | 不是模型 token 预算或按相关性选取；需标注删减并提供恢复入口 |
| check runner 已有 setup、有限重试、超时、输出上限、日志与反馈 | Core `src/host/check-runner.mjs` | 扩展宿主任务生命周期；不重建现有 runner 或把它描述成没有超时/恢复基础 |

本地读取 pack 后，以 JavaScript `string.length` 统计五份角色文档正文：CTO 16,818、CPO 12,274、PE 8,878；证据契约正文另有 5,950。单位为 UTF-16 code units，不是 tokens；未包含标题、任务输入和历史产物。这些数值支持先做请求内容盘点，不能证明上下文过长、缓存失效或任何百分比的节省。

### 实施建议顺序

1. **第一批：** 小型行为评测与实际 dispatch/request 上下文盘点；clean review input；技能触发元数据。先基线，随后分别修改并比较。
2. **第二批：** 持久交接摘要；宿主长命令事件/取消/恢复；按上下文和接口边界评估委派。
3. **第三批：** 轨迹复盘与人工介入报告；仅把有证据支持的改进升级成规则或自动触发。
4. **低成本配套：** 小 PR / 迁移计划；紧急变更流程模板；差异驱动的版本递增与生成文档一致性检查。当前已存在 pack/role/skill 校验和不可变版本约束，新增的是发布前检查覆盖。上游的 CHECK_BASE 方案可作参考，但只检查 PR 变更，不能代表完整发布认证。
5. **暂不纳入主线：** making-content 发布/视频工具；私人全盘会话扫描；新建一套替代 ADLC 的 orchestrator。

以上为建议，本文没有修改 graph、role、skill 或运行时。不会根据一次文档审查承诺降本、提速或缺陷率改善。

## 5. 来源、许可与研究限制

- 直接读取固定 SHA 的 README、完整目录树、两套清单、Ronny 的核心技能、Jiachen 的 lifting-loops/台账/摘要脚本、making-content 场景和 lint、CI 和结构校验；未安装上游插件或执行它的脚本。未对每个素材/视频脚本做安全或功能审计。
- README 的“团队日常使用”等表述属于作者陈述。仓库没有为上述工程技能提供可据以复现的量化收益报告。本次结论是设计适配判断，等待本地实验。
- 工程 skills 是提示性步骤，真实强制必须落到宿主/Core 的输入校验、权限、事件和测试。不要以 skill 文本中的“必须”替代运行时保证。
- Ronny 的 `engineering-*` 含 Google Engineering Practices 改编，适用 CC-BY 3.0，作者新增部分为 MIT；直接复用时保留来源、许可证和修改说明。[NOTICE](https://github.com/MiniMax-AI/mcode-stack/blob/d987793c2945e3455782180989322f6ce37b8363/stacks/ronny/NOTICE.md)。本报告以自述分析为主，未整体复制技能。
