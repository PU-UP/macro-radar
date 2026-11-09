# data.js 字段草案（v1.2）

状态：v1 改版方向已获同意（2026-11-04）；v1.1 宏观字段增量已获用户确认（2026-11-07）；**估值层字段形状用户确认 2026-11-09（经 @professor）**。  
原则：中国主线；美国/全球为外溢；服务四层用途——理解 / 学习 / 康波坐标 / 决策锚。  
用途边界：年频观察；宽基 / 行业 / 黄金 ETF；低频再平衡。**不是交易信号，不给出目标价或仓位指令。**

本文件是 **schema 契约**。v1 / v1.1 部分键已有生产占位。**本 PR 只扩契约**（`china.equityAnchor` → 五只宽基 `indices[]`），**禁止在 `assets/data.js` 发明未核验数值。** @macro 下期按本契约填数与核验；@Creator 按此铺版；@professor 认领学习展开。

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

### 1.7 `china.equityAnchor`（v1.2 估值层：按指数分列）

数据落点优先本命名空间；`decisionAnchors` 的 `metrics` / `watch` **只引用字段 id**（如 `equityAnchor.csi300.pePercentile`），**禁止两处各写一套数**。

用途：年频**风险预算加减**（宽基 ETF、低频再平衡），**不是目标价、不是买卖开关、不是交易信号**。宽广度本期不加。

**本期范围（五只宽基，暂不加行业 / 美股）：**

| `id`（稳定，供 decisionAnchors 引用） | `code` | `name` |
|--------------------------------------|--------|--------|
| `csi300` | `000300` | 沪深300 |
| `csi500` | `000905` | 中证500 |
| `csi1000` | `000852` | 中证1000 |
| `chinext` | `399006` | 创业板指 |
| `star50` | `000688` | 科创50 |

#### 评估结论（2026-11-09，经 @professor；本 PR 不写入 `data.js`）

- **`peTTM`：** 中证指数公司 factsheet 对多数宽基提供「滚动市盈率」，并注明「指数指标均采用个股计算用股本计算得出」——可作官方 peTTM 候选源。`weighting` 须与指数官方一致，填「计算用股本」。示例（截至 **2026-10-30** 的公开 factsheet，**仅说明候选源形态，本期不得抄入 `data.js`**）：000300=12.61、000905=21.59、000852=25.08、000688=55.41。创业板指 **399006** 优先深交所 / 中证可核验稿；无则该指数 `peTTM` 留空（`verificationStatus: 'empty'`）。
- **`pePercentile`：** 公开免费渠道**无**与指数公司一致的稳定官方历史分位序列；第三方（理杏仁 / 股叉叉等）分位互不一致。契约**允许**该字段，但 `verificationStatus` **必须为 `provisional` / `unverified`**，或本期不填（`empty`）。**禁止**标 `verified`，禁止假装已核。
- **`earningsGrowth` / `roe`：** 有稳定官方 / 准官方源（交易所或中证指数等）则录为对象；否则保持 `null`。

#### 字段形状

`verificationStatus`：`empty` | `verified` | `provisional` | `unverified`。`empty` = 本期不填；`verified` = 已独立回溯官方 / 约定交叉源并写入核验文档；`provisional` / `unverified` = 须在展示层标明「暂定 / 未独立复核」。

`pePercentile.value` 单位统一为 **0–100 的百分位**（`unit: 'percent'`），禁止 0–1 与 0–100 混用。默认回看 `lookbackDefaultYears`（10 年），可被单指数 `pePercentile.lookbackYears` 覆盖。

`earningsGrowth` / `roe` 有源时的对象形状与 `peTTM` 同级（`value` / `unit` / `asOf` / `source` / `sourceUrl` / `verificationStatus`）；无源则为 `null`，不要放空对象假装有数。

```js
china.equityAnchor: {
  version: '1.2',
  purpose: '年频风险预算条件（宽基 ETF），非目标价、非交易信号',
  lookbackDefaultYears: 10,  // pePercentile 默认回看；可被单指数覆盖
  indices: [
    {
      id: 'csi300',          // 稳定 id，供 decisionAnchors 引用
      code: '000300',
      name: '沪深300',
      peTTM: {
        value: null,         // number | null
        weighting: '计算用股本', // 须与指数官方一致；中证 factsheet 口径
        asOf: null,
        source: null,
        sourceUrl: null,
        verificationStatus: 'empty' // empty | verified | provisional | unverified
      },
      pePercentile: {
        value: null,         // 0–100 的百分位；禁止与 0–1 混用
        unit: 'percent',
        lookbackYears: 10,
        asOf: null,
        source: null,
        sourceUrl: null,
        verificationStatus: 'empty' // 无官方分位序列时不得为 verified
      },
      earningsGrowth: null,  // 可选；有稳定源才填对象
      roe: null
    }
    // 其余四只同结构：csi500/000905, csi1000/000852, chinext/399006, star50/000688
  ]
}
```

v1.1 顶层 `earningsGrowth` / `roe` / `pePercentile` **不再作为生产键**；填数期写入 `indices[]` 各指数对象。渲染层在未改版前可继续读旧顶层键，但不得在旧键发明数字。

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

权益侧本期观察范围 = §1.7 五只宽基（`csi300` / `csi500` / `csi1000` / `chinext` / `star50`）。**行业指数与美股不加。** `metrics` / `watch` **只引用字段 id**，数字只存在于 `china.equityAnchor.indices[]`（及核验文档），**禁止**在决策锚对象里再写一套 PE / 盈利 / ROE。

```js
decisionAnchors: [
  { id: 'equity',  title: '股市',   ifThen: '若…则风险预算偏…；若…则需降预期',
    watch: ['realRateProxy', 'cfetsReer', 'brent'],
    // pePercentile 无 verified 源时不要写入当期 watch 假装已跟踪
    metrics: [] }, // 有 verified 源才挂；id 形如 equityAnchor.csi300.peTTM
  { id: 'housing', title: '买房',   ifThen: '…',
    watch: ['reInvestYoY', 'homePriceIndex', 'lpr5y', 'hhMediumLongLoan'] },
  { id: 'career',  title: '行业/创业', ifThen: '…',
    watch: ['specialBondProgress', 'realRateProxy'] }
]
```

`watch` 示例可含：`realRateProxy`、`specialBondProgress`、`hhMediumLongLoan`、`equityAnchor.csi300.peTTM`（有 verified 源才挂）、`cfetsReer`、`brent`。`equityAnchor.*.pePercentile` **仅当** `verificationStatus === 'verified'` 才写入当期 `watch`；当前无官方分位序列，故**不要**写进 watch 假装已跟踪。无稳定源的字段同样不要挂。

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
- 行业指数 / 美股估值层（本期 `equityAnchor` 不加）  
- 指数宽广度（本期不加）  
- 把无官方分位序列的 `pePercentile` 标为 `verified`  

---

## 7. 落地顺序

1. **已完成（v1）：** 本文契约入库；Creator 预留导航：地产固投 / 外溢 / 长周期 / 决策锚；macro 已填 `china.propertyFixed` + `spillover` + 首版 `longCycle` / `decisionAnchors`  
2. **已完成（v1.1）：** 信用近似实际利率、财政轻量字段、权益锚（旧顶层键）、地产需求侧、外溢汇率口径 / CFETS 指数 / 油价滞后注；macro 已按 v1.1 填已核验槽位，`equityAnchor` 仍留空  
3. **本轮（v1.2，仅契约）：** `china.equityAnchor` 改为五只宽基 `indices[]`（peTTM / pePercentile / 可选 earningsGrowth·roe）。**不改 `assets/data.js` 数值、不发明数字、不把 factsheet 示例抄入生产数据**  
4. **下一期数据：** macro 按本契约填 `indices[]` 的 `peTTM`（中证 factsheet 等可独立核验源才填；399006 无深交所/中证可核验稿则留空）；`pePercentile` 无官方分位序列则 `empty` 或 `provisional` / `unverified`，**不得 `verified`**；`earningsGrowth` / `roe` 有稳定官方源才填。数字须进 `DATA-VERIFICATION.md`  
5. **并行：** professor 准备康波与决策课纲；`longCycle` 保持短坐标，不扩展  
6. 旧键迁移完成后删除对等「美国专题」导航，改为「外溢」

## 8. DoD（字段层）

- 每个新数值有 `source` + 核验小节  
- 美国增长展示处可见 SAAR 标注  
- 决策锚无个股推荐措辞、无目标价；用途为年频 / ETF / 低频再平衡的风险预算条件  
- 长周期块含争议免责声明，且不扩展为交易信号  
- **本轮 schema 增量未在 `data.js` 发明未核验数字**  
- `realRateProxy` 展示为近似，非正式官方实际利率  
- 两融 / 北向不进主 KPI  
- 无自造财政脉冲；库存仅官方待售面积等口径  
- `pePercentile` 无官方分位序列则不得为 `verified`（`empty` / `provisional` / `unverified`）  
- 油价 → PPI 滞后注标明为工作假设  
- **本 PR 只扩契约**；估值层 factsheet 示例不得写入 `data.js`  
- `equityAnchor` 本期仅五只宽基；行业 / 美股 / 宽广度不加  
- `decisionAnchors.metrics` / `watch` 只引用 `equityAnchor.{id}.{field}`，不在锚点对象内重复数值  
