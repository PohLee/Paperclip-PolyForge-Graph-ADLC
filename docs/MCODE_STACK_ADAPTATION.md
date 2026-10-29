# MCode Stack 六项适配：Core 0.5.0 / ADLC 0.1.8

本文件记录从 [MCode Stack 研究](MCODE_STACK_RESEARCH.md)落到当前代码的范围。上游参考版本固定为 `d987793c2945e3455782180989322f6ce37b8363`。Pack 版本变为 `adlc@0.1.8`，Core/插件变为 `0.5.0`，现有 graph 版本与角色权限保持原值。发布继续采用人工授权的流程，pipeline 仍未选择，Graph 不做完整发布认证。

| 改进 | 当前实现 | 宿主接入与验证边界 |
| --- | --- | --- |
| 技能发现与上下文预算 | 21 个技能有简短描述、触发/排除条件、输入输出；插件 manifest 使用语义描述。派发记录各部分字符数和截断标记。 | 宿主应采集最终模型请求、token、cache 指标并验证选技准确率。目录元数据不等于按需注入机制，也不代表已测出节省。 |
| 初次独立评审输入隔离 | 独立任务及 supervisor 派发使用 `reviewPacket`；Graph 的评审 agent 读取和命令响应只返回需求约束、候选、证据与源工件引用；作者自评留在完整 run 供人类事后比对。 | 宿主仍需给评审执行创建真正独立的新会话，按工件引用读取完整 diff 和测试原始结果。Core 保持已有独立执行身份校验。 |
| 行为评测与轨迹复盘 | `compareBehavior` 要求固定模型/工具/仓库/pack、单变量、多次运行、独立评分；输出逐场景翻转与关键回归。`trajectoryReview` 只整理可观察动作。七个起始场景见 Core `eval/golden-scenarios.json`。 | `runCase` 与 `assess` 由宿主提供，评测者应独立于被测 agent。当前没有真实模型对照成绩，缺失 token/cache 指标为 `null`。 |
| 选择性委派 | PE 与 LE 的技能要求先记录共享状态、独立产物、工具冲突及集成检查，再决定是否拆分。 | 这是 agent 层的任务分解规则。11 个角色的权限、组织汇报及独立评审仍由原 Graph/Core 管理；宿主决定实际子执行。 |
| 长任务和恢复交接 | check runner 提供 `startChecks` 后台句柄、取消、原进程完成 Promise、持久 manifest、未读完成标记与确认读取；Graph 读取返回由持久状态推导的 handoff 摘要。 | 宿主在重启后读取 manifest。`running` 状态返回 `requiresHostReconciliation`，必须核实原进程状态后处理，不能据此自动重跑。进程树终止为平台级尽力处理。 |
| 人工介入台账 | Graph API 新增 `record-intervention`、`propose-improvement`、`update-improvement`；`interventions` 读取汇总显式记录和既有 `node_retry`。每条显式记录需有人类 actor、来源证据和结果信号；提案可由 human owner 标记采纳、重开或退役。 | 仅使用当前项目 Graph 的记录。状态变化不会修改 pack、自动采纳规则或免除必要的发布授权；人类按正常治理决定是否采用。 |

## 使用入口

- **评审：** 工作节点自评完成后，新评审执行通过对应 child issue 的 Graph GET 获取受限视图。初次 disposition 之后，人类可从完整 run 对照作者自评。评审发现应含严重度、位置和可复查依据。
- **行为评测：** 从 Core 的 `dist/host/experiment.js` 导入 `compareBehavior`；将七个场景作为初始任务，给 baseline/candidate 相同模型、工具版本、仓库 SHA 和 pack digest。每个场景至少重复两次。宿主的真实 agent adapter 返回观察与轨迹引用；独立评分器返回 `{pass, criticalFailure, evidence}`。先保存 baseline，再逐项验证技能描述、评审输入和上下文调整。
- **长命令：** 从 Core 的 `dist/host/check-runner.js` 导入 `startChecks`、`readCheckResult`。`startChecks(config)` 返回 `{manifestPath, completion, cancel}`。完成后读取 `unreadCompletion`，消费日志再用 `{acknowledge:true}` 确认。取消与超时使用同一执行的截止时间，不启动第二个 check run。
- **介入记录：** 已认证的人类在 run 根 issue 上调用 Graph POST `record-intervention`，提供 `kind`（retry/judge/approve/carry/trigger/stand-in）、`reason`、有 `sourceRef` 的 `evidence` 和 `outcomeSignal`。`propose-improvement` 引用同一 run 的介入 Decision ID，提供 `mechanism`、`expectedOutcome` 和来源证据。human owner 用 `update-improvement` 引用最新 Decision ID，并以 `status`、理由、来源证据、结果信号记录 `graduated`、`reopened` 或 `retired`。只对反复出现或造成实际损害的问题提出机制变更。

## 已验证与未验证

`node --test` 验证 pack 注册、技能元数据和 graph 路由；Core 的单元及 E2E 测试覆盖评审投影、行为对照输出、介入记录和长命令取消。`node scripts/build.mjs` 可产出插件、runner、Core 与评测模块。这里没有真实模型 A/B 结果，也没有在新版本 Paperclip 实例上执行插件升级或生产发布。
