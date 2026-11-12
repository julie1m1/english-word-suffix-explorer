/* ════════════════════════════════════════════════════════════════
   i18n.js — dashboard2 文案层（唯一的中英词典）

   · 一行三列：[ key, 中文, English ]，两本词典由同一张表生成，不会漏 key
   · t(key, vars) 支持 {n} 之类占位符，数字先算好再传进来
   · dashboard.js 顶部用 var T 取本文件的 t（脚本顺序：i18n.js 必须在 dashboard.js 之前）
   · HTML 静态文案挂 data-i18n / data-i18n-title / data-i18n-placeholder，
     applyStatic() 负责填；语言切换后调用 window.onLangChange()，
     由 dashboard.js 用「主题切换 → 重绘已渲染图表」同一套通道重画
   · 只影响 dashboard2：index.html / book-select.html 不加载本文件
   ════════════════════════════════════════════════════════════════ */
(function (global) {
  "use strict";

  var ROWS = [
    /* ── 通用 ── */
    ["list.sep", "、", ", "],
    ["tip.examples", "示例：", "Examples: "],
    ["tip.entriesPct", "{n} 条 · {pct}%", "{n} entries · {pct}%"],
    ["err.chartLoad", "图表加载失败：", "Chart failed to load: "],
    ["err.empty.coords", "word_coords.json 为空", "word_coords.json is empty"],
    ["err.empty.centers", "cluster_centers.json 为空", "cluster_centers.json is empty"],
    ["err.empty.groups", "cluster_groups.json 为空", "cluster_groups.json is empty"],

    /* ── OOV 说明气泡 ── */
    ["oov.tip",
      '<b>OOV</b>（Out Of Vocabulary · 词表外词）<br>词嵌入模型中找不到对应语义向量的单词：无法进入「单词语义地图」和近义词簇，在语义分类中被归入「其他」类别。',
      '<b>OOV</b> (Out Of Vocabulary)<br>Words the embedding model has no semantic vector for. They cannot appear in the Semantic Map or in the synonym groups, and are filed under "Other" in the semantic classification.'],

    /* ── 词性 ── */
    ["pos.noun", "名词", "Noun"],
    ["pos.verb", "动词", "Verb"],
    ["pos.adj", "形容词", "Adjective"],
    ["pos.adv", "副词", "Adverb"],
    ["pos.pron", "代词", "Pronoun"],
    ["pos.det", "限定词", "Determiner"],
    ["pos.prep", "介词", "Preposition"],
    ["pos.conj", "连词", "Conjunction"],
    ["pos.interj", "感叹词", "Interjection"],
    ["pos.num", "数词", "Numeral"],
    ["pos.other", "其他", "Other"],
    ["pos.centerName", "{label} {key}", "{label}"],
    ["pos.centerCount", "{n} 次计入", "{n} counts"],
    ["pos.tipLine", "{n} 次计入 · {pct}%", "{n} counts · {pct}%"],
    ["pos.foot",
      "一个词若有多个词性会分别计数，所以总次数会多于单词数。<br>仅单词 {w} 个（短语不计入），共 {total} 次计入；另有 {unknown} 个词性未能识别的词未纳入。",
      "A word with several parts of speech is counted once under each one, so the total number of counts is larger than the number of words.<br>Words only: {w} of them (phrases are not counted), {total} counts in total. {unknown} words have no part of speech we could recognise and are left out."],

    /* ── 单词长度 ── */
    ["len.modeWord", "单词", "Words"],
    ["len.modeAll", "全部（含短语）", "All (with phrases)"],
    ["len.title15", "15 个字母及以上", "15 letters or more"],
    ["len.titleN", "{k} 个字母", "{k} letters"],
    ["len.footWord", "仅单词 {n} 条，短语不计。", "Words only: {n} entries, phrases excluded."],
    ["len.footAll",
      "全部 {n} 条，短语按含空格总长度计算；因此 15+ 桶会被拉高。",
      "All {n} entries; a phrase is measured by its full length including spaces, which pushes the 15+ bucket up."],
    ["len.footAxis",
      "<br>横轴为字母数，≥15 合并为一栏以避免长尾。",
      "<br>The axis is the number of letters; 15 and above are merged into one bucket so the long tail does not crowd the chart."],

    /* ── 首字母 ── */
    ["ini.tipTitle", "{c} 开头", "Starts with {c}"],
    ["ini.tipShare", "占全部 {total} 条的 {pct}%", "{pct}% of all {total} entries"],
    ["ini.foot",
      "A–Z 横向排列，柱高正比于该字母开头的词条数；已剔除非 [a-z] 开头 {dropped} 条，实际计入 {counted} / {total} 条。",
      "A–Z from left to right; bar height is proportional to how many entries start with that letter. {dropped} entries that do not start with [a-z] are dropped, so {counted} of {total} entries are counted."],

    /* ── n-gram 热力图 ── */
    ["ng.low", "少", "Low"],
    ["ng.high", "多", "High"],
    ["ng.tipLine", "{n} 词 · 占全部组合 {pct}%", "{n} words · {pct}% of all pairs"],
    ["ng.note",
      " · 横轴是出现最多的 {cols} 种「开头 3 字母」、纵轴是 {rows} 种「结尾 3 字母」；仅统计单词，共 {total} 个词参与。",
      " · Columns are the {cols} most common 3-letter openings, rows are the {rows} most common 3-letter endings; words only, {total} words take part."],

    /* ── 自然拼读 ── */
    ["ph.sectionVowels", "单双元音", "Vowels"],
    ["ph.sectionConsonants", "辅音", "Consonants"],
    ["ph.longVowel", "长元音", "Long vowels"],
    ["ph.shortVowel", "短元音", "Short vowels"],
    ["ph.diphthong", "双元音", "Diphthongs"],
    ["ph.voiceless", "清辅音", "Voiceless"],
    ["ph.voiced", "浊辅音", "Voiced"],
    ["ph.semiVoiced", "半浊辅音", "Semi-voiced"],
    ["ph.semivowel", "半元音", "Semivowels"],
    ["ph.nasal", "鼻音", "Nasals"],
    ["ph.lateral", "边音", "Laterals"],
    ["ph.foot",
      "仅单词 {n} 条，短语不计。每条 = 含该发音拼写组合的单词数（去重）；同一单词常同时含多个音，各音计数互相独立，故占比之和可 &gt; 100%。<br>元音段剔除裸单字母 a/e/i/o/u（几乎每词都有、无区分度），仅保留有辨识度的拼写；辅音段保留全部拼写。",
      "Words only: {n} entries, phrases excluded. Each bar counts the words that contain any spelling of that sound. One word usually contains several sounds and every sound is counted on its own, so the percentages can add up to more than 100%.<br>In the vowel section the bare letters a/e/i/o/u are dropped — almost every word has them, so they say nothing; only the distinctive spellings are kept. The consonant section keeps every spelling."],

    /* ── 音节 ── */
    ["syl.parsed", "可解析词", "Parseable"],
    ["syl.parsedSub", "共 {n} 词", "of {n} words"],
    ["syl.openStat", "开音节", "Open"],
    ["syl.openSub", "{pct} 元音结尾", "{pct} end in a vowel"],
    ["syl.closedStat", "闭音节", "Closed"],
    ["syl.closedSub", "{pct} 辅音结尾", "{pct} end in a consonant"],
    ["syl.vceStat", "VCe 魔法-e", "VCe magic-e"],
    ["syl.vceSub", "词尾 e 不发音", "silent final e"],
    ["syl.diphStat", "含双元音", "Has a diphthong"],
    ["syl.typeOpen", "开音节", "Open"],
    ["syl.typeClosed", "闭音节", "Closed"],
    ["syl.comboTitle", "常见音节组合 · Top {n}", "Common syllable patterns · Top {n}"],
    ["syl.legendOpen", "实心主色＝开音节（元音结尾，读长音）", "Filled = open syllable (ends in a vowel, read long)"],
    ["syl.legendClosed", "浅底主色字＝闭音节（辅音结尾，读短音）", "Light fill = closed syllable (ends in a consonant, read short)"],
    ["syl.skelOrd", "第 {i} 音节", "Syllable {i}"],
    ["syl.skelEx", "开头 {onset}，元音 V，结尾 {coda}", "onset {onset}, vowel V, coda {coda}"],
    ["syl.none", "无", "none"],
    ["syl.detailTitle",
      "逐音节拆解 · {parts} 音节 · 本组合 {n} 词（每行的骨架就是该行位置）",
      "Syllable by syllable · {parts} syllables · {n} words follow this pattern (each row is that position)"],
    ["syl.tail", "其它 {n} 种组合", "{n} other patterns"],
    ["syl.nsTitle", "音节数分布", "Distribution by syllable count"],
    ["syl.ns1", "1 音节", "1"],
    ["syl.ns2", "2 音节", "2"],
    ["syl.ns3", "3 音节", "3"],
    ["syl.ns4", "4 音节", "4"],
    ["syl.ns5", "5+ 音节", "5+"],
    ["syl.foot",
      "词库 {n} 词，其中 {parsed} 词有本地音标且可解析为音节骨架（其余无音标、不参与）。骨架用 V=元音音素、C=辅音音素描述每个音节，如 CVC=辅-元-辅；组合 = 多音节的骨架串（· 连接，如 CVC·CV）。同一单词可计入多个骨架（各骨架独立计数，占比之和可 &gt; 100%）。",
      "{n} words in the library, of which {parsed} have a local phonetic transcription and can be parsed into a syllable skeleton (the rest have none and are left out). A skeleton describes each syllable with V for the vowel sound and C for a consonant sound, e.g. CVC = consonant-vowel-consonant; a pattern is the skeletons of a word's syllables joined by · (e.g. CVC·CV). One word can count under several skeletons, each counted on its own, so the percentages can add up to more than 100%."],

    /* ── 语义地图 ── */
    ["sm.tile", "平铺", "Tiles"],
    ["sm.scatter", "散点", "Scatter"],
    ["sm.searchPh", "搜索簇名 / 编号（不搜单词）", "Search cluster names / numbers (words are not searched)"],
    ["sm.all", "全选", "All"],
    ["sm.none", "清空", "Clear"],
    ["sm.reset", "重置视图", "Reset view"],
    ["sm.hudTile",
      "平铺：每格一词 · 悬停查看词条 · 点击簇标签锁定高亮，再点取消",
      "Tiles: one word per cell · hover to read a word · click a cluster label to lock the highlight, click again to release"],
    ["sm.hudScatter",
      "滚轮缩放 · 拖拽平移 · 悬停查看词条 · 点击簇标签锁定高亮",
      "Scroll to zoom · drag to pan · hover to read a word · click a cluster label to lock the highlight"],
    ["sm.oovHidden", "{n} 个词未显示（暂无语义向量）", "{n} words are not shown (no semantic vector yet)"],
    ["sm.info",
      "显示 {shown} / {n} 词 · {on}/{all} 簇",
      "Showing {shown} of {n} words · {on}/{all} clusters"],

    /* ── 簇（语义地图 / 近义词分组共用） ── */
    ["cluster.name", "簇 {c}", "Cluster {c}"],
    ["cluster.unclustered", "未成簇", "Unclustered"],
    ["cluster.tagId", " · 簇 {c}", " · cluster {c}"],
    ["cluster.tipLine", "{n} 词 · 占全量 {pct}%", "{n} words · {pct}% of all"],
    ["cluster.reps", "代表词：", "Sample words: "],
    ["cg.sub", "{g} 组 · {w} 词", "{g} groups · {w} words"],
    ["cg.unitWords", " 词", " words"],
    ["cg.unitClusters", " 簇", " clusters"],

    /* ── 派生词树 ── */
    ["wd.noMeaning", "暂无中文释义", "No meaning yet"],
    ["derive.note",
      "共 <b>{n}</b> 个派生词（去重）· 可选词根 {c} 个 · 颜色＝派生方式（图例在右上）· 树状图：悬停看释义与音标、单击听发音、双击换词根；列表：点「设为词根」",
      "<b>{n}</b> derived words in total (duplicates merged) · {c} words can serve as a root · colour = how the word is derived (legend at the top right) · Tree: hover for meaning and phonetics, click to hear it, double-click to switch root; List: use “Set as root”"],
    ["derive.listHead", "词根列表", "Root list"],
    ["derive.depthOut", "收回深度 1", "Back to depth 1"],
    ["derive.depthIn", "展开到深度 2", "Expand to depth 2"],
    ["derive.depthTip", "收回只看到第一层派生", "Collapse: show only the first level of derivatives"],
    ["derive.segTree", "树状图", "Tree"],
    ["derive.segList", "列表", "List"],
    ["derive.segTreeTip", "径向树图：看派生关系", "Radial tree: see how words are derived from each other"],
    ["derive.segListTip", "列表视图：一行一词，便于对比", "List view: one word per row, easy to compare"],
    ["derive.pre", "加前缀", "Prefix"],
    ["derive.suf", "加后缀", "Suffix"],
    ["derive.both", "前后缀都加", "Both"],
    ["derive.collapsed", "折叠 / 未展开", "Collapsed"],
    ["derive.path", "派生路径", "Derivation path"],
    ["derive.stemRow", "词根：<b>{w}</b>", "Root: <b>{w}</b>"],
    ["derive.dblRoot", "双击以此为词根", "Double-click to use this word as the root"],
    ["derive.setRoot", "设为词根", "Set as root"],
    ["derive.setRootTip", "以该词为词根重绘", "Redraw with this word as the root"],
    ["derive.badgePre", "加前缀 ", "prefix "],
    ["derive.badgeSuf", "加后缀 ", "suffix "],
    ["derive.moreHidden",
      "还有 {n} 个派生未显示（单根最多 {cap} 条）",
      "{n} more derivatives are hidden (at most {cap} per root)"],

    /* ── 词缀弦图 ── */
    ["chord.tipHits", "{n} 个词同时命中", "{n} words have both"],
    ["chord.kindPre", "前缀", "prefix"],
    ["chord.kindSuf", "后缀", "suffix"],
    ["chord.tipMatch", "命中 {n} 词", "{n} words match"],
    ["chord.foot",
      "圆环左半是出现最多的 {pre} 个前缀、右半是 {suf} 个后缀；一段弧线连接一对前后缀，线越粗代表同时带这对前后缀的词越多。<br>全部前后缀组合共 {pairs} 种，这里展示最主要 {shown} 条。",
      "The left half of the ring is the {pre} most common prefixes, the right half the {suf} most common suffixes; one ribbon links a prefix with a suffix, and the thicker it is the more words carry that pair.<br>{pairs} prefix-suffix pairs exist in total; the {shown} most common ones are drawn."],

    /* ── 页面静态文案（dashboard2.html） ── */
    ["page.title", "Vocab Lab Omni · 数据看板", "Vocab Lab Omni · Stats"],
    ["page.heroSub",
      "一整页看清整个词库：有多大、单词长什么样、读起来什么样、词与词之间又是什么关系。点下面的模块直接跳到那张图。",
      "One page for the whole library — how big it is, what the words look like, how they sound and how they relate to one another. Pick a module below to jump straight to it."],
    ["page.statTotal", "总词条", "Total entries"],
    ["page.statOov", "OOV", "OOV"],
    ["page.statPhrase", "短语", "Phrases"],
    ["page.statCoverage", "覆盖率", "Coverage"],
    ["page.oovAria", "什么是 OOV？", "What is OOV?"],
    ["page.back", "返回单词浏览", "Back to word browser"],
    ["page.shelf", "词库书架", "Word shelf"],
    ["page.theme", "切换主题", "Toggle theme"],
    ["page.toDark", "切换到深色", "Switch to Dark"],
    ["page.toLight", "切换到浅色", "Switch to Light"],
    ["page.lang", "切换语言", "Switch language"],
    ["page.charts", "图表", "Charts"],
    ["nav.pos", "词性分布", "Parts of Speech"],
    ["nav.len", "单词长度", "Word Length"],
    ["nav.ini", "首字母", "First Letters"],
    ["nav.umap", "语义地图", "Semantic Map"],
    ["nav.derive", "派生词树", "Derivative Tree"],
    ["nav.chord", "词缀搭配", "Affix Chord"],
    ["nav.ngram", "首尾字母组合", "N-gram Heatmap"],
    ["nav.phonics", "自然拼读", "Phonics"],
    ["nav.syl", "音节结构", "Syllables"],
    ["card.posTitle", "词性分布", "Parts of Speech"],
    ["card.posNote", "仅统计单词（不含短语）· 悬停扇区看该词性的数量与示例词",
      "Words only (phrases excluded) · hover a slice to see its count and sample words"],
    ["card.lenTitle", "单词长度分布", "Word Length"],
    ["card.lenNote", "按字母个数统计，15 个字母及以上并入一栏 · 上方可切「单词 / 全部（含短语）」",
      "Counted by number of letters, 15 and above merged into one bucket · switch between Words / All (with phrases) above"],
    ["card.iniTitle", "首字母分布", "First Letters"],
    ["card.iniNote", "以 26 个字母开头的单词数，柱子越高代表越多 · 悬停柱子看该字母的词数与占比",
      "How many words start with each of the 26 letters — the taller the bar, the more · hover a bar for its count and share"],
    ["card.umapTitle", "单词语义地图", "Semantic Map"],
    ["card.umapNote", "21,612 词的语义嵌入 · 平铺看全量、散点看邻近 · 悬停看词条，点右侧簇标签锁定高亮",
      "Semantic embeddings for 21,612 words · tiles show the whole set, scatter shows neighbours · hover a word, click a cluster label on the right to lock the highlight"],
    ["card.cgTitle", "近义词分组", "Synonym Groups"],
    ["card.cgNote", "按语义域分 9 大类 · 组内标签按词数缩放 · 悬停可在「单词语义地图」里同步高亮",
      "9 semantic domains · each label is sized by its word count · hovering also highlights it in the Semantic Map"],
    ["card.deriveTitle", "派生词树", "Derivative Tree"],
    ["card.deriveNote", "从词根长出派生词：悬停看释义与音标，单击听发音，双击换词根；列表视图改点「设为词根」",
      "Derivatives grow from a root: hover for meaning and phonetics, click to hear it, double-click to switch root; in list view use “Set as root”"],
    ["card.chordTitle", "前缀后缀搭配图", "Affix Chord"],
    ["card.chordNote", "前缀与后缀同时出现的频率，连线越粗代表越多 · 悬停弧线看这对组合的词数与示例",
      "How often a prefix and a suffix appear together — the thicker the line, the more words · hover a ribbon for that pair's count and sample words"],
    ["card.ngramTitle", "单词首尾字母组合", "N-gram Heatmap"],
    ["card.ngramNote", "统计单词开头 3 个字母与结尾 3 个字母的常见搭配，颜色越深越常见 · 悬停格子看词数与示例",
      "Common combinations of the first 3 and last 3 letters of a word — the darker the cell, the more common · hover a cell for its count and sample words"],
    ["card.phonicsTitle", "自然拼读 · 音素分布", "Phonics"],
    ["card.phonicsNote", "单双元音 + 辅音：条越长＝含该音的单词越多 · 悬停音条即在下方展开拼写组合，点击钉住",
      "Vowels + consonants: the longer the bar, the more words contain that sound · hover a bar to expand its spellings underneath, click to keep it open"],
    ["card.sylTitle", "音节结构", "Syllables"],
    ["card.sylNote", "按发音把单词拆成音节骨架（V=元音、C=辅音）· 悬停组合条即在下方逐音节拆解，点击钉住",
      "Words split into a syllable skeleton by sound (V = vowel, C = consonant) · hover a pattern to break it down syllable by syllable, click to keep it open"],
  ];

  var zh = {}, en = {};
  for (var r = 0; r < ROWS.length; r++) {
    zh[ROWS[r][0]] = ROWS[r][1];
    en[ROWS[r][0]] = ROWS[r][2];
  }
  var DICT = { zh: zh, en: en };

  var lang = "en";

  function stored() {
    try {
      var v = localStorage.getItem("vocab-lang");
      return v === "zh" || v === "en" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function t(key, vars) {
    var s = DICT[lang][key];
    if (s == null) s = DICT.zh[key];
    if (s == null) return key;
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] == null ? m : String(vars[name]);
    });
  }

  /* 静态文案：textContent / title / placeholder / aria-label 四种挂载点 */
  var ATTRS = [
    ["data-i18n", function (n, s) { n.textContent = s; }],
    ["data-i18n-html", function (n, s) { n.innerHTML = s; }],
    ["data-i18n-title", function (n, s) { n.setAttribute("title", s); }],
    ["data-i18n-aria", function (n, s) { n.setAttribute("aria-label", s); }],
    ["data-i18n-placeholder", function (n, s) { n.setAttribute("placeholder", s); }],
  ];
  function applyStatic() {
    ATTRS.forEach(function (a) {
      var list = document.querySelectorAll("[" + a[0] + "]");
      for (var i = 0; i < list.length; i++) a[1](list[i], t(list[i].getAttribute(a[0])));
    });
    document.title = t("page.title");
    syncButtons();
  }

  function syncButtons() {
    var list = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < list.length; i++) {
      list[i].classList.toggle("is-on", list[i].getAttribute("data-lang-btn") === lang);
    }
  }

  function setLang(next) {
    if (next !== "zh" && next !== "en") return;
    if (next === lang) return;
    lang = next;
    try {
      localStorage.setItem("vocab-lang", lang);
    } catch (e) {}
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    applyStatic();
    /* 图表重绘走 dashboard.js 已有的「主题切换 → 重画已渲染图」通道 */
    if (typeof global.onLangChange === "function") global.onLangChange();
  }

  global.t = t;
  global.i18n = {
    t: t,
    getLang: function () { return lang; },
    setLang: setLang,
    applyStatic: applyStatic,
  };

  lang = stored() || "en";
  document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");

  function bind() {
    var list = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < list.length; i++) {
      list[i].addEventListener("click", function (ev) {
        setLang(ev.currentTarget.getAttribute("data-lang-btn"));
      });
    }
    applyStatic();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})(window);
