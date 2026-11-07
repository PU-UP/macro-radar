# data.js 字段草案（v1.1）

状态：v1 改版方向已获同意（2026-11-04）；**本轮字段增量已获用户确认**（2026-11-07，宏观字段评估通过）  
原则：中国主线；美国/全球为外溢；服务四层用途——理解 / 学习 / 康波坐标 / 决策锚。  
用途边界：年频观察；宽基 / 行业 / 黄金 ETF；低频再平衡。**不是交易信号，不给出目标价或仓位指令。**

本文件是 **schema 契约**。v1 部分键（`china.propertyFixed` / `spillover` / `longCycle` / `decisionAnchors`）已有生产占位。**本轮只扩契约，禁止在 `assets/data.js` 发明未核验数值。** @macro 下期按本契约填数与核验；@Creator 按此铺版；@professor 认领学习展开。

## 顶层结构（目标）

```js
window.MACRO = {
  meta,           // 既有：builtAt, dataCutoff, stamp
  purpose,        // 新增：四层用途一句话（站内页脚/关于）
  gauges,         // 调整：偏中国四态；外部改为「外溢压力」
  kpis,           // 调整：中国 KPI 加厚；美国降级到 spillover
  china,          // 价格 / 景气 / 需求 / 信用 / 地产固投 / 财政 / 权益锚
  spillover,      // 美利率·美元·油价 → 对中传导
  longCycle,      // 康波/长周期坐标（短注，非论文，非交易信号）
  decisionAnchors,// 股市/买房/行业创业 条件句（风险预算，非目标价）
  learnHints,     // 口径旁学习短注（链到教授课件/Canvas）
  timeline,       // 保留：降权日频行情
  risks,          // 保留：展望
  method          // 口径说明可继续放 HTML；关键原则同步核验文档
}
```

> 迁移期允许暂保留旧键 `charts / demandTable / pmiStats / globalFacts`，由 Creator 改版时删并或迁入 `china.*`。

---

## 1. `china`（主线）

### 1.1 `china.price`
| 字段 | 说明 | 优先级 |
|------|------|--------|
| cpiYoY / cpiMoM | CPI 同比/环比 | 必留 |
| coreCpiYoY | 核心 CPI | 必留 |
| ppiYoY / ppiMoM | PPI | 必留 |
| ppiMinusCpi | 剪刀差 | 必留 |
| industrialProfitYoY | 规上工业利润（累计+单月） | 必留 |
| profitLeaders / profitLaggards | 少数行业对照（电子/黑金/汽车等） | 精简保留 |

### 1.2 `china.activity`
| 字段 | 说明 | 优先级 |
|------|------|--------|
| manufacturingPmi + 分项 | 生产/新订单/新出口/大中小 | 必留 |
| nonManufacturingPmi | 商务活动等 | 必留 |
| gdpYoY / gdpQoQ | 季度 GDP（标明同比） | 必留 |

### 1.3 `china.demand`（加厚）
| 字段 | 说明 | 优先级 |
|------|------|--------|
| retailSales | 社零总额同比（月+累计） | 必留 |
| retailMix | 可选/必选或商品 vs 餐饮（官方有则录） | 新增 |
| exports / imports / tradeBalance | 进出口 | 必留 |
| incomePerCapita | 居民收入名义/实际 | 强化 |

### 1.4 `china.credit`
| 字段 | 说明 | 优先级 |
|------|------|--------|
| afreYoY / m2YoY / m1YoY | 社融、货币 | 必留 |
| loanBreakdown | 居民/企业/票据结构 | 必留 |
| lpr1y / lpr5y | LPR | 必留 |
| cn10y | 国债收益率 | 必留 |
| policyRateNote | **政策锚主表述为 7 天逆回购（OMO）操作利率。** DR007 仅当存在稳定、可公开核验的序列时作为可选并列短注，不得单列为主 KPI | 强化 |
| realRateProxy | **近似实际利率，非正式官方实际利率。** 优先 `cn10y − coreCpiYoY`；可选并列 `lpr1y − coreCpiYoY`。来源：中债（cn10y）/ 全国银行间同业拆借中心·CFETS（LPR）+ 国家统计局（核心 CPI）。展示须标明「近似」 | 本期新增 |

**明确排除（本块主 KPI）：** 两融余额、北向资金 **不得** 进入 `china.credit` 主字段；仅可作 `timeline` / `footnote`。日频杠杆与北向流向不是年频观察的主读数。

### 1.5 `china.propertyFixed`（已落地骨架；本轮补需求侧）
| 字段 | 说明 | 优先级 |
|------|------|--------|
| reInvestYoY | 房地产开发投资同比 | 已有 |
| salesAreaYoY / newStartsYoY | 销售面积/新开工（有官方则录） | 已有 |
| homePriceIndex | 70 城或官方房价指数摘要 | 已有 |
| faiYoY / privateFaiYoY | 固投、民间投资 | 已有 |
| hhMediumLongLoan | 住户中长期贷款（人民银行金融统计；须标明增量还是余额同比） | 本期新增 |
| inventoryOrDestock | **仅当**有官方待售面积等口径（如统计局商品房待售面积）。**禁止**中介库存、城市草根调研、券商草根去化作为正刊主字段 | 有官方则录 |

既有 `reInvest` / `sales` / `newStarts` / `homePrice` / `fai` 字段保持不变，本轮只加需求侧可核验项。

### 1.6 `china.fiscal`（轻量一期：由「可二期」上调）
| 字段 | 说明 | 优先级 |
|------|------|--------|
| specialBondProgress | 专项债发行额 / 进度。来源须为财政部原文或可交叉核验的官方稿（额度、已发行、进度三者能对齐则录） | 本期新增 |
| generalBudgetYoY | 一般公共预算收入或支出同比；若单月收入噪声大，可用**累计支出同比**（须可核验） | 有官方则录 |

**禁止**自造「财政脉冲 / fiscal impulse」单一数字。若无单一官方序列，财政立场写入 `decisionAnchors` 条件句，不进 KPI。

### 1.7 `china.equityAnchor`（轻量；亦可挂在 `decisionAnchors` 中 id=`equity` 的 `metrics`）

数据落点优先本命名空间；`decisionAnchors.equity.metrics` 只引用这些字段 id，**禁止两处各写一套无出处数字**。

用途：年频**风险预算条件**（宽基 / 行业 / 黄金 ETF、低频再平衡），**不是目标价、不是交易信号**。

| 字段 | 说明 | 优先级 |
|------|------|--------|
| earningsGrowth 和/或 roe | 须**指名指数**（如沪深 300 / 中证全指）的盈利增速和/或 ROE；来源为交易所或中证指数等官方 / 准官方 | 有稳定源则录 |
| pePercentile | 固定指数 + 固定回看窗口（写入字段，如 10 年）+ 来源。**无免费稳定源时标「暂定 / 未独立复核」**，不得假装已核 | 暂定可 |

---

## 2. `spillover`（外溢插件，替代对等「美国栏」）

每条含：`value`, `asOf`, `source`, **`channel`**（传到中国的机制一句话）。

| 字段 | channel 示例 |
|------|----------------|
| fedFundsTarget | 全球利率与风险偏好 |
| usCpiOrPce | 输入性通胀预期 / 外需定价 |
| usGrowthSaar | 外需景气（须标 SAAR） |
| us10y | 中美利差、资本流动 |
| dxy / usdcny | 汇率与出口利润。`usdcny` **须标明序列口径**：CFETS 人民币兑美元**中间价**（非即期收盘、非离岸 CNH）。日度中间价不作主叙事 |
| cfetsReer | CFETS 人民币汇率指数（**月度**）。有月度官方值时，**优先于日度中间价叙事** |
| brent | 输入性通胀、中下游利润。`channel` 或 `learnHints` 附 `ppiLagNote`：油价→国内 PPI 约 **1–2 个季度滞后**为**工作假设**，非计量结论，不可由单月涨跌线性外推 |

**降权或不进主 KPI：** 单日股指涨跌、纳指叙事、加息概率（可作 `footnote`）。

---

## 3. `longCycle`（康波坐标，短）

本轮**不扩展**字段。保持短坐标 + 免责声明；**不是交易信号**，不得据此给出买卖点或仓位指令。争议与投资含义归 @professor。

```js
longCycle: {
  label: '当前坐标（工作假设）',
  phase: '…',              // 如：成长/衰退/萧条/复苏 —— 须标明「框架假设」
  drivers: ['信用', '产能', '能源'], // 与当下数据的勾连点
  evidenceIds: [],           // 指向 china/spillover 字段 id
  disclaimer: '长波划分有争议，非预测、非交易信号；展开见教授课。',
  learnRef: ''               // Canvas / 群课链接
}
```

正刊禁止长文辩论。

---

## 4. `decisionAnchors`（决策锚）

三条**可证伪条件句**，不是荐股/喊单；服务年频风险预算与低频再平衡（宽基 / 行业 / 黄金 ETF），**不更新目标价**。

```js
decisionAnchors: [
  { id: 'equity',  title: '股市',   ifThen: '若…则风险预算偏…；若…则需降预期',
    watch: ['realRateProxy', 'pePercentile', 'cfetsReer', 'brent'],
    metrics: ['earningsGrowth', 'roe', 'pePercentile'] }, // 引用 china.equityAnchor，可选
  { id: 'housing', title: '买房',   ifThen: '…',
    watch: ['reInvestYoY', 'homePriceIndex', 'lpr5y', 'hhMediumLongLoan'] },
  { id: 'career',  title: '行业/创业', ifThen: '…',
    watch: ['specialBondProgress', 'realRateProxy'] }
]
```

`watch` 示例可含：`realRateProxy`、`specialBondProgress`、`hhMediumLongLoan`、`pePercentile`（有源才挂）、`cfetsReer`、`brent`。无稳定源的字段不要写进当期 `watch` 假装已跟踪。

每期随数据更新条件，不更新「目标价」。

---

## 5. `learnHints`

```js
learnHints: [
  { anchor: 'gdp-yoy-vs-saar', text: '同比 ≠ SAAR', href: '…同比vsSAAR Canvas…' },
  { anchor: 'lpr-pass-through', text: 'LPR 如何影响房贷', href: '' },
  { anchor: 'real-rate-proxy', text: 'cn10y−核心CPI 为近似实际利率，非正式官方口径', href: '' },
  { anchor: 'brent-ppi-lag', text: '油价→PPI 约 1–2 个季度滞后为工作假设，非计量结论', href: '' }
]
```

---

## 6. 明确不追踪（正刊）

- 日频股指涨跌细节、未核验盘中点位  
- **日频两融余额、北向资金作为主 KPI**（脚注 / 时间线除外）  
- 过细行业利润长尾（放 `reading-sample`）  
- 第三国政经长篇（无直接外溢则不下沉）  
- 混口径油价序列、付费库原始底层  
- 中介 / 券商草根库存、非官方去化周期  
- 自造「财政脉冲」单一指数  
- 由长周期坐标引申出的买卖点 / 仓位指令  

---

## 7. 落地顺序

1. **已完成（v1）：** 本文契约入库；Creator 预留导航：地产固投 / 外溢 / 长周期 / 决策锚；macro 已填 `china.propertyFixed` + `spillover` + 首版 `longCycle` / `decisionAnchors`  
2. **本轮（v1.1，仅契约）：** 信用近似实际利率、财政轻量字段、权益锚、地产需求侧、外溢汇率口径 / CFETS 指数 / 油价滞后注。**不改 `assets/data.js`、不发明数字**  
3. **下一期数据：** macro 按本契约填 `realRateProxy` / `specialBondProgress` / `hhMediumLongLoan` / `equityAnchor` / `cfetsReer`（**有可核验源才填**）；数字须进 `DATA-VERIFICATION.md`  
4. **并行：** professor 准备康波与决策课纲；`longCycle` 保持短坐标，不扩展  
5. 旧键迁移完成后删除对等「美国专题」导航，改为「外溢」

## 8. DoD（字段层）

- 每个新数值有 `source` + 核验小节  
- 美国增长展示处可见 SAAR 标注  
- 决策锚无个股推荐措辞、无目标价；用途为年频 / ETF / 低频再平衡的风险预算条件  
- 长周期块含争议免责声明，且不扩展为交易信号  
- **本轮 schema 增量未在 `data.js` 发明未核验数字**  
- `realRateProxy` 展示为近似，非正式官方实际利率  
- 两融 / 北向不进主 KPI  
- 无自造财政脉冲；库存仅官方待售面积等口径  
- `pePercentile` 无免费稳定源则标暂定 / 未独立复核  
- 油价 → PPI 滞后注标明为工作假设  
