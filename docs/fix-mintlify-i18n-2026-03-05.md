# Mintlify i18n 导航与翻译修复记录

日期: 2026-03-05
影响: 文档站多语言显示异常

## 问题现象

1. 左侧导航中英文混杂 — 部分项被翻译（Chat → "创建对话补全"），部分保持英文（Audio/Music/3D）
2. Introduction 页面显示 AI 翻译的思维链（"Translation Task Assessment..."），而非实际翻译内容

## 根因分析

### 问题 1: 导航混杂

commit `18ffd98` (2026-01-26) 将 `docs.json` 从 `navigation.languages` 模式改为 `navigation.tabs` 模式时，
把 `languages` 数组从 13 个语言砍到只剩 `en` 和 `es`。

Mintlify 检测到 `zh/` 等目录存在但没有对应的 language 声明，触发了内置 AI 自动翻译，
导致部分导航项被自动翻译、部分遗漏。

### 问题 2: 思维链泄露

`scripts/translate.mjs` 使用 `gemini-3-flash-preview` 模型翻译文档。
模型偶尔不遵守 "Return ONLY the translated content" 指令，返回完整的思考过程。
脚本直接将原始输出写入文件，没有任何校验。

### 附加问题: zh-TW vs zh-Hant 不一致

- commit `c29c398` 将目录从 `zh-TW` 改名为 `zh-Hant`（Mintlify 要求）
- 但 `translate.mjs` 和 `generate-i18n-config.mjs` 仍使用 `zh-TW`
- 导致翻译脚本输出到不存在的 `zh-TW/` 目录

## 修复内容

### 1. `docs.json` — 补全语言声明

`navigation.languages` 从 2 个语言恢复为 13 个（en, zh, zh-Hant, ja, ko, de, fr, es, pt, ar, vi, id, tr）。
保留 `tabs` 结构不变。

### 2. `scripts/translate.mjs` — 修复路径 + 加输出校验

- `zh-TW` → `zh-Hant`（TARGET_LANGUAGES 和 SKIP_PATTERNS）
- 新增翻译输出校验：检查返回内容是否以 frontmatter `---` 开头
- 自动剥离模型可能包裹的 markdown code fence

### 3. `scripts/generate-i18n-config.mjs` — 修复路径

- `zh-TW` → `zh-Hant`

### 4. 删除残留文件

- 删除 `docs.original.json`（generate-i18n-config.mjs 的备份文件，已过时）

## 防复发检查清单

- [ ] 翻译脚本运行后，检查输出文件是否以 `---` 开头
- [ ] `docs.json` 的 `navigation.languages` 必须包含所有有翻译目录的语言
- [ ] 翻译目录名必须与 Mintlify 支持的 locale 一致（zh-Hant 而非 zh-TW）
- [ ] 主站用 `zh-TW`，Mintlify 文档用 `zh-Hant`，两个仓库独立，不要混用
