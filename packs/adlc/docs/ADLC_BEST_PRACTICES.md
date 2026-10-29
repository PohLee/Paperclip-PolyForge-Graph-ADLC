# ADLC：需求发现、发布流程与生产监控的实践依据

本笔记是 ADLC pack 需求发现、发布流程和生产监控的研究依据。发布的 pipeline 尚未确定，因此只定义与部署工具无关的流程和证据交接，不把它称为发布认证。下文“pack 可实现”指可由图、技能、决策规则和版本化工件表达；**当前 pack 已实现这些流程的图和技能**，宿主仍负责真实身份、外部数据、权限和执行工具。[现有范围](../README.md)；[Anthropic 的跨阶段版本化工件与人工判断原则](https://claude.com/resources/articles/the-ai-native-sdlc-playbook)。

## 1. 需求发现（discovery）

| 实践与建议工件 | pack 可实现 | 依赖宿主能力 | 依据 |
| --- | --- | --- | --- |
| 以问题和目标用户起步，不把收到的解决方案直接当成需求。`discovery_brief` 记录问题、目标用户、当前行为、预期结果和发现范围。 | 图节点要求先形成问题陈述，再讨论方案。 | 访问原始请求、产品决策和业务负责人。 | [GOV.UK：发现阶段先重新表述问题](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works)；[Anthropic：从来源汇总为 `intent.md`](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) |
| 用多种原始证据理解用户及整个旅程，包括直接用户、支持人员、现有服务、分析数据、技术和制度约束。`evidence_ledger` 给每条发现附来源、日期、适用人群，并把观察、解释和未验证假设分开。 | 要求来源引用、证据缺口和冲突清单；对缺失证据保留“未知”。 | 用户访谈、客服/工单、分析平台、市场和既有系统资料的合法访问。 | [GOV.UK：发现阶段要了解用户、上下文、约束和机会](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works)；[GOV.UK：用户研究覆盖不同用户及服务渠道](https://www.gov.uk/service-manual/user-research/user-research-in-discovery) |
| 记录可检验的机会、备选解决方向、重大约束和风险假设，定义用户结果及测量方法。`discovery_options` 不预设一定要开发软件。 | 组织选项和证据，标记最值得进一步验证的假设；产生成功信号草案。 | 产品、设计、技术、运营负责人验证可行性；真实测量数据接入。 | [GOV.UK：可考虑服务以外的改进，并在发现阶段考虑成功指标](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works) |
| 由授权产品负责人对发现结果作 **继续探索 / 补证据 / 停止** 的决定。`discovery_decision` 说明证据、剩余不确定性、成本收益和下一步；继续时形成版本化 `accepted_intent`，交给规格定义。发现本身不要求写代码。 | 决策路由、原因和精确工件版本；未决问题进入下游交接。 | 已认证的产品决策者；若继续，后续设计/实施图的宿主编排。 | [GOV.UK：发现结束是决定是否继续，停止也是有效结果](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works)；[Anthropic：被接受的 intent 进入规格阶段](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) |

**建议完成条件：**产品负责人能依据来源判断问题是否值得继续；目标用户、主要约束、成功信号、未解假设和下一步均有明确记录。依据是 [GOV.UK 的发现结束条件](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works)，而不是文档篇幅或固定研究时长。

## 2. 发布流程（pipeline 未定）

此阶段从现有 `acceptance_decision` 和**精确候选版本**进入。流程是“计划 → 授权 → 宿主执行 → 观察 → 结案/恢复”，不假定 CI/CD 平台、部署策略、环境数量、自动批准机制，也不重复验证图的 QA/安全验收。发布前的准备度检查只确认该次发布流程的必要信息与回退路径，**不宣称形成完整发布认证**。[AWS：对变更作知情部署决定](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operational-readiness.html)；[Anthropic：发布动作由授权关口约束](https://claude.com/resources/articles/the-ai-native-sdlc-playbook)。

| 实践与建议工件 | pack 可实现 | 依赖宿主能力 | 依据 |
| --- | --- | --- | --- |
| `release_plan` 指向固定候选版本、验收决定、变更范围、目标环境、负责人、预期用户影响、通信对象、观察窗口和成功/中止信号。尽量保持变更小而可逆。 | 计划模板、版本引用和缺项检查。 | 实际目标环境、发布窗口、影响面及相关团队信息。 | [AWS：小而可逆的变更降低影响](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_dev_integ_freq_sm_rev_chg.html)；[AWS：准备度与变更管理](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operational-readiness.html) |
| 发布前写明 `recovery_plan`：何时暂停、何时回退或修复前进、由谁执行、预期恢复到哪个已知良好状态。记录无法回退的步骤和待人工判断项。 | 预检显式列出恢复路径和缺项；人工启动决策须引用预检，实际生产阻断由宿主执行。 | 真实的部署/回退可行性、环境权限及经验证的操作手册。 | [AWS：失败变更的回退或修复前进计划应在生产部署前写明并测试](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_mit_deploy_risks_plan_for_unsucessful_changes.html) |
| `release_authorization` 由有权的真人或宿主既定授权机制，对**这一个候选版本和计划**作批准、推迟或拒绝决定。pack 记录身份、理由和引用，不能由代理代签。 | 决策关口和不可变记录；未授权时停住。 | 已认证的授权身份、组织发布政策，以及阻断实际部署动作的宿主权限控制。 | [Anthropic：生产发布关口和具名授权](https://claude.com/resources/articles/the-ai-native-sdlc-playbook)；[AWS：权衡部署收益、风险并符合治理要求](https://docs.aws.amazon.com/wellarchitected/2022-03-31/framework/ops_ready_to_support_informed_deploy_decisions.html) |
| 宿主执行发布后，`release_observation` 记录发布 ID、版本、时间、范围及事前基线与事后指标。若平台支持，可采用分批/金丝雀并比较新旧群体；不支持时用可用的观察与人工暂停点。 | 根据真实回传事件形成观察报告；人工结案为完成、请求恢复或转入调查，保留精确发布实例。 | 部署系统、发布状态、流量切分能力（若有）、遥测与回退操作。 | [Google SRE：金丝雀是部分且限时的发布和评估](https://sre.google/workbook/canarying-releases/)；[AWS：以监控判断发布成功或失败](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_mit_deploy_risks_plan_for_unsucessful_changes.html) |
| `release_outcome` 记录成功、暂停、回退或修复前进，以及观察证据和后续问题。按同一服务的时间序列看部署频率、变更失败率、失败发布恢复时间等，改进流程，不把单次发布当成认证。 | 现有图记录完成、恢复请求或事故交接；真实恢复结果和跨次发布指标依赖后续宿主事件。 | 部署与事故历史的可靠数据。 | [DORA：软件交付吞吐与不稳定性指标](https://dora.dev/guides/dora-metrics/)；[Anthropic：跨阶段工件构成审计链](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) |

## 3. 生产监控与反馈

| 实践与建议工件 | pack 可实现 | 依赖宿主能力 | 依据 |
| --- | --- | --- | --- |
| `monitoring_plan` 从用户实际体验选少量关键 SLI/SLO，并明确计算定义、数据源、窗口、目标和负责人。延迟、流量、错误、饱和度是服务监控的基本起点；产品结果另列为成功信号。 | skill规定监控契约内容；图要求宿主提供版本化计划标识，再判断一个观测窗口。 | 真实业务指标、遥测采集、查询权限及服务负责人。 | [Google SRE：SLI/SLO 应从用户在意的行为出发](https://sre.google/sre-book/service-level-objectives/)；[Google SRE：四个黄金信号](https://sre.google/sre-book/monitoring-distributed-systems/) |
| 遥测按需要组合指标、日志和链路；将部署版本、环境和时间与观察结果关联。`observation_record` 保留查询、窗口、样本和缺失数据，不把“未收到告警”当作健康证明。 | 关联发布版本和观测证据、标明数据质量。 | OpenTelemetry 或现有平台的采集、存储、查询及版本标记。 | [OpenTelemetry：指标、日志、链路等信号](https://opentelemetry.io/docs/concepts/signals/)；[Google SRE：监控可采用多种数据](https://sre.google/workbook/monitoring/) |
| 告警针对需要行动的显著用户影响，指定阈值/窗口、严重度、接手人和 runbook，并持续衡量误报、漏报、检测与恢复时间。检测规则应是确定性的；代理可在触发后辅助诊断。 | 图可接收宿主已触发的告警证据，路由观察、调查或数据缺口；规则运行、通知和 runbook 执行由宿主负责。 | 告警引擎、值班机制、通知渠道和经授权的处置工具。 | [Google SRE：以 SLO 消耗设计可行动的告警](https://sre.google/workbook/alerting-on-slos/)；[Anthropic：确定性检测后再调用代理，按权限分层](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) |
| 重大异常形成 `incident_record`，先确认用户影响并缓解，再调查根因；记录时间线、版本、决策、恢复证据和责任人。事后复盘的行动项进入缺陷或新 `accepted_intent`，并补回归用例。 | 图生成 `incident_brief` 并引用候选版本与观测窗口；后续调试、复盘和需求发现交接需要宿主执行。 | 事故响应人员、生产操作权限、工单/沟通系统和回归执行环境。 | [Google SRE：事故响应与协调](https://sre.google/workbook/incident-response/)；[Google SRE：复盘记录影响、缓解、原因和预防行动](https://sre.google/sre-book/postmortem-culture/)；[Anthropic：生产信号回写为新 intent](https://claude.com/resources/articles/the-ai-native-sdlc-playbook) |

**建议完成条件：**每个受监控服务能指出谁负责、用户体验如何测量、何种异常需要行动、从哪个版本开始、怎样响应，以及发现如何回流到下一轮工作。[Google SRE 的 SLO 与告警实践](https://sre.google/workbook/alerting-on-slos/)支持这一闭环。若宿主没有遥测和告警接入，pack 可以保存计划与人工观察记录，但不能声称在自动监控生产。

## 对 pack 的落地状态

1. **需求发现图已实现**：问题框定 → 内外部与用户证据 → `evidence_ledger`、`discovery_options`、`versioned_intent` → 人工推进、补证据或停止。推进后仍需宿主记录正式产品决策及后续规格。依据：[GOV.UK 的发现到下一阶段决定](https://www.gov.uk/service-manual/agile-delivery/how-the-discovery-phase-works)。
2. **发布流程已拆为两张图**：`release-process` 从固定验收版本形成计划、预检和人工操作授权，然后停在宿主执行交接；只有收到真实发布事件及关联授权后，`release-observation` 才进行观察、结案或恢复/事故交接。依据：[AWS 的失败变更计划](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/ops_mit_deploy_risks_plan_for_unsucessful_changes.html)、[Anthropic 的授权关口](https://claude.com/resources/articles/the-ai-native-sdlc-playbook)。
3. **生产监控图已实现单窗口事件入口**：宿主提供监控计划、观测窗口与数据；图路由健康、观察、事故或数据不足。遥测和告警能力接入后，宿主才能启用定时或自动触发。依据：[Google SRE 的可行动告警](https://sre.google/workbook/alerting-on-slos/)、[Anthropic 的维护闭环](https://claude.com/resources/articles/the-ai-native-sdlc-playbook)。

这些步骤是基于上列来源与现有 pack 结构的**实现建议**，不是来源声称存在的统一标准。release graph 可以管理流程，并在宿主提供可信执行事件后记录发布结果；它自身无法验证生产动作的真实性。在 pipeline、环境与授权控制未绑定前，它也不能提供完整发布认证。
