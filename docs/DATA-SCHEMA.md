# data.js 字段草案（v1）

状态：已获用户同意的改版方向（2026-11-04）  
原则：中国主线；美国/全球为外溢；服务四层用途——理解 / 学习 / 康波坐标 / 决策锚。

本文件是 **schema 契约**，尚未改生产 `assets/data.js`。@macro 填数与核验；@Creator 按此铺版；@professor 认领学习展开。

## 顶层结构（目标）

```js
window.MACRO = {
  meta,           // 既有：builtAt, dataCutoff, stamp
  purpose,        // 新增：四层用途一句话（站内页脚/关于）
  gauges,         // 调整：偏中国四态；外部改为「外溢压力」
  kpis,           // 调整：中国 KPI 加厚；美国降级到 spillover
  china,          // 新增命名空间：价格/景气/需求/信用/地产固投
  spillover,      // 新增：美利率·美元·油价 → 对中传导
  longCycle,      // 新增：康波/长周期坐标（短注，非论文）
  decisionAnchors,// 新增：股市/买房/行业创业 条件句
  learnHints,     // 新增：口径旁学习短注（链到教授课件/Canvas）
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
| policyRateNote | 7 天/隔夜锚说明 | 短注 |

### 1.5 `china.propertyFixed`（**新增高优先**）
| 字段 | 说明 | 优先级 |
|------|------|--------|
| reInvestYoY | 房地产开发投资同比 | 新增必做 |
| salesAreaYoY / newStartsYoY | 销售面积/新开工（有官方则录） | 新增必做 |
| homePriceIndex | 70 城或官方房价指数摘要 | 新增 |
| faiYoY / privateFaiYoY | 固投、民间投资 | 新增必做 |

### 1.6 `china.fiscal`（中优先，可二期）
一般公共预算、专项债发行进度——有稳定官方序列再上。

---

## 2. `spillover`（外溢插件，替代对等「美国栏」）

每条含：`value`, `asOf`, `source`, **`channel`**（传到中国的机制一句话）。

| 字段 | channel 示例 |
|------|----------------|
| fedFundsTarget | 全球利率与风险偏好 |
| usCpiOrPce | 输入性通胀预期 / 外需定价 |
| usGrowthSaar | 外需景气（须标 SAAR） |
| us10y | 中美利差、资本流动 |
| dxy / usdcny | 汇率与出口利润 |
| brent | 输入性通胀、中下游利润 |

**降权或不进主 KPI：** 单日股指涨跌、纳指叙事、加息概率（可作 `footnote`）。

---

## 3. `longCycle`（康波坐标，短）

```js
longCycle: {
  label: '当前坐标（工作假设）',
  phase: '…',              // 如：成长/衰退/萧条/复苏 —— 须标明「框架假设」
  drivers: ['信用', '产能', '能源'], // 与当下数据的勾连点
  evidenceIds: [],           // 指向 china/spillover 字段 id
  disclaimer: '长波划分有争议，非预测；展开见教授课。',
  learnRef: ''               // Canvas / 群课链接
}
```

正刊禁止长文辩论；争议与投资含义归 @professor。

---

## 4. `decisionAnchors`（决策锚）

三条**可证伪条件句**，不是荐股/喊单：

```js
decisionAnchors: [
  { id: 'equity',  title: '股市',   ifThen: '若…则风险偏好偏…；若…则需降预期', watch: ['…'] },
  { id: 'housing', title: '买房',   ifThen: '…', watch: ['reInvestYoY', 'homePriceIndex', 'lpr5y'] },
  { id: 'career',  title: '行业/创业', ifThen: '…', watch: ['…'] }
]
```

每期随数据更新条件，不更新「目标价」。

---

## 5. `learnHints`

```js
learnHints: [
  { anchor: 'gdp-yoy-vs-saar', text: '同比 ≠ SAAR', href: '…同比vsSAAR Canvas…' },
  { anchor: 'lpr-pass-through', text: 'LPR 如何影响房贷', href: '' }
]
```

---

## 6. 明确不追踪（正刊）

- 日频股指涨跌细节、未核验盘中点位  
- 过细行业利润长尾（放 `reading-sample`）  
- 第三国政经长篇（无直接外溢则不下沉）  
- 混口径油价序列、付费库原始底层  

---

## 7. 落地顺序

1. **本期：** 本文契约入库；Creator 预留导航：地产固投 / 外溢 / 长周期 / 决策锚  
2. **下一期数据：** macro 填 `china.propertyFixed` + 改写 `spillover` + 首版 `longCycle`/`decisionAnchors`（数字须进 `DATA-VERIFICATION.md`）  
3. **并行：** professor 准备康波与决策课纲  
4. 旧键迁移完成后删除对等「美国专题」导航，改为「外溢」

## 8. DoD（字段层）

- 每个新数值有 `source` + 核验小节  
- 美国增长展示处可见 SAAR 标注  
- 决策锚无个股推荐措辞  
- 长周期块含争议免责声明  
