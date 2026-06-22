# Vocab Lab Omni

一个功能丰富的英语单词学习工具，支持多词库浏览、自动播放、拼写测试和智能例句。

## 功能特性

### 词库浏览
- 支持多个词库切换（雅思、托福、GRE、朗文等）
- 后缀/前缀过滤，快速定位同类单词
- A-Z 字母索引栏
- 词性筛选（名词、动词、形容词等）
- 卡片/列表两种视图模式
- 分页加载，支持大量词库

### 单词书选择
- 独立选书页面（`book-select.html`）
- 按分类展示所有单词书
- 支持搜索过滤
- 记住上次选择的词库

### 自动播放（Auto Play）
- 自动朗读单词列表
- 可调语速（0.75x ~ 2x）
- 可调间隔时间
- 支持重复播放
- 隐藏单词模式（听音辨词）
- 空格键暂停/继续，左右箭头切换

### 拼写测试（Spelling Mode）
- 听音拼写练习
- 自动判断正误
- 逐字对比高亮
- 显示/隐藏单词辅助
- 统计正确率、错误数、跳过数
- 支持重试错误单词

### 例句系统
- **多来源合并**：AI 生成 + Free Dictionary API + Tatoeba2 + ECDICT
- **来源标记**：💬 口语（粉色）/ 📝 书面（紫色）/ 📗 ECDICT（绿色）/ 🌐 Tatoeba2（蓝色）/ 📘 Dictionary API（黄色）
- **单词高亮**：例句中的目标词用紫色粗体标记
- **Show All 控制**：点击按钮展开/折叠所有例句
- **骨架屏**：API 加载中显示动画占位

### 音标
- 自动加载 IPA 音标（dictionaryapi.dev）
- 本地缓存，减少 API 调用
- IntersectionObserver 懒加载

### 主题
- Material Design 3 风格
- 暗色/亮色主题切换
- 记住用户偏好

### 键盘快捷键（播放模式）
- `空格` 暂停/继续
- `←` 上一个单词
- `→` 下一个单词

### 移动端适配
- 响应式布局
- 底部后缀导航栏（可滑动）
- 滚动时自动隐藏/显示顶栏
- 拼写模式下隐藏字典链接

## 文件结构

```
├── index.html              # 主页面
├── book-select.html        # 单词书选择页面
├── script.js               # 核心逻辑
├── style.css               # 样式表
├── package.json            # 项目配置
├── data/
│   ├── list.json           # 词库列表配置
│   ├── examples.json       # AI 生成例句（492 词）
│   ├── ecdict-examples.json # ECDICT 提取例句
│   ├── stardict.db         # ECDICT SQLite 数据库
│   ├── Suffix_Ref.csv      # 后缀参考数据
│   └── *.csv               # 各词库 CSV 文件
└── scripts/
    └── extract-ecdict.js   # ECDICT 例句提取脚本
```

## 数据来源

| 词库 | 数量 | 说明 |
|------|------|------|
| 雅思系列 | 9 本 | 核心词、词组、考点词等 |
| 托福/SAT/GMAT/GRE | 8 本 | 各类留学考试词汇 |
| 考研/PET/KET | 4 本 | 国内考试词汇 |
| BEC | 2 本 | 商务英语 |
| 牛津/Wordly Wise | 17 本 | 经典词汇教材 |
| 朗文/语料库 | 8 本 | 常用交流词汇 |
| 竞赛/热词 | 4 本 | 英语竞赛词汇 |
| 其他 | 3 本 | 学术词汇等 |

**总计**：55+ 词库，49,500+ 单词



## 技术栈

- 纯 HTML/CSS/JavaScript，无框架依赖
- Material Design 3 设计语言
- dictionaryapi.dev（音标 + 例句）
- Tatoeba2 API（多语言例句）
- ECDICT（本地词典数据）
- IntersectionObserver（懒加载）
- localStorage（缓存 + 偏好存储）
