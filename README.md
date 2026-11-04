# 宏观观察 Macro Radar

静态宏观经济观察台：以**中国宏观为主线**，美国与全球作为**强外部信息 / 外溢风向标**（不是对等对比）。

当前成品是纯前端页面，无构建步骤，用本地静态服务器打开即可。

## 结构

```
index.html                 # 正式观察台入口
assets/
  data.js                  # 唯一数据层（数值 + source）
  app.js                   # 渲染与交互
  styles.css               # 样式
DATA-VERIFICATION.md       # 数据核验结论与修正记录（权威）
AGENTS.md                  # 给维护代理 / 协作者的规则
reading-sample/            # 深化阅读原型与证据样本（非生产入口）
```

## 本地预览

在仓库根目录起一个静态服务器，例如：

```bash
npx --yes serve -p 5173 .
# 或: python -m http.server 5173
```

然后打开 `http://localhost:5173/`。不要依赖 `file://`（浏览器会拦本地脚本）。

## 更新一期观察（概要）

1. 只改 `assets/data.js`（或经审核后同步到它），每条数值保留 `source` / 日期。
2. 同步 `index.html` 文案中写死的判断与数字（若有）。
3. 在 `DATA-VERIFICATION.md` 追加本期核验：来源、口径、错误与修正。
4. 更新 `meta.dataCutoff` / 页眉戳记。
5. 本地静态预览自检后再提交。

详细约束见 [AGENTS.md](./AGENTS.md)。

## Git

本仓库面向「先本地就绪、再推远程」。推远程前确认：

- 无密钥 / `.env`（已在 `.gitignore`）
- `DATA-VERIFICATION.md` 与 `data.js` 一致
- 提交信息说明本期数据截止日

## 维护角色（约定）

| 角色 | 职责 |
|------|------|
| macro | 数据、口径、判断文案、核验记录、外溢解读 |
| Creator | 版式、图表、可读性、展示页联动 |
| 用户 | 远程托管、权限、最终发布确认 |