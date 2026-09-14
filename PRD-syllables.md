# PRD · Dashboard 音节结构可视化（Syllables）

> 关键词：音节可视化 / Syllables / 音节骨架 / ipaSkeleton / 组合 / 单双元音 / 辅音 / 自然拼读 / dashboard
> 关联模块：首页 `script.js` 的 `Syllables` 音节引擎（`ipaSkeleton` + `buildSyllableMeta`）；Dashboard 已有的「自然拼读 · 音素分布」卡片（Phonics，单双元音 + 辅音）。
> 状态：已确认方案 → 已落地实现（见 `dashboard.{html,js,css}`）。

---

## 1. 背景与目标

项目已有一套**基于英式 IPA 音标的音节引擎**（`script.js` 的 `ipaSkeleton()` + `buildSyllableMeta()`），能把每个单词按发音拆成音节，并用 `V`(元音音素) / `C`(辅音音素) 描述其骨架。首页 `renderSyllableArea` 把它做成了**筛选器**（音节数 chip + 位置 + 16 骨架库 + 开/闭音节/VCe/双元音叠加层），是工具不是图。

**目标**：在 Dashboard 新增一张**独立宽卡片**「音节结构 · Syllables」，把它画成看得懂的图，讲清两件事：
- **单个（构件）**：16 种基础音节骨架本身。
- **搭配（组合）**：多音节单词的骨架串组合（如 `CVC·CV`）。

本期（Phase 2）**仅做音节模块**，与已交付的 Phonics 音素卡（单双元音 + 辅音）相互独立。

## 2. 数据底座（全部复用现有引擎，无新建数据）

- 输入：`data/vocab_entries.json`（22,537 词，与现有卡片同口径） + `data/ipa.json`（662KB，词→英式 IPA）。
- 计算：移植 `script.js` 的 `ipaSkeleton()`，逐词得到 `parts`（每音节骨架数组）与 `label`（如 `CVC.CV`）。
- 覆盖：无本地音标的词跳过，卡片标注「X / 22,537 词有音标可解析」。
- 复用：与首页同口径，保证 Dashboard 与首页筛选一致。

### 2.1 16 种基础音节骨架（按起始辅音数 0/1/2/3 分层）

| 起始辅音 | 尾辅音 0 | 尾辅音 1 | 尾辅音 2 | 尾辅音 3 |
|---|---|---|---|---|
| 0 | V | VC | VCC | VCCC |
| 1 | CV | CVC | CVCC | CVCCC |
| 2 | CCV | CCVC | CCVCC | CCVCCC |
| 3 | CCCV | CCCVC | CCCVCC | CCCVCCC |

### 2.2 其它派生度量

- 音节数分布：1 / 2 / 3 / 4 / 5+ 各多少词。
- 开音节（V 结尾：V/CV/CCV/CCCV）词数、闭音节（C 结尾）词数。
- VCe 魔法-e 词数（词尾 元音+单辅音+e 且发对应长音）。
- 含双元音音素 词数。

## 3. 可视化设计（已落地）

一张 `is-wide` 卡片，自上而下：

### 3.1 顶部 4 个 stat 小条
可解析词数 / 开音节 / 闭音节 / VCe 魔法-e / 含双元音（把叠加维度一眼看到，不占主图空间）。

### 3.2 音节数分布（单个 → 以组合里的小 chip 呈现）
1 / 2 / 3 / 4 / 5+ 五档横向条，回答「这库词平均几个音节、单/多音节占比」。

### 3.3 常见音节组合 · Top 排行（搭配 → 核心）
- 组合会**组合爆炸**（16 骨架拼 1~5+ 音节 → 上千种模式）。策略：**只展头部 + 长尾归并**。
- 取**出现最多的 24 种完整骨架模式**（如 `CVC.CV`、`CV.CVC`、`CVC.CVC`、`VC.CV`…）画横向条形榜；每条的骨架串用**彩色音节 chip** 渲染（每音节一 chip，按起始辅音数 0/1/2/3 着色：紫/青/琥珀/红）。条长 ∝ 词数。
- 剩余低频组合合并成一条灰色「其它 N 种组合 · 共 M 词」，图永远只有约 25 行，不糊。
- **点击下钻**：点某组合 → 卡底展开面板，列出该模式的示例词 + 各组成骨架的计数（呼应自然拼读「音形对应」）。

> 说明：按确认结果，**未单独做「16 骨架矩阵」视图**，16 种骨架以 chip 形式内嵌在组合里（用户选择「直接进组合」）。

## 4. 交互与集成

- 悬停 tooltip（复用 `showTip`）、点击下钻（复用 Phonics 卡展开面板模式）。
- 明暗主题 + 响应式（复用现有 CSS token 与 `is-wide` 栅格；窄屏 stat 改 2 列、组合行收窄）。
- `dashboard.html`：`phonics` 卡之后新增 `data-chart="syllable"` 的 `is-wide` 卡。
- `dashboard.js`：移植 `ipaSkeleton()` / `lastVowelUnit()` / `wordIsVce()` + 新增 `buildSyllableIndex(entries, ipaMap)`（产出 `nsCount` / `skelWords` / 4 stat / `comboCount` / 示例词）+ `drawSyllable()`；`CHART_REGISTRY` 注册 `"syllable"`（内部 `Promise.all` 并行 `loadJSON` 两份数据）。
- `dashboard.css`：追加 `.syl-*` 样式（stat / 分布条 / 组合榜 / chip / 下钻面板）。
- **跨链到首页筛选：不做**（用户确认）。

## 5. 口径约定（与 Phonics 卡一致）

- 语料 = `vocab_entries.json` 剔除短语后的单词，与现有卡片一致。
- 各骨架计数**互相独立**（一个词常同时含多个骨架，占比之和可 >100%）。
- 骨架口径：V=元音音素、C=辅音音素；双元音/塞擦音按单个音素处理。

## 6. 验证结果（实现后）

- 语法检查通过；真实浏览器（无头 Chrome CDP）渲染：4 stat + 5 档音节数分布 + Top 24 组合榜 + 点击下钻展开，0 控制台错误。
- 深色（dashboard 默认）与浅色（IDE 风格）主题均正常。
- 计数与 `script.js` 的 `buildSyllableMeta` 同口径（同一套 `ipaSkeleton`）。

## 7. 待办 / 后续

- （可选）若日后想看「16 骨架矩阵」独立视图，可在本卡增加子视图切换。
- （可选）音节若想与首页筛选联动，可复用首页 `commitSyllable` 能力做跨链。
