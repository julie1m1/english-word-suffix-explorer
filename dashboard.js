/* ══════════════════════════════════════════════════════
   dashboard.js — Vocab Lab Omni · Stats 仪表盘
   Step 1 (当前)：静态骨架 / 硬编码 5 段数字
   Step 2 (待办)：fetch 数据 → 真实计算 5 个数字
   Step 3 (待办)：覆盖率阈值联动 / 数字刷新 / 9 张可视化
   ══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════
     ICONS — 与 index.html 保持一致的太阳/月亮
  ══════════════════════════════════════════════════════ */
  const ICONS = {
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.272-2.597.767-3.75-.813.381-1.533.938-2.13 1.634a9.75 9.75 0 1 0 12.743 12.744c.695-.597 1.252-1.318 1.632-2.13Z"/></svg>',
  };

  /* ══════════════════════════════════════════════════════
     THEME — 跟随主页 localStorage('vocab-theme')
  ══════════════════════════════════════════════════════ */
  const themeBtn = document.getElementById("dashThemeToggle");

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("vocab-theme", t);
    if (themeBtn) {
      themeBtn.innerHTML = t === "light" ? ICONS.moon : ICONS.sun;
      themeBtn.title = t === "light" ? "Switch to Dark" : "Switch to Light";
    }
  }
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }
  function toggleTheme() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }

  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // 支持 ?theme=light / ?theme=dark 强制指定（测试用）
  const urlTheme = new URLSearchParams(location.search).get("theme");
  if (urlTheme === "light" || urlTheme === "dark") {
    applyTheme(urlTheme);
  } else {
    applyTheme(localStorage.getItem("vocab-theme") || "dark");
  }

  /* ══════════════════════════════════════════════════════
     DOM 引用
  ══════════════════════════════════════════════════════ */
  const els = {
    total: document.getElementById("statTotal"),
    oov: document.getElementById("statOov"),
    phrase: document.getElementById("statPhrase"),
    coverage: document.getElementById("statCoverage"),
    coverageSeg: document.querySelector('[data-key="coverage"]'),
  };

  /* ══════════════════════════════════════════════════════
     FORMATTING HELPERS
  ══════════════════════════════════════════════════════ */
  function fmtNum(n) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("en-US");
  }
  function fmtPct(n) {
    if (n == null || isNaN(n)) return "—";
    return (Math.round(n * 10) / 10).toFixed(1) + "%";
  }
  function setCoverageTier(pct) {
    if (!els.coverageSeg) return;
    let tier = "red";
    if (pct >= 80) tier = "green";
    else if (pct >= 60) tier = "yellow";
    els.coverageSeg.setAttribute("data-tier", tier);
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  function renderStats(stats) {
    if (!stats) return;
    if (stats.total != null) els.total.textContent = fmtNum(stats.total);
    if (stats.oov != null) els.oov.textContent = fmtNum(stats.oov);
    if (stats.phrase != null) els.phrase.textContent = fmtNum(stats.phrase);
    if (stats.coveragePct != null) {
      els.coverage.textContent = fmtPct(stats.coveragePct);
      setCoverageTier(stats.coveragePct);
    }
  }

  /* ══════════════════════════════════════════════════════
     STEP 1 — 硬编码演示数据（来源 README 总计）
     Step 2 替换为 fetch + 真实解析
  ══════════════════════════════════════════════════════ */
  function loadInitial() {
    const TOTAL = 38617;
    const PHRASE = 17062;
    const WORDS = TOTAL - PHRASE;
    const VECTOR = 20849;
    const OOV = 706;
    const COV_PCT = (VECTOR / WORDS) * 100;

    renderStats({
      total: TOTAL,
      oov: OOV,
      phrase: PHRASE,
      coveragePct: COV_PCT,
    });

    console.info("[Dashboard] Step 1 skeleton loaded — hardcoded stats.");
  }

  /* ══════════════════════════════════════════════════════
     TOOLTIP — 全局单例，所有图表共用
  ══════════════════════════════════════════════════════ */
  const tip = { el: null };

  function ensureTip() {
    if (!tip.el) {
      tip.el = document.createElement("div");
      tip.el.className = "dash-tip";
      document.body.appendChild(tip.el);
    }
    return tip.el;
  }

  /** 显示提示：html 字符串 + 锚点坐标（屏幕坐标） */
  function showTip(html, x, y) {
    const el = ensureTip();
    el.innerHTML = html;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.classList.add("is-on");
  }
  function hideTip() {
    if (tip.el) tip.el.classList.remove("is-on");
  }

  /* ══════════════════════════════════════════════════════
     HOVER BUS — 跨图联动（PRD §4 通用要求）
     后续每张图 register 进来即可互相高亮
  ══════════════════════════════════════════════════════ */
  const hoverBus = {
    handlers: [],
    last: null,
    timer: null,
    register(fn) {
      this.handlers.push(fn);
    },
    emit(payload) {
      const now = Date.now();
      const emitNow = () => {
        this.last = payload;
        this.handlers.forEach((fn) => {
          try {
            fn(payload);
          } catch (e) {
            /* 单张图出错不影响其他图 */
          }
        });
      };
      // throttle 50ms：最后一次一定会发出（trailing）
      if (payload && payload.immediate) {
        clearTimeout(this.timer);
        emitNow();
        return;
      }
      clearTimeout(this.timer);
      this.timer = setTimeout(emitNow, 50);
    },
  };

  /* ══════════════════════════════════════════════════════
     数据层：单一 fetch，多图共享
  ══════════════════════════════════════════════════════ */
  const cache = {};
  function loadJSON(path) {
    if (!cache[path]) {
      cache[path] = fetch(path).then((r) => {
        if (!r.ok) throw new Error(path + " → HTTP " + r.status);
        return r.json();
      });
    }
    return cache[path];
  }

  /* ══════════════════════════════════════════════════════
     ② 词性分布 Donut
  ══════════════════════════════════════════════════════ */
  const POS_ORDER = [
    "noun", "verb", "adj", "adv", "pron", "det",
    "prep", "conj", "interj", "num", "other",
  ];
  const POS_LABEL = {
    noun: "名词", verb: "动词", adj: "形容词", adv: "副词",
    pron: "代词", det: "限定词", prep: "介词", conj: "连词",
    interj: "感叹词", num: "数词", other: "其他",
  };
  // 列表视图用词性缩写（不翻译中文）：n / v / adj / adv ...
  const POS_ABBR = {
    noun: "n", verb: "v", adj: "adj", adv: "adv",
    pron: "pron", det: "det", prep: "prep", conj: "conj",
    interj: "int", num: "num", other: "·",
  };
  const POS_COLOR = (k) => "var(--pos-" + k + ")";

  /** 生成环形扇区 path（原生 SVG，无外部依赖） */
  function arcPath(cx, cy, rOut, rIn, a0, a1) {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const [x0, y0] = pt(rOut, a0);
    const [x1, y1] = pt(rOut, a1);
    const [x2, y2] = pt(rIn, a1);
    const [x3, y3] = pt(rIn, a0);
    return (
      "M" + x0 + "," + y0 +
      "A" + rOut + "," + rOut + " 0 " + large + " 1 " + x1 + "," + y1 +
      "L" + x2 + "," + y2 +
      "A" + rIn + "," + rIn + " 0 " + large + " 0 " + x3 + "," + y3 + "Z"
    );
  }

  function aggregatePos(payload) {
    const words = payload.words || {};
    const counts = Object.create(null);
    const samples = Object.create(null);
    let multi = 0;

    for (const w in words) {
      const tags = words[w];
      if (!tags || !tags.length) continue;
      if (tags.length > 1) multi++;
      tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
        if (!samples[t]) samples[t] = [];
        if (samples[t].length < 5) samples[t].push(w);
      });
    }

    const rows = POS_ORDER.filter((k) => counts[k] > 0).map((k) => ({
      key: k,
      label: POS_LABEL[k] || k,
      count: counts[k],
      samples: samples[k] || [],
    }));
    // PRD 未列出的兜底 key（理论上不会有）
    Object.keys(counts).forEach((k) => {
      if (POS_ORDER.indexOf(k) === -1) {
        rows.push({ key: k, label: k, count: counts[k], samples: samples[k] || [] });
      }
    });

    const totalTags = rows.reduce((s, r) => s + r.count, 0);
    rows.forEach((r) => {
      r.pct = totalTags ? (r.count / totalTags) * 100 : 0;
    });
    return { rows, totalTags, multi, meta: payload.meta || {} };
  }

  function drawPosDonut(body, agg) {
    const SIZE = 160, CX = 80, CY = 80, R_OUT = 74, R_IN = 46;
    const PAD = 0.012; // 扇区间缝隙（弧度）

    body.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "donut-wrap";
    body.appendChild(wrap);

    // ── SVG 环形 ──
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "donut-svg");
    svg.setAttribute("width", SIZE);
    svg.setAttribute("height", SIZE);
    svg.setAttribute("viewBox", "0 0 " + SIZE + " " + SIZE);
    wrap.appendChild(svg);

    const total = agg.totalTags;
    let angle = -Math.PI / 2; // 12 点起笔
    const slices = [];

    agg.rows.forEach((r) => {
      const span = (r.count / total) * Math.PI * 2;
      const pad = Math.min(PAD, span / 4);
      const a0 = angle + pad;
      const a1 = angle + span - pad;
      angle += span;

      const p = document.createElementNS(NS, "path");
      p.setAttribute("class", "donut-slice");
      p.setAttribute("d", arcPath(CX, CY, R_OUT, R_IN, a0, a1));
      p.setAttribute("fill", POS_COLOR(r.key));
      svg.appendChild(p);
      slices.push({ node: p, row: r, mid: (a0 + a1) / 2 });
    });

    // ── 圆心文字 ──
    const mkText = (cls, y, txt) => {
      const t = document.createElementNS(NS, "text");
      t.setAttribute("class", cls);
      t.setAttribute("x", CX);
      t.setAttribute("y", y);
      t.textContent = txt;
      svg.appendChild(t);
      return t;
    };
    const tMain = mkText("donut-center-main", CY - 4, "");
    const tVal = mkText("donut-center-val", CY + 14, "");
    const tSub = mkText("donut-center-sub", CY + 30, "");

    function setCenter(row) {
      if (!row) return;
      tMain.textContent = row.pct.toFixed(1) + "%";
      tVal.textContent = row.label + " " + row.key;
      tSub.textContent = fmtNum(row.count) + " 次计入";
    }
    const topRow = agg.rows.slice().sort((a, b) => b.count - a.count)[0];
    setCenter(topRow);

    // ── 右侧 legend ──
    const legend = document.createElement("div");
    legend.className = "donut-legend";
    wrap.appendChild(legend);

    const legendRows = [];
    agg.rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "legend-row";
      row.innerHTML =
        '<span class="legend-dot" style="background:' + POS_COLOR(r.key) + '"></span>' +
        '<span class="legend-name">' + r.label + "</span>" +
        '<span class="legend-num">' + fmtNum(r.count) + "</span>" +
        '<span class="legend-pct">' + r.pct.toFixed(1) + "%</span>";
      legend.appendChild(row);
      legendRows.push({ node: row, row: r });
    });

    // ── 联动：切片 ↔ legend 高亮 ──
    function focus(key) {
      slices.forEach((s) => s.node.classList.toggle("is-dim", key && s.row.key !== key));
      legendRows.forEach((l) => l.node.classList.toggle("is-active", key && l.row.key === key));
      const hit = key ? agg.rows.find((r) => r.key === key) : topRow;
      setCenter(hit);
    }
    function blur() {
      slices.forEach((s) => s.node.classList.remove("is-dim"));
      legendRows.forEach((l) => l.node.classList.remove("is-active"));
      setCenter(topRow);
    }

    function tipHTML(r) {
      const ex = r.samples.length
        ? r.samples.map((w) => "<b>" + w + "</b>").join("、")
        : "—";
      return (
        "<div><b>" + r.label + " " + r.key + "</b></div>" +
        "<div>" + fmtNum(r.count) + " 次计入 · " + r.pct.toFixed(1) + "%</div>" +
        '<div style="margin-top:4px;color:var(--text-2)">示例：' + ex + "</div>"
      );
    }

    slices.forEach((s) => {
      s.node.addEventListener("mouseenter", (ev) => {
        focus(s.row.key);
        hoverBus.emit({ type: "pos", key: s.row.key, words: s.row.samples });
        showTip(tipHTML(s.row), ev.clientX, ev.clientY);
      });
      s.node.addEventListener("mousemove", (ev) => {
        showTip(tipHTML(s.row), ev.clientX, ev.clientY);
      });
      s.node.addEventListener("mouseleave", () => {
        blur();
        hoverBus.emit(null);
        hideTip();
      });
    });

    legendRows.forEach((l) => {
      l.node.addEventListener("mouseenter", () => {
        focus(l.row.key);
        hoverBus.emit({ type: "pos", key: l.row.key, words: l.row.samples });
      });
      l.node.addEventListener("mouseleave", () => {
        blur();
        hoverBus.emit(null);
      });
    });

    // ── 脚注：口径说明 + unknown ──
    const foot = document.createElement("p");
    foot.className = "donut-footnote";
    const m = agg.meta;
    foot.innerHTML =
      "说明：一个词若有多个词性会分别计数，所以总次数会多于单词数。" +
      '<br>本图只统计单词（短语不计入），另有 ' + fmtNum(m.unknown || 0) + " 个词性未能识别的词未纳入。";
    body.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════
     DOM 小工具
  ══════════════════════════════════════════════════════ */
  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  const TRIGRAM_RE = /^[a-z]{3}$/;

  function topN(obj, n) {
    return Object.keys(obj)
      .sort((a, b) => obj[b] - obj[a] || (a < b ? -1 : 1))
      .slice(0, n);
  }

  /* ══════════════════════════════════════════════════════
     语料索引 — ③④⑨ 共用，一次扫描算出全部口径
  ══════════════════════════════════════════════════════ */
  let corpusCache = null;

  function buildCorpus(payload) {
    if (corpusCache) return corpusCache;
    const t0 = (window.performance || Date).now();
    const entries = payload.entries || [];
    const words = entries.filter((w) => w.indexOf(" ") === -1);

    // ── ③ 长度分布：word / all 两套口径
    const len = { word: {}, all: {} };
    const lenEx = { word: {}, all: {} };
    function bumpLen(w, mode) {
      const k = Math.min(w.length, 15); // ≥15 合并
      len[mode][k] = (len[mode][k] || 0) + 1;
      const arr = lenEx[mode][k] || (lenEx[mode][k] = []);
      if (arr.length < 3) arr.push(w);
    }
    words.forEach((w) => bumpLen(w, "word"));
    entries.forEach((w) => bumpLen(w, "all"));

    // ── ④ 首字母：只留 [a-z] 开头
    const initials = {};
    entries.forEach((w) => {
      const c = w[0];
      if (c >= "a" && c <= "z") initials[c] = (initials[c] || 0) + 1;
    });

    // ── ⑨ n-gram：前 3 字母 × 后 3 字母，跳过短语与含非字母的组合
    const pre = {}, suf = {}, cell = {};
    let ngramTotal = 0;
    words.forEach((w) => {
      if (w.length < 3) return;
      const p = w.slice(0, 3), s = w.slice(-3);
      if (!TRIGRAM_RE.test(p) || !TRIGRAM_RE.test(s)) return;
      pre[p] = (pre[p] || 0) + 1;
      suf[s] = (suf[s] || 0) + 1;
      const key = p + "|" + s;
      const c = cell[key] || (cell[key] = { n: 0, ex: [] });
      c.n++;
      if (c.ex.length < 5) c.ex.push(w);
      ngramTotal++;
    });
    const NG = 20;
    const topPre = topN(pre, NG);
    const topSuf = topN(suf, NG);

    corpusCache = {
      meta: payload.meta || {},
      totalEntries: entries.length,
      totalWords: words.length,
      totalPhrases: entries.length - words.length,
      entries: entries,
      words: words,
      len, lenEx,
      initials,
      ngram: { pre, suf, cell, topPre, topSuf, total: ngramTotal },
      _ms: Math.round(((window.performance || Date).now()) - t0),
    };
    console.info("[Dashboard] corpus index built in " + corpusCache._ms + "ms");
    return corpusCache;
  }

  /* ══════════════════════════════════════════════════════
     ③ 单词长度分布（横向柱状）
  ══════════════════════════════════════════════════════ */
  function drawLenBars(body, corpus) {
    let mode = "word";

    body.innerHTML = "";
    const toggle = el("div", "mini-toggle");
    const btnWord = el("button", "mini-toggle-btn is-on", "单词");
    const btnAll = el("button", "mini-toggle-btn", "全部（含短语）");
    btnWord.dataset.mode = "word";
    btnAll.dataset.mode = "all";
    toggle.appendChild(btnWord);
    toggle.appendChild(btnAll);
    body.appendChild(toggle);

    const bars = el("div", "bars");
    body.appendChild(bars);

    const foot = el("p", "donut-footnote");
    body.appendChild(foot);

    function render() {
      const hist = corpus.len[mode];
      const ex = corpus.lenEx[mode];
      const keys = [];
      for (let i = 1; i <= 15; i++) if (hist[i]) keys.push(i);
      const total = keys.reduce((s, k) => s + hist[k], 0);
      const max = Math.max.apply(null, keys.map((k) => hist[k]));

      bars.innerHTML = "";
      keys.forEach((k) => {
        const row = el("div", "bar-row");
        row.dataset.k = k;
        const pct = (hist[k] / max) * 100;
        row.innerHTML =
          '<span class="bar-lab">' + (k === 15 ? "15+" : k) + "</span>" +
          '<div class="bar-track"><i class="bar-fill" style="width:' + pct + '%"></i></div>' +
          '<span class="bar-val">' + fmtNum(hist[k]) + "</span>";

        const samples = (ex[k] || []).map((w) => "<b>" + w + "</b>").join("、") || "—";
        const tipHTML =
          "<div><b>" + (k === 15 ? "15 个字母及以上" : k + " 个字母") + "</b></div>" +
          "<div>" + fmtNum(hist[k]) + " 条 · " + ((hist[k] / total) * 100).toFixed(1) + "%</div>" +
          '<div style="margin-top:4px;color:var(--text-2)">示例：' + samples + "</div>";

        const enter = (ev) => {
          hoverBus.emit({ type: "len", key: k });
          showTip(tipHTML, ev.clientX, ev.clientY);
        };
        row.addEventListener("mouseenter", enter);
        row.addEventListener("mousemove", enter);
        row.addEventListener("mouseleave", () => {
          hoverBus.emit(null);
          hideTip();
        });
        bars.appendChild(row);
      });

      foot.innerHTML =
        (mode === "word"
          ? "口径：仅单词 " + fmtNum(corpus.totalWords) + " 条，短语不计。"
          : "口径：全部 " + fmtNum(corpus.totalEntries) + " 条，短语按含空格总长度计算；因此 15+ 桶会被拉高。") +
        "<br>横轴为字母数，≥15 合并为一栏以避免长尾。";
    }

    toggle.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".mini-toggle-btn");
      if (!btn || btn.classList.contains("is-on")) return;
      mode = btn.dataset.mode;
      btnWord.classList.toggle("is-on", mode === "word");
      btnAll.classList.toggle("is-on", mode === "all");
      render();
    });

    render();
  }

  /* ══════════════════════════════════════════════════════
     ④ 首字母分布（字母云 + 迷你柱）
  ══════════════════════════════════════════════════════ */
  function drawInitialCloud(body, corpus) {
    const ini = corpus.initials;
    const letters = Object.keys(ini).sort();
    const values = letters.map((c) => ini[c]);
    const max = Math.max.apply(null, values);
    const min = Math.min.apply(null, values);
    const counted = values.reduce((s, v) => s + v, 0);
    const TRACK = 150; // 柱子可用高度（px），用 px 避免百分比高度在 flex 里失效

    body.innerHTML = "";
    const chart = el("div", "letter-chart");
    body.appendChild(chart);

    letters.forEach((c) => {
      const n = ini[c];
      // 字号：min→12px, max→26px 线性映射
      const size = values.length > 1 ? 12 + ((n - min) / (max - min)) * 14 : 20;
      const h = Math.max(2, (n / max) * TRACK);

      const col = el("div", "letter-col");
      col.dataset.c = c;
      col.innerHTML =
        '<div class="letter-track"><i class="letter-bar" style="height:' + h.toFixed(1) + 'px"></i></div>' +
        '<span class="letter-ch" style="font-size:' + size.toFixed(1) + 'px">' + c.toUpperCase() + "</span>";

      const tipHTML =
        "<div><b>" + c.toUpperCase() + " 开头</b></div>" +
        "<div>" + fmtNum(n) + " 条 · " + ((n / counted) * 100).toFixed(1) + "%</div>" +
        '<div style="margin-top:4px;color:var(--text-2)">占全部 ' + fmtNum(corpus.totalEntries) + " 条的 " +
        ((n / corpus.totalEntries) * 100).toFixed(1) + "%</div>";

      const enter = (ev) => {
        hoverBus.emit({ type: "initial", key: c });
        showTip(tipHTML, ev.clientX, ev.clientY);
      };
      col.addEventListener("mouseenter", enter);
      col.addEventListener("mousemove", enter);
      col.addEventListener("mouseleave", () => {
        hoverBus.emit(null);
        hideTip();
      });
      chart.appendChild(col);
    });

    const foot = el("p", "donut-footnote");
    foot.innerHTML =
      "A–Z 横向排列，柱高正比于该字母词条数，字号同步放大。<br>" +
      "已剔除引号 / 括号等非 [a-z] 开头的词条，实际计入 " + fmtNum(counted) +
      " 条（共 " + fmtNum(corpus.totalEntries) + " 条，剔除 " +
      fmtNum(corpus.totalEntries - counted) + " 条）。";
    body.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════
     ⑨ n-gram 字符模式热力图
  ══════════════════════════════════════════════════════ */
  const HEAT_BASE = "139,124,246"; // 紫罗兰，深浅主题通用

  function drawNgramHeat(body, corpus) {
    const ng = corpus.ngram;
    const rows = ng.topSuf, cols = ng.topPre;
    const maxN = Math.max.apply(
      null,
      rows.map((s) => Math.max.apply(null, cols.map((p) => ((ng.cell[p + "|" + s] || {}).n || 0))))
    );

    body.innerHTML = "";
    const grid = el("div", "heat");
    grid.style.gridTemplateColumns = "44px repeat(" + cols.length + ", minmax(0, 1fr))";
    body.appendChild(grid);

    // 表头：横向 = 起始 3-gram
    grid.appendChild(el("div", "heat-head"));
    cols.forEach((p) => grid.appendChild(el("div", "heat-head", p)));

    rows.forEach((s) => {
      grid.appendChild(el("div", "heat-lab", s));
      cols.forEach((p) => {
        const c = ng.cell[p + "|" + s];
        const n = c ? c.n : 0;
        const cellEl = el("div", "heat-cell");
        cellEl.dataset.n = n;
        if (n > 0) {
          // sqrt 让低值也能看见，高值不至于爆白
          const a = 0.08 + Math.sqrt(n / maxN) * 0.82;
          cellEl.style.background = "rgba(" + HEAT_BASE + "," + a.toFixed(3) + ")";
        }
        if (n > 0) {
          const ex = c.ex.map((w) => "<b>" + w + "</b>").join("、") || "—";
          const tipHTML =
            "<div><b>" + p + " … " + s + "</b></div>" +
            "<div>" + fmtNum(n) + " 词 · 占全部组合 " + ((n / ng.total) * 100).toFixed(2) + "%</div>" +
            '<div style="margin-top:4px;color:var(--text-2)">示例：' + ex + "</div>";
          const enter = (ev) => {
            hoverBus.emit({ type: "ngram", key: p + "|" + s, words: c.ex });
            showTip(tipHTML, ev.clientX, ev.clientY);
          };
          cellEl.addEventListener("mouseenter", enter);
          cellEl.addEventListener("mousemove", enter);
          cellEl.addEventListener("mouseleave", () => {
            hoverBus.emit(null);
            hideTip();
          });
        }
        grid.appendChild(cellEl);
      });
    });

    // 图例
    const foot = el("div", "heat-foot");
    const scale = el("div", "heat-scale");
    [0.08, 0.3, 0.5, 0.7, 0.9].forEach((a) => {
      const i = el("i");
      i.style.background = "rgba(" + HEAT_BASE + "," + a + ")";
      scale.appendChild(i);
    });
    foot.appendChild(document.createTextNode("少"));
    foot.appendChild(scale);
    foot.appendChild(document.createTextNode("多"));
    const note = el("span", null,
      " · 横轴是出现最多的 " + cols.length + " 种「开头 3 字母」、纵轴是 " + rows.length +
      " 种「结尾 3 字母」；仅统计单词，共 " + fmtNum(ng.total) + " 个词参与。");
    foot.appendChild(note);
    body.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════
     簇配色 — 黄金角步长，100 个簇比 3.6° 等间距更好分辨
  ══════════════════════════════════════════════════════ */
  const HUE_STEP = 137.508;
  function clusterHue(id) {
    return id < 0 ? 0 : (id * HUE_STEP) % 360;
  }
  function clusterColor(id, alpha, light) {
    if (id < 0) return "rgba(154,160,166," + (alpha == null ? 1 : alpha) + ")";
    return "hsla(" + clusterHue(id).toFixed(1) + ",62%," + (light || 58) + "%," +
      (alpha == null ? 1 : alpha) + ")";
  }

  /* ══════════════════════════════════════════════════════
     ⑩ 自然拼读 · 音素分布（Phase 1：单双元音 + 辅音）
     分类定义镜像自 index.html / script.js 的 PHONICS_GROUPS
     （仅取「单双元音」「辅音」两个分区，保证与首页 Phonics 面板口径一致）
  ══════════════════════════════════════════════════════ */
  const PHONICS_VIZ = {
    sections: [
      {
        id: "vowels",
        label: "单双元音",
        groups: [
          { id: "mono-long", label: "长元音", color: "#8b5cf6", sounds: [
            { ipa: "[i:]", combos: ["ee", "ea", "e_e", "ie", "ei", "ey"] },
            { ipa: "[ɑ:]", combos: ["ar", "are", "al", "au", "aw"] },
            { ipa: "[ɔ:]", combos: ["or", "oar", "oor", "ore", "our", "al", "au", "aw"] },
            { ipa: "[u:]", combos: ["oo", "u_e", "ue", "ui", "ew", "ou"] },
            { ipa: "[ɜ:]", combos: ["ir", "ur", "er", "ear", "or", "yr"] },
          ] },
          { id: "mono-short", label: "短元音", color: "#22a6b6", sounds: [
            { ipa: "[ʌ]", combos: ["u", "o", "oo", "ou", "oe"] },
            { ipa: "[ɪ]", combos: ["i", "y", "e", "u", "ui"] },
            { ipa: "[ʊ]", combos: ["oo", "u", "oul"] },
            { ipa: "[ə]", combos: ["a", "e", "i", "o", "u", "ou"] },
            { ipa: "[ɒ]", combos: ["o", "a", "al"] },
            { ipa: "[e]", combos: ["e", "ea", "a", "ai", "ie"] },
            { ipa: "[æ]", combos: ["a", "ai"] },
          ] },
          { id: "mono-dip", label: "双元音", color: "#f0a93b", sounds: [
            { ipa: "[eɪ]", combos: ["a", "a_e", "ai", "ay", "eigh", "ey", "ea"] },
            { ipa: "[aɪ]", combos: ["i", "i_e", "ie", "igh", "y", "eye", "uy"] },
            { ipa: "[ɔɪ]", combos: ["oi", "oy"] },
            { ipa: "[aʊ]", combos: ["ou", "ow"] },
            { ipa: "[əʊ]", combos: ["o", "o_e", "oa", "oe", "ow"] },
            { ipa: "[ɪə]", combos: ["ear", "eer", "ier", "ia"] },
            { ipa: "[eə]", combos: ["air", "are", "ear", "eir", "ere", "aire", "ayer"] },
            { ipa: "[ʊə]", combos: ["oor", "oure", "our", "ure"] },
          ] },
        ],
      },
      {
        id: "consonants",
        label: "辅音",
        groups: [
          { id: "voiceless", label: "清辅音", color: "#ef5b5b", sounds: [
            { ipa: "[p]", combos: ["p", "pp"] },
            { ipa: "[t]", combos: ["t", "tt", "ed"] },
            { ipa: "[k]", combos: ["c", "k", "ck", "ch", "que"] },
            { ipa: "[f]", combos: ["f", "ff"] },
            { ipa: "[θ]", combos: ["th"] },
            { ipa: "[s]", combos: ["s", "ss", "se", "sc", "ce", "ci", "cy"] },
            { ipa: "[ʃ]", combos: ["sh", "ti", "c", "s", "ss", "ch"] },
            { ipa: "[tʃ]", combos: ["ch", "tch", "tu"] },
            { ipa: "[tr]", combos: ["tr"] },
            { ipa: "[ts]", combos: ["ts"] },
          ] },
          { id: "voiced", label: "浊辅音", color: "#3fae6b", sounds: [
            { ipa: "[b]", combos: ["b", "bb"] },
            { ipa: "[d]", combos: ["d", "dd"] },
            { ipa: "[g]", combos: ["g", "gg", "gh", "gu"] },
            { ipa: "[v]", combos: ["v", "ve", "f"] },
            { ipa: "[ð]", combos: ["th"] },
            { ipa: "[z]", combos: ["z", "zz", "s", "se", "ss"] },
            { ipa: "[ʒ]", combos: ["si", "su"] },
            { ipa: "[dʒ]", combos: ["j", "ge", "gi", "gy", "dge"] },
            { ipa: "[dr]", combos: ["dr"] },
            { ipa: "[dz]", combos: ["ds"] },
          ] },
          { id: "semi-voiced", label: "半浊辅音", color: "#4f9be9", sounds: [
            { ipa: "[h]", combos: ["h"] },
            { ipa: "[r]", combos: ["r", "rr", "wr", "rh"] },
          ] },
          { id: "semivowel", label: "半元音", color: "#d96bb0", sounds: [
            { ipa: "[w]", combos: ["w", "wh"] },
            { ipa: "[j]", combos: ["y"] },
          ] },
          { id: "nasal", label: "鼻音", color: "#16a3a3", sounds: [
            { ipa: "[m]", combos: ["m", "mm"] },
            { ipa: "[n]", combos: ["n", "nn"] },
            { ipa: "[ŋ]", combos: ["ng", "nk"] },
          ] },
          { id: "lateral", label: "边音", color: "#a06bf0", sounds: [
            { ipa: "[l]", combos: ["l", "ll"] },
          ] },
        ],
      },
    ],
  };

  // 元音段剔除裸单字母 a/e/i/o/u（几乎每词都有、无区分度），保留有辨识度的拼写
  const BARE_VOWELS = new Set(["a", "e", "i", "o", "u"]);
  const phonicsReCache = {};
  function phonicsRegex(c) {
    if (phonicsReCache[c]) return phonicsReCache[c];
    const src = c.includes("_")
      ? c.replace(/_/g, "[a-z]")
      : c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (phonicsReCache[c] = new RegExp(src, "i"));
  }
  function isEffCombo(c, isVowel) {
    return !(isVowel && BARE_VOWELS.has(c));
  }

  let phonicsIndexCache = null;
  function buildPhonicsIndex(words) {
    if (phonicsIndexCache) return phonicsIndexCache;
    const N = words.length;
    const t0 = (window.performance || Date).now();

    const sections = PHONICS_VIZ.sections.map((sec) => {
      const isVowel = sec.id === "vowels";
      const groups = sec.groups.map((grp) => {
        const sounds = grp.sounds.map((snd) => {
          const combos = snd.combos
            .filter((c) => isEffCombo(c, isVowel))
            .map((c) => ({ combo: c, n: 0, ex: [] }));
          const byCombo = {};
          combos.forEach((cs) => (byCombo[cs.combo] = cs));
          const hit = new Set();
          const samples = [];
          words.forEach((w) => {
            let any = false;
            combos.forEach((cs) => {
              if (phonicsRegex(cs.combo).test(w)) {
                cs.n++;
                if (cs.ex.length < 5) cs.ex.push(w);
                any = true;
              }
            });
            if (any) {
              hit.add(w);
              if (samples.length < 5) samples.push(w);
            }
          });
          return {
            ipa: snd.ipa,
            combos,
            n: hit.size,
            pct: N ? (hit.size / N) * 100 : 0,
            samples,
          };
        });
        sounds.sort((a, b) => b.n - a.n);
        return { id: grp.id, label: grp.label, color: grp.color, sounds };
      });
      const maxN = Math.max.apply(
        null,
        [1].concat(groups.flatMap((g) => g.sounds.map((s) => s.n)))
      );
      return { id: sec.id, label: sec.label, groups, maxN };
    });

    phonicsIndexCache = {
      N,
      sections,
      ms: Math.round(((window.performance || Date).now()) - t0),
    };
    console.info("[Dashboard] phonics index built in " + phonicsIndexCache.ms + "ms");
return phonicsIndexCache;
  }

  function drawPhonics(body, idx) {
    body.innerHTML = "";

    let active = idx.sections[0].id;

    const toggle = el("div", "mini-toggle");
    idx.sections.forEach((sec) => {
      const b = el("button", "mini-toggle-btn" + (sec.id === active ? " is-on" : ""), sec.label);
      b.dataset.sec = sec.id;
      toggle.appendChild(b);
    });
    body.appendChild(toggle);

    const stage = el("div", "phonics-stage");
    body.appendChild(stage);

    const foot = el("p", "donut-footnote");
    foot.innerHTML =
      "口径：仅单词 " + fmtNum(idx.N) + " 条，短语不计。每条 = 含该发音拼写组合的单词数（去重）；" +
      "同一单词常同时含多个音，各音计数互相独立，故占比之和可 &gt; 100%。<br>" +
      "元音段剔除裸单字母 a/e/i/o/u（几乎每词都有、无区分度），仅保留有辨识度的拼写；辅音段保留全部拼写。" +
      "点击音条可展开其拼写组合与示例词。";
    body.appendChild(foot);

    function renderSection(secId) {
      const sec = idx.sections.find((s) => s.id === secId);
      stage.innerHTML = "";
      sec.groups.forEach((grp) => {
        const block = el("div", "phonics-group");
        block.appendChild(el("div", "phonics-group-label", grp.label));
        const list = el("div", "phonics-list");
        const rows = [];
        grp.sounds.forEach((snd) => {
          const row = el("div", "phonics-row");
          const w = (snd.n / sec.maxN) * 100;
          row.innerHTML =
            '<span class="phonics-ipa">' + snd.ipa + "</span>" +
            '<div class="phonics-track"><i class="phonics-fill" style="width:' +
            w.toFixed(2) + "%;background:" + grp.color + '"></i></div>' +
            '<span class="phonics-val">' + fmtNum(snd.n) +
            '<small>' + fmtPct(snd.pct) + "</small></span>";

          const tipHTML = () => {
            const combos = snd.combos.map((c) => c.combo + " " + fmtNum(c.n)).join("、");
            const ex = snd.samples.map((w) => "<b>" + w + "</b>").join("、") || "—";
            return (
              "<div><b>" + snd.ipa + "</b> · " + grp.label + "</div>" +
              "<div>" + fmtNum(snd.n) + " 词 · " + fmtPct(snd.pct) + "</div>" +
              '<div style="margin-top:4px;color:var(--text-2)">拼写：' + combos + "</div>" +
              '<div style="margin-top:4px;color:var(--text-2)">示例：' + ex + "</div>"
            );
          };
          const enter = (ev) => {
            hoverBus.emit({ type: "phonics", sound: snd.ipa });
            showTip(tipHTML(), ev.clientX, ev.clientY);
            row.classList.add("is-hot");
          };
          row.addEventListener("mouseenter", enter);
          row.addEventListener("mousemove", enter);
          row.addEventListener("mouseleave", () => {
            hoverBus.emit(null);
            hideTip();
            row.classList.remove("is-hot");
          });
          row._snd = snd;
          row.addEventListener("click", () => {
            if (grp._openIpa === snd.ipa) {
              // 再次点击：收起本模块下方详情
              grp._openIpa = null;
              grp.detailEl.classList.remove("is-on");
              grp.detailEl.innerHTML = "";
              row.classList.remove("is-open");
            } else {
              // 展开：详情直接显示在当前音组模块下方（保持整卡宽度）
              grp._openIpa = snd.ipa;
              rows.forEach((r) => r.classList.toggle("is-open", r._snd === snd));
              showGroupDetail(grp, snd);
            }
          });
          rows.push(row);
          list.appendChild(row);
        });
        block.appendChild(list);
        const detailEl = el("div", "phonics-detail");
        block.appendChild(detailEl);
        grp.detailEl = detailEl;
        grp._openIpa = null;
        stage.appendChild(block);
      });
    }

    function showGroupDetail(grp, snd) {
      const pills = snd.combos
        .map((c) => {
          const ex = c.ex.map((w) => "<b>" + w + "</b>").join("、") || "—";
          return (
            '<div class="phonics-pill">' +
            '<span class="pill-combo">' + c.combo + "</span>" +
            '<span class="pill-n">' + fmtNum(c.n) + "</span>" +
            '<span class="pill-ex">' + ex + "</span></div>"
          );
        })
        .join("");
      const ex = snd.samples.map((w) => "<b>" + w + "</b>").join("、") || "—";
      grp.detailEl.innerHTML =
        '<div class="phonics-detail-head">' +
        '<span class="phonics-detail-ipa">' + snd.ipa + "</span>" +
        "<span>" + grp.label + "</span>" +
        '<span class="phonics-detail-meta">' + fmtNum(snd.n) + " 词 · " + fmtPct(snd.pct) + "</span>" +
        "</div>" +
        '<div class="phonics-pills">' + pills + "</div>" +
        '<div class="phonics-detail-ex">示例词：' + ex + "</div>";
      grp.detailEl.classList.add("is-on");
    }

    toggle.addEventListener("click", (ev) => {
      const b = ev.target.closest(".mini-toggle-btn");
      if (!b || b.classList.contains("is-on")) return;
      active = b.dataset.sec;
      Array.prototype.forEach.call(toggle.children, (x) =>
        x.classList.toggle("is-on", x.dataset.sec === active)
      );
      // 切换分区时整体重绘，各模块详情自动收起
      renderSection(active);
    });

    renderSection(active);
  }

  /* ══════════════════════════════════════════════════════
     音节结构可视化（Syllables）— 基于英式 IPA 拆骨架
     复用 script.js 的 ipaSkeleton / buildSyllableMeta 口径
  ══════════════════════════════════════════════════════ */
  const SYL_DIPH = new Set(["eɪ", "aɪ", "ɔɪ", "aʊ", "əʊ", "ɪə", "eə", "ʊə"]);
  const SYL_AFFR = new Set(["tʃ", "dʒ"]);
  const SYL_MONO = new Set("iɪeæɑɔɒoʊuʌəɜɚɝaɛєε".split(""));
  const SYL_CONS = new Set("pbtdkɡfvθðszʃʒhmnŋlrwj".split(""));
  const SYL_ONS2 = new Set([
    "pr","br","tr","dr","kr","gr","fr","θr","ʃr",
    "pl","bl","kl","gl","fl","sl",
    "sp","st","sk","sm","sn","sf",
    "sw","tw","dw","kw","gw","hw",
    "pj","bj","tj","dj","kj","fj","vj","θj","sj","mj","nj","lj","hj",
  ]);
  const SYL_ONS3 = new Set(["spr","spl","str","skr","skl","skw","sfr","stj","skj","spj"]);
  const SYL_OPEN = new Set(["V", "CV", "CCV", "CCCV"]);
  const SYL_CLOSED = new Set([
    "VC","VCC","VCCC","CVC","CVCC","CVCCC",
    "CCVC","CCVCC","CCVCCC","CCCVC","CCCVCC","CCCVCCC",
  ]);
  const VCE_LONG = { a: "eɪ", e: "iː", i: "aɪ", o: "əʊ", u: "uː" };
  const VCE_EX = new Set([
    "are","were","there","where","sure","chore","yore",
    "move","prove","lose","whose","remove",
  ]);
  // 4 种起始辅音数对应的配色（0/1/2/3 辅音开头）
  const SYL_ONSET_COLORS = ["#8b5cf6", "#22a6b6", "#f0a93b", "#ef5b5b"];

  // IPA → 音节骨架数组（如 /əˈbaʊt/ → ["V","CVC"]），失败返回 null
  function ipaSkeleton(ipa) {
    if (!ipa) return null;
    const s = String(ipa).replace(/[ˈˌ\s/]/g, "");
    const toks = [];
    for (let i = 0; i < s.length; ) {
      const two = s.slice(i, i + 2);
      if (SYL_DIPH.has(two)) { toks.push("V"); i += 2; continue; }
      if (SYL_AFFR.has(two)) { toks.push("C"); i += 2; continue; }
      const ch = s[i];
      if (ch === "ː") { i += 1; continue; }
      if (SYL_MONO.has(ch)) toks.push("V");
      else if (SYL_CONS.has(ch)) toks.push(ch);
      i += 1;
    }
    const vIdx = [];
    toks.forEach((t, i) => { if (t === "V") vIdx.push(i); });
    if (!vIdx.length) return null;
    const onsOk = (seq) => {
      const L = seq.length;
      if (L === 0) return true;
      if (L === 1) return seq[0] !== "ŋ";
      if (L === 2) return SYL_ONS2.has(seq.join(""));
      if (L === 3) return SYL_ONS3.has(seq.join(""));
      return false;
    };
    const parts = [];
    let onset = toks.slice(0, vIdx[0]);
    vIdx.forEach((vi, k) => {
      const core = "V";
      if (k + 1 < vIdx.length) {
        const mid = toks.slice(vi + 1, vIdx[k + 1]);
        let chosen = 0;
        for (let L = Math.min(3, mid.length); L >= 1; L--) {
          if (onsOk(mid.slice(-L))) { chosen = L; break; }
        }
        let cod = chosen ? mid.slice(0, mid.length - chosen) : mid;
        if (cod.length > 4) {
          const extra = cod.length - 4;
          chosen += extra;
          cod = cod.slice(0, 4);
        }
        parts.push("C".repeat(onset.length) + core + "C".repeat(cod.length));
        onset = chosen ? mid.slice(mid.length - chosen) : [];
      } else {
        const cod = toks.slice(vi + 1);
        parts.push("C".repeat(onset.length) + core + "C".repeat(cod.length));
        onset = [];
      }
    });
    if (onset.length) parts.push("C".repeat(onset.length) + "V");
    return { parts, label: parts.join(".") };
  }

  // 取 IPA 最后一个元音单位（双元音优先，含 ː 长音记号）
  function lastVowelUnit(ipa) {
    let unit = "";
    for (let i = 0; i < ipa.length; i++) {
      const two = ipa.slice(i, i + 2);
      if (SYL_DIPH.has(two)) { unit = two; i += 1; continue; }
      const ch = ipa[i];
      if (SYL_MONO.has(ch)) {
        unit = ipa[i + 1] === "ː" ? ch + "ː" : ch;
      }
    }
    return unit;
  }
  // 严格 VCe 判定：词尾 元音+单辅音+e，末音节须以辅音收尾，且该元音确实发对应长音
  function wordIsVce(wordLower, parts, ipaClean) {
    const m = /(?<![aeiou])[aeiou][bcdfghjklmnpqrstvwxyz]e$/.exec(wordLower);
    if (!m) return false;
    if (VCE_EX.has(wordLower)) return false;
    if (!parts.length || !parts[parts.length - 1].endsWith("C")) return false;
    const v = lastVowelUnit(ipaClean);
    const want = VCE_LONG[m[0].charAt(0)];
    return !!want && v === want;
  }

  let syllableIndexCache = null;
  function buildSyllableIndex(entries, ipaMap) {
    if (syllableIndexCache) return syllableIndexCache;
    const t0 = (window.performance || Date).now();
    const words = entries.filter((w) => typeof w === "string" && w.indexOf(" ") === -1);
    const N = words.length;
    const skelWords = {}, skelEx = {}, nsCount = {}, comboCount = {}, comboEx = {};
    let total = 0, openCount = 0, closedCount = 0, vceCount = 0, diphCount = 0;

    for (const w of words) {
      const rec = ipaMap && ipaMap[w.toLowerCase()];
      if (!rec) continue;
      const ipa = Array.isArray(rec) && rec.length > 1 ? rec[1] : rec;
      const r = ipaSkeleton(ipa);
      if (!r || !r.parts.length) continue;
      total++;
      const n = r.parts.length;
      const nb = n >= 5 ? 5 : n;
      nsCount[nb] = (nsCount[nb] || 0) + 1;
      const seen = new Set(r.parts);
      let hasOpen = false, hasClosed = false;
      seen.forEach((p) => {
        skelWords[p] = (skelWords[p] || 0) + 1;
        if (!skelEx[p]) skelEx[p] = [];
        if (skelEx[p].length < 5) skelEx[p].push(w);
        if (SYL_OPEN.has(p)) hasOpen = true;
        if (SYL_CLOSED.has(p)) hasClosed = true;
      });
      if (hasOpen) openCount++;
      if (hasClosed) closedCount++;
      const ipaClean = String(ipa).replace(/[ˈˌ\s/]/g, "");
      let hasDiph = false;
      for (const d of SYL_DIPH) { if (ipaClean.indexOf(d) !== -1) { hasDiph = true; break; } }
      if (hasDiph) diphCount++;
      if (wordIsVce(w.toLowerCase(), r.parts, ipaClean)) vceCount++;
      const label = r.parts.join(".");
      comboCount[label] = (comboCount[label] || 0) + 1;
      if (!comboEx[label]) comboEx[label] = [];
      if (comboEx[label].length < 5) comboEx[label].push(w);
    }

    const comboKeys = Object.keys(comboCount).sort((a, b) => comboCount[b] - comboCount[a] || (a < b ? -1 : 1));
    const TOP = 24;
    const topCombos = comboKeys.slice(0, TOP).map((k) => ({ label: k, n: comboCount[k], ex: comboEx[k] || [] }));
    const tailN = comboKeys.length - topCombos.length;
    let tailWords = 0;
    for (let i = TOP; i < comboKeys.length; i++) tailWords += comboCount[comboKeys[i]];

    const ms = Math.round(((window.performance || Date).now()) - t0);
    console.info("[Dashboard] syllable index built in " + ms + "ms; parsed " + total + "/" + N);
    syllableIndexCache = {
      N, total, nsCount, skelWords, skelEx, comboCount, comboEx,
      topCombos, tailN, tailWords, openCount, closedCount, vceCount, diphCount,
    };
    return syllableIndexCache;
  }

  function drawSyllable(body, idx) {
    body.innerHTML = "";
    const N = idx.N, parsed = idx.total;
    const pct = (x) => (parsed ? (x / parsed) * 100 : 0);

    // ── 顶部 4 个 stat ──
    const stats = el("div", "syl-stats");
    const mkStat = (label, n, sub) => {
      const s = el("div", "syl-stat");
      s.innerHTML = '<div class="syl-stat-num">' + fmtNum(n) + '</div><div class="syl-stat-label">' + label + '</div><div class="syl-stat-sub">' + sub + '</div>';
      return s;
    };
    stats.appendChild(mkStat("可解析词", parsed, "共 " + fmtNum(N) + " 词"));
    stats.appendChild(mkStat("开音节", idx.openCount, fmtPct(pct(idx.openCount)) + " 元音结尾"));
    stats.appendChild(mkStat("闭音节", idx.closedCount, fmtPct(pct(idx.closedCount)) + " 辅音结尾"));
    stats.appendChild(mkStat("VCe 魔法-e", idx.vceCount, "词尾 e 不发音"));
    stats.appendChild(mkStat("含双元音", idx.diphCount, fmtPct(pct(idx.diphCount))));
    body.appendChild(stats);

    // chip 渲染：按起始辅音数着色
    const chipHTML = (skel) => {
      const onset = skel.indexOf("V");
      const color = SYL_ONSET_COLORS[onset] || "#888";
      return '<span class="syl-chip" style="--c:' + color + '">' + skel + '</span>';
    };
    const comboHTML = (label) => label.split(".").map(chipHTML).join('<span class="syl-dot">·</span>');

    // ── 音节数分布 ──
    const nsWrap = el("div", "syl-block");
    nsWrap.appendChild(el("div", "syl-block-title", "音节数分布"));
    const nsRows = el("div", "syl-ns-rows");
    const nsMax = Math.max.apply(null, [1].concat(Object.keys(idx.nsCount).map((k) => idx.nsCount[k])));
    const nsLabels = { 1: "1 音节", 2: "2 音节", 3: "3 音节", 4: "4 音节", 5: "5+ 音节" };
    [1, 2, 3, 4, 5].forEach((k) => {
      const n = idx.nsCount[k] || 0;
      const w = nsMax ? (n / nsMax) * 100 : 0;
      const row = el("div", "syl-ns-row");
      row.innerHTML =
        '<span class="syl-ns-label">' + nsLabels[k] + '</span>' +
        '<div class="syl-track"><i class="syl-fill" style="width:' + w.toFixed(2) + '%"></i></div>' +
        '<span class="syl-val">' + fmtNum(n) + '<small>' + fmtPct(pct(n)) + '</small></span>';
      nsRows.appendChild(row);
    });
    nsWrap.appendChild(nsRows);
    body.appendChild(nsWrap);

    // ── 常见组合 Top 排行 ──
    const comboWrap = el("div", "syl-block");
    comboWrap.appendChild(el("div", "syl-block-title", "常见音节组合 · Top " + idx.topCombos.length));
    const comboRows = el("div", "syl-combo-rows");
    const comboMax = idx.topCombos.length ? idx.topCombos[0].n : 1;
    let selected = null;

    function renderDetail(label, container) {
      if (!label) { container.classList.remove("is-on"); container.innerHTML = ""; return; }
      const n = idx.comboCount[label] || 0;
      const ex = (idx.comboEx[label] || []).map((w) => "<b>" + w + "</b>").join("、") || "—";
      const skelLines = label.split(".").map((p) => {
        const sn = idx.skelWords[p] || 0;
        const sex = (idx.skelEx[p] || []).map((w) => "<b>" + w + "</b>").join("、") || "—";
        const onset = p.indexOf("V");
        const color = SYL_ONSET_COLORS[onset] || "#888";
        const type = SYL_OPEN.has(p) ? "开音节" : (SYL_CLOSED.has(p) ? "闭音节" : "");
        return '<div class="syl-detail-skel"><span class="syl-chip" style="--c:' + color + '">' + p + '</span>' +
          '<span class="syl-detail-skel-n">' + fmtNum(sn) + ' 词</span>' +
          (type ? '<span class="syl-detail-skel-type">' + type + '</span>' : '') +
          '<span class="syl-detail-skel-ex">示例：' + sex + '</span></div>';
      }).join("");
      container.innerHTML =
        '<div class="syl-detail-head"><span class="syl-detail-combo">' + comboHTML(label) + '</span>' +
        '<span class="syl-detail-meta">' + fmtNum(n) + ' 词 · ' + fmtPct(pct(n)) + '</span></div>' +
        '<div class="syl-detail-skel-title">组成音节（含该骨架的词数，各音节独立计数）</div>' +
        '<div class="syl-detail-skel-list">' + skelLines + '</div>' +
        '<div class="syl-detail-ex">示例词：' + ex + '</div>';
      container.classList.add("is-on");
    }

    let openDetail = null;
    idx.topCombos.forEach((c) => {
      const w = comboMax ? (c.n / comboMax) * 100 : 0;
      const row = el("div", "syl-combo-row");
      row.innerHTML =
        '<span class="syl-combo-chips">' + comboHTML(c.label) + '</span>' +
        '<div class="syl-track"><i class="syl-fill" style="width:' + w.toFixed(2) + '%"></i></div>' +
        '<span class="syl-val">' + fmtNum(c.n) + '<small>' + fmtPct(pct(c.n)) + '</small></span>';
      const tipHTML = () => {
        const ex = (c.ex || []).map((w) => "<b>" + w + "</b>").join("、") || "—";
        return '<div><b>' + c.label + '</b></div><div>' + fmtNum(c.n) + ' 词 · ' + fmtPct(pct(c.n)) +
          '</div><div style="margin-top:4px;color:var(--text-2)">示例：' + ex + '</div>';
      };
      row.addEventListener("mouseenter", (ev) => { showTip(tipHTML(), ev.clientX, ev.clientY); row.classList.add("is-hot"); });
      row.addEventListener("mousemove", (ev) => { showTip(tipHTML(), ev.clientX, ev.clientY); });
      row.addEventListener("mouseleave", () => { hideTip(); row.classList.remove("is-hot"); });
      // 每个组合条下方直接挂一块内联详情，展开时显示在本条正下方（不再堆到卡片最底部）
      const rowDetail = el("div", "syl-row-detail");
      row.addEventListener("click", () => {
        if (selected === c.label) {
          selected = null;
          rowDetail.classList.remove("is-on");
          rowDetail.innerHTML = "";
          row.classList.remove("is-open");
        } else {
          if (openDetail && openDetail !== rowDetail) {
            openDetail.classList.remove("is-on");
            openDetail.innerHTML = "";
          }
          Array.prototype.forEach.call(comboRows.querySelectorAll(".syl-combo-row.is-open"), (r) => r.classList.remove("is-open"));
          selected = c.label;
          row.classList.add("is-open");
          renderDetail(c.label, rowDetail);
          openDetail = rowDetail;
        }
      });
      comboRows.appendChild(row);
      comboRows.appendChild(rowDetail);
    });

    if (idx.tailN > 0) {
      const row = el("div", "syl-combo-row syl-combo-tail");
      row.innerHTML =
        '<span class="syl-combo-chips syl-tail-label">其它 ' + fmtNum(idx.tailN) + ' 种组合</span>' +
        '<div class="syl-track"><i class="syl-fill" style="width:100%"></i></div>' +
        '<span class="syl-val">' + fmtNum(idx.tailWords) + '</span>';
      comboRows.appendChild(row);
    }
    comboWrap.appendChild(comboRows);
    body.appendChild(comboWrap);

    const foot = el("p", "donut-footnote");
    foot.innerHTML =
      "口径：词库 " + fmtNum(N) + " 词，其中 " + fmtNum(parsed) + " 词有本地音标且可解析为音节骨架（其余无音标、不参与）。" +
      "骨架用 V=元音音素、C=辅音音素描述每个音节，如 CVC=辅-元-辅；组合 = 多音节的骨架串（· 连接，如 CVC·CV）。" +
      "同一单词可计入多个骨架（各骨架独立计数，占比之和可 &gt; 100%）；点击组合条可展开其组成音节与示例词。";
    body.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════
     ⑤ 词嵌入降维散点图（UMAP · Canvas）
  ══════════════════════════════════════════════════════ */
  function drawScatter(body, payload, names) {
    const coords = payload.coords || {};
    const meta = payload.meta || {};
    const words = Object.keys(coords);
    const N = words.length;
    if (!N) throw new Error("word_coords.json 为空");

    // ── 打平成 TypedArray，按簇分组（一次遍历，绘制时按组批处理 fillStyle）
    const xs = new Float32Array(N), ys = new Float32Array(N), cs = new Int16Array(N);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < N; i++) {
      const c = coords[words[i]];
      xs[i] = c[0]; ys[i] = c[1]; cs[i] = c[2];
      if (c[0] < minX) minX = c[0];
      if (c[0] > maxX) maxX = c[0];
      if (c[1] < minY) minY = c[1];
      if (c[1] > maxY) maxY = c[1];
    }
    const groups = {}, countsByCluster = {};
    for (let i = 0; i < N; i++) {
      const c = cs[i];
      (groups[c] = groups[c] || []).push(i);
      if (c >= 0) countsByCluster[c] = (countsByCluster[c] || 0) + 1;
    }
    const present = Object.keys(groups).map(Number).sort((a, b) => a - b);
    const enabled = {}; // cid -> bool
    present.forEach((c) => (enabled[c] = true));

    // ── DOM
    body.innerHTML = "";
    const wrap = el("div", "scatter-wrap");
    const canvas = document.createElement("canvas");
    canvas.className = "scatter-canvas";
    wrap.appendChild(canvas);

    const hudTip = el("div", "hud-tip", "滚轮缩放 · 拖拽平移 · 悬停查看词条");
    wrap.appendChild(hudTip);

    const hud = el("div", "scatter-hud");
    const hudRow = el("div", "scatter-hud-row");
    const badge = el("span", "hud-badge", "×1.0");
    const btnReset = el("button", "hud-btn", "重置视图");
    hudRow.appendChild(badge);
    hudRow.appendChild(btnReset);
    hud.appendChild(hudRow);
    if (meta.oov) hud.appendChild(el("div", "hud-badge", fmtNum(meta.oov) + " 个词未显示（暂无语义向量）"));
    wrap.appendChild(hud);
    body.appendChild(wrap);

    const filterBar = el("div", "cluster-filter");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "搜索簇名 / 编号";
    const btnAll = el("button", "hud-btn", "全选");
    const btnNone = el("button", "hud-btn", "清空");
    const info = el("span", "hud-badge", "");
    filterBar.appendChild(input);
    filterBar.appendChild(btnAll);
    filterBar.appendChild(btnNone);
    filterBar.appendChild(info);
    body.appendChild(filterBar);

    const chipWrap = el("div", "cluster-chips");
    body.appendChild(chipWrap);

    // ── 簇 chips（按词数降序，最有用的簇排前面）
    const chips = present
      .filter((c) => c >= 0)
      .sort((a, b) => (countsByCluster[b] || 0) - (countsByCluster[a] || 0))
      .map((c) => {
        const nm = names[String(c)] || ("簇 " + c);
        const node = el("span", "cc-chip");
        node.dataset.c = c;
        node.title = nm;
        node.innerHTML =
          '<i class="cc-dot" style="background:' + clusterColor(c) + '"></i>' +
          '<span class="cc-id">' + c + "</span>" + nm +
          '<span class="cc-n">' + fmtNum(countsByCluster[c] || 0) + "</span>";
        node.addEventListener("click", () => {
          enabled[c] = !enabled[c];
          node.classList.toggle("is-off", !enabled[c]);
          updateInfo();
          requestDraw();
        });
        chipWrap.appendChild(node);
        return { node: node, id: c, name: nm };
      });

    if (cs.indexOf(-1) >= 0) {
      const node = el("span", "cc-chip");
      node.innerHTML =
        '<i class="cc-dot" style="background:#9aa0a6"></i>未成簇' +
        '<span class="cc-n">' + fmtNum(groups[-1].length) + "</span>";
      node.addEventListener("click", () => {
        enabled[-1] = !enabled[-1];
        node.classList.toggle("is-off", !enabled[-1]);
        updateInfo();
        requestDraw();
      });
      chipWrap.appendChild(node);
    }

    function updateInfo() {
      const on = present.filter((c) => enabled[c]).length;
      const shown = present.reduce((s, c) => s + (enabled[c] ? groups[c].length : 0), 0);
      info.textContent = "显示 " + fmtNum(shown) + " / " + fmtNum(N) + " 词 · " + on + "/" + present.length + " 簇";
    }

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      chips.forEach((c) => {
        const hit = !q || c.name.toLowerCase().indexOf(q) >= 0 || String(c.id).indexOf(q) >= 0;
        c.node.style.display = hit ? "" : "none";
      });
    });

    function setAll(v) {
      present.forEach((c) => (enabled[c] = v));
      chips.forEach((c) => c.node.classList.toggle("is-off", !v));
      updateInfo();
      requestDraw();
    }
    btnAll.addEventListener("click", () => setAll(true));
    btnNone.addEventListener("click", () => setAll(false));

    // ── 画布
    const ctx = canvas.getContext("2d");
    const H = 460;
    let W = 900, dpr = Math.min(2, window.devicePixelRatio || 1);
    let scale = 1, baseScale = 1, tX = 0, tY = 0;
    let hoverIdx = -1, focusCluster = null, drawQueued = false;

    function measure() {
      const w = body.clientWidth || wrap.clientWidth || 900;
      W = Math.max(320, w);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function resetView() {
      const pad = 18;
      const rx = maxX - minX || 1, ry = maxY - minY || 1;
      baseScale = Math.min((W - 2 * pad) / rx, (H - 2 * pad) / ry);
      const offX = (W - 2 * pad - rx * baseScale) / 2;
      const offY = (H - 2 * pad - ry * baseScale) / 2;
      scale = baseScale;
      tX = pad + offX - minX * scale;
      tY = pad + offY - minY * scale;
    }

    function requestDraw() {
      if (drawQueued) return;
      drawQueued = true;
      requestAnimationFrame(() => {
        drawQueued = false;
        draw();
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const zoom = scale / baseScale;
      const size = Math.max(1.2, Math.min(5.5, 1.7 * Math.pow(zoom, 0.42)));
      const useArc = size > 2.4;
      const half = size / 2;

      // ── 点层
      for (let g = 0; g < present.length; g++) {
        const cid = present[g];
        if (!enabled[cid]) continue;
        const arr = groups[cid];
        const dim = focusCluster !== null && cid !== focusCluster;
        ctx.fillStyle = dim ? "rgba(150,150,155,0.10)" : clusterColor(cid, 0.85);
        for (let k = 0; k < arr.length; k++) {
          const i = arr[k];
          const X = xs[i] * scale + tX, Y = ys[i] * scale + tY;
          if (X < -6 || X > W + 6 || Y < -6 || Y > H + 6) continue;
          if (useArc) {
            ctx.beginPath();
            ctx.arc(X, Y, half, 0, 6.2832);
            ctx.fill();
          } else {
            ctx.fillRect(X - half, Y - half, size, size);
          }
        }
      }

      // ── 高亮环
      if (hoverIdx >= 0) {
        const X = xs[hoverIdx] * scale + tX, Y = ys[hoverIdx] * scale + tY;
        ctx.strokeStyle = "var(--text-1)";
        ctx.strokeStyle = getComputedStyle(document.body).color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X, Y, Math.max(6, size + 3), 0, 6.2832);
        ctx.stroke();
      }

      // ── 标签层：放大到一定程度才渲染，并做粗略去重避免糊成一团
      if (zoom > 2.2) {
        ctx.font = "11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const cell = 74, cols = Math.ceil(W / cell) + 1;
        const taken = {};
        let budget = 500;
        for (let g = 0; g < present.length && budget > 0; g++) {
          const cid = present[g];
          if (!enabled[cid] || (focusCluster !== null && cid !== focusCluster)) continue;
          const arr = groups[cid];
          for (let k = 0; k < arr.length && budget > 0; k++) {
            const i = arr[k];
            const X = xs[i] * scale + tX, Y = ys[i] * scale + tY;
            if (X < 0 || X > W || Y < 0 || Y > H) continue;
            const gx = Math.floor(X / cell), gy = Math.floor(Y / cell);
            const key = gx + "," + gy;
            if (taken[key]) continue;
            taken[key] = 1;
            budget--;
            ctx.fillStyle = getComputedStyle(document.body).color;
            ctx.globalAlpha = 0.75;
            ctx.fillText(words[i], X, Y - size - 5);
            ctx.globalAlpha = 1;
          }
        }
      }

      badge.textContent = "×" + zoom.toFixed(1);
    }

    // ── 交互：缩放 / 平移 / 悬停
    function pick(mx, my) {
      const thr = Math.max(8, (sizeCache() * 2));
      let best = -1, bestD = thr * thr;
      const dx0 = (mx - tX) / scale, dy0 = (my - tY) / scale;
      for (let i = 0; i < N; i++) {
        if (!enabled[cs[i]]) continue;
        if (focusCluster !== null && cs[i] !== focusCluster) continue;
        const ex = (xs[i] - dx0) * scale, ey = (ys[i] - dy0) * scale;
        const d = ex * ex + ey * ey;
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    }
    function sizeCache() {
      return Math.max(1.2, Math.min(5.5, 1.7 * Math.pow(scale / baseScale, 0.42)));
    }

    canvas.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mx = ev.clientX - r.left, my = ev.clientY - r.top;
      let f = Math.exp(-ev.deltaY * 0.0015);
      const lo = baseScale * 0.5, hi = baseScale * 120;
      let next = scale * f;
      if (next < lo) { next = lo; f = next / scale; }
      if (next > hi) { next = hi; f = next / scale; }
      tX = mx - (mx - tX) * f;
      tY = my - (my - tY) * f;
      scale = next;
      requestDraw();
    }, { passive: false });

    let dragging = false, lastX = 0, lastY = 0, moved = false;
    canvas.addEventListener("pointerdown", (ev) => {
      dragging = true; moved = false;
      lastX = ev.clientX; lastY = ev.clientY;
      canvas.classList.add("is-dragging");
      canvas.setPointerCapture(ev.pointerId);
    });
    canvas.addEventListener("pointermove", (ev) => {
      const r = canvas.getBoundingClientRect();
      if (dragging) {
        const dx = ev.clientX - lastX, dy = ev.clientY - lastY;
        if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        lastX = ev.clientX; lastY = ev.clientY;
        tX += dx; tY += dy;
        requestDraw();
        if (moved) hideTip();
        return;
      }
      const mx = ev.clientX - r.left, my = ev.clientY - r.top;
      const i = pick(mx, my);
      if (i !== hoverIdx) {
        hoverIdx = i;
        if (i >= 0) {
          const c = cs[i];
          const nm = c >= 0 ? names[String(c)] || ("簇 " + c) : "未成簇";
          showTip(
            '<div><b>' + words[i] + "</b></div><div>" +
            '<i class="cc-dot" style="display:inline-block;background:' + clusterColor(c) + '"></i> ' +
            nm + (c >= 0 ? " · 簇 " + c : "") + "</div>",
            r.left + mx, r.top + my - 6
          );
          hoverBus.emit({ type: "word", word: words[i], cluster: c });
        } else {
          hideTip();
          hoverBus.emit(null);
        }
        requestDraw();
      }
    });
    const endDrag = () => {
      dragging = false;
      canvas.classList.remove("is-dragging");
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", () => {
      endDrag();
      hoverIdx = -1;
      hideTip();
      hoverBus.emit(null);
      requestDraw();
    });

    btnReset.addEventListener("click", () => {
      resetView();
      requestDraw();
    });

    // ── 与 ⑦ 联动
    hoverBus.register((msg) => {
      if (msg && msg.type === "cluster") {
        focusCluster = msg.cluster;
        requestDraw();
      } else if (!msg) {
        if (focusCluster !== null) { focusCluster = null; requestDraw(); }
      }
    });

    // ── 初始化 / 自适应
    function layout(redraw) {
      measure();
      if (redraw !== false) resetView();
      requestDraw();
    }
    layout();
    updateInfo();

    let rt = null;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => layout(), 180);
    });
  }

  /* ══════════════════════════════════════════════════════
     ⑦ 近义词簇群气泡图
  ══════════════════════════════════════════════════════ */
  function drawBubbles(body, payload, names) {
    const centers = payload.centers || {}, counts = payload.counts || {}, tops = payload.top || {};
    const ids = Object.keys(centers).map(Number).sort((a, b) => a - b);
    if (!ids.length) throw new Error("cluster_centers.json 为空");

    const W = Math.max(360, body.clientWidth || 960), H = 560;
    const maxC = Math.max.apply(null, ids.map((i) => counts[String(i)] || 1));
    const radius = (id) => 11 + Math.sqrt((counts[String(id)] || 1) / maxC) * 42;

    // ── 节点：半径按组内词量，再整体缩放使总占比合适（堆得下、不空荡）
    const nodes = ids.map((id) => ({
      id: id,
      r: radius(id),
      x: 0, y: 0, vx: 0, vy: 0,
      n: counts[String(id)] || 0,
    }));
    {
      let sumArea = 0;
      nodes.forEach((p) => (sumArea += Math.PI * p.r * p.r));
      const target = 0.5 * W * H;
      const f = Math.min(1.4, Math.sqrt(target / (sumArea || 1)));
      nodes.forEach((p) => (p.r = Math.min(p.r * f, H * 0.32)));
    }

    // ── 重力堆积：气泡受重力下落、圆-圆分离、底部+左右墙停靠，从下往上堆成稳定堆
    const GRAV = 0.5, MAXV = 7, DAMP = 0.82, ITER = 1400;
    function settleOnce(randY) {
      for (const p of nodes) {
        p.x = p.r + Math.random() * (W - 2 * p.r);
        p.y = randY ? (-Math.random() * H * 0.6 - p.r) : (Math.random() * H);
        p.vx = 0; p.vy = 0;
      }
      for (let it = 0; it < ITER; it++) {
        const relax = it >= ITER * 0.6; // 末段只做无重叠收拢，去掉残余挤压
        if (!relax) {
          for (const p of nodes) {
            p.vy += GRAV;
            if (p.vy > MAXV) p.vy = MAXV;
            p.vx *= DAMP; p.vy *= DAMP;
            p.x += p.vx; p.y += p.vy;
          }
        }
        for (let pass = 0; pass < 2; pass++) {
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const a = nodes[i], b = nodes[j];
              let dx = b.x - a.x, dy = b.y - a.y;
              let d2 = dx * dx + dy * dy;
              const minD = a.r + b.r;
              if (d2 > 0 && d2 < minD * minD) {
                const d = Math.sqrt(d2) || 0.01;
                const nx = dx / d, ny = dy / d, ov = (minD - d) * 0.5;
                a.x -= nx * ov; a.y -= ny * ov;
                b.x += nx * ov; b.y += ny * ov;
                if (!relax) {
                  const va = a.vx * nx + a.vy * ny, vb = b.vx * nx + b.vy * ny;
                  const diff = (vb - va) * 0.5;
                  a.vx += nx * diff; a.vy += ny * diff;
                  b.vx -= nx * diff; b.vy -= ny * diff;
                }
              } else if (d2 === 0) { a.x -= 0.4; b.x += 0.4; }
            }
          }
        }
        for (const p of nodes) {
          if (p.x - p.r < 0) { p.x = p.r; p.vx = 0; }
          if (p.x + p.r > W) { p.x = W - p.r; p.vx = 0; }
          if (p.y + p.r > H) { p.y = H - p.r; p.vy = 0; }
          if (p.y - p.r < 0) { p.y = p.r; p.vy = 0; }
        }
      }
    }
    settleOnce(false); // 默认静态堆：随机初值收敛成稳定堆（位置无语义，仅表示物理堆位）

    // ── SVG
    const NS = "http://www.w3.org/2000/svg";
    body.innerHTML = "";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "bubble-svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("height", H);
    body.appendChild(svg);

    const nodeEls = [];
    nodes.sort((a, b) => b.r - a.r).forEach((p) => {
      const nm = names[String(p.id)] || ("簇 " + p.id);
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "bubble-node");
      g.setAttribute("transform", "translate(" + p.x.toFixed(2) + "," + p.y.toFixed(2) + ")");

      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", "0");
      circle.setAttribute("cy", "0");
      circle.setAttribute("r", p.r.toFixed(1));
      circle.setAttribute("fill", clusterColor(p.id, 0.45));
      circle.setAttribute("stroke", clusterColor(p.id, 0.9));
      circle.setAttribute("stroke-width", "1.5");
      g.appendChild(circle);

      const ring = document.createElementNS(NS, "circle");
      ring.setAttribute("class", "bubble-ring");
      ring.setAttribute("cx", "0");
      ring.setAttribute("cy", "0");
      ring.setAttribute("r", (p.r + 3).toFixed(1));
      ring.setAttribute("stroke", clusterColor(p.id, 1, 62));
      g.appendChild(ring);

      // 小气泡放不下名字，强标只会互相打架；悬停可见
      if (p.r >= 16) {
        const t = document.createElementNS(NS, "text");
        t.setAttribute("class", "bubble-label");
        t.setAttribute("x", "0");
        t.setAttribute("y", p.r >= 30 ? "-3" : "0");
        t.textContent = nm;
        g.appendChild(t);
        if (p.r >= 30) {
          const t2 = document.createElementNS(NS, "text");
          t2.setAttribute("class", "bubble-sub");
          t2.setAttribute("x", "0");
          t2.setAttribute("y", "11");
          t2.textContent = fmtNum(p.n);
          g.appendChild(t2);
        }
      }

      const tipHTML =
        '<div><b>' + nm + "</b> · 簇 " + p.id + "</div>" +
        "<div>" + fmtNum(p.n) + " 词 · 占全量 " +
        ((p.n / (payload.meta.totalMemberWords || 1)) * 100).toFixed(1) + "%</div>" +
        '<div style="margin-top:4px;color:var(--text-2)">代表词：' +
        ((tops[String(p.id)] || []).map((w) => "<b>" + w + "</b>").join("、") || "—") +
        "</div>";

      const enter = (ev) => {
        nodeEls.forEach((o) => {
          o.classList.toggle("is-dim", o !== g);
          o.classList.toggle("is-active", o === g);
        });
        showTip(tipHTML, ev.clientX, ev.clientY);
        hoverBus.emit({ type: "cluster", cluster: p.id });
      };
      const leave = () => {
        nodeEls.forEach((o) => {
          o.classList.remove("is-dim");
          o.classList.remove("is-active");
        });
        hideTip();
        hoverBus.emit(null);
      };
      g.addEventListener("mouseenter", enter);
      g.addEventListener("mousemove", enter);
      g.addEventListener("mouseleave", leave);

      svg.appendChild(g);
      nodeEls.push(g);
      p.g = g;
    });

    const foot = el("p", "donut-footnote");
    foot.innerHTML =
      "约 100 组近义词，每个气泡是一组；<b>气泡越大代表组内词越多</b>。气泡受重力落入容器、从下往上堆叠成堆。" +
      "把鼠标移到气泡上，可在「单词语义地图」里同步高亮这一组。" +
      "<br>点右上角「重新倒入」可重新随机堆叠。最大的 5 组：" +
      nodes.slice().sort((a, b) => b.n - a.n).slice(0, 5)
        .map((p) => (names[String(p.id)] || p.id) + " " + fmtNum(p.n))
        .join(" · ");
    body.appendChild(foot);

    // ── 「重新倒入」：把气泡移到容器上方随机位置，靠重力动画掉落、堆叠成新堆
    //    默认加载已是静态稳定堆；点按钮才触发一段短时下落动画，收敛后自动休眠（不占 CPU）
    const sim = { running: false, raf: 0, nodes: nodes };
    function step() {
      if (!sim.running) return;
      const ns = sim.nodes;
      for (const p of ns) {
        p.vy += GRAV;
        if (p.vy > MAXV) p.vy = MAXV;
        p.vx *= DAMP; p.vy *= DAMP;
        p.x += p.vx; p.y += p.vy;
      }
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < ns.length; i++) {
          for (let j = i + 1; j < ns.length; j++) {
            const a = ns[i], b = ns[j];
            let dx = b.x - a.x, dy = b.y - a.y;
            let d2 = dx * dx + dy * dy;
            const minD = a.r + b.r;
            if (d2 > 0 && d2 < minD * minD) {
              const d = Math.sqrt(d2) || 0.01;
              const nx = dx / d, ny = dy / d, ov = (minD - d) * 0.5;
              a.x -= nx * ov; a.y -= ny * ov;
              b.x += nx * ov; b.y += ny * ov;
            } else if (d2 === 0) { a.x -= 0.4; b.x += 0.4; }
          }
        }
      }
      let mv = 0;
      for (const p of ns) {
        if (p.x - p.r < 0) { p.x = p.r; p.vx = 0; }
        if (p.x + p.r > W) { p.x = W - p.r; p.vx = 0; }
        if (p.y + p.r > H) { p.y = H - p.r; p.vy = 0; }
        if (p.y - p.r < 0) { p.y = p.r; p.vy = 0; }
        p.g.setAttribute("transform", "translate(" + p.x.toFixed(2) + "," + p.y.toFixed(2) + ")");
        mv = Math.max(mv, Math.abs(p.vx), Math.abs(p.vy));
      }
      // 速度归零即收尾：再做一段纯位置收拢，消除残余重叠（容器够大时必能铺平，与静态堆一致）
      if (mv < 0.06) {
        for (let k = 0; k < 400; k++) {
          for (let pass = 0; pass < 2; pass++) {
            for (let i = 0; i < ns.length; i++) {
              for (let j = i + 1; j < ns.length; j++) {
                const a = ns[i], b = ns[j];
                let dx = b.x - a.x, dy = b.y - a.y;
                let d2 = dx * dx + dy * dy;
                const minD = a.r + b.r;
                if (d2 > 0 && d2 < minD * minD) {
                  const d = Math.sqrt(d2) || 0.01;
                  const nx = dx / d, ny = dy / d, ov = (minD - d) * 0.5;
                  a.x -= nx * ov; a.y -= ny * ov;
                  b.x += nx * ov; b.y += ny * ov;
                } else if (d2 === 0) { a.x -= 0.4; b.x += 0.4; }
              }
            }
          }
          for (const p of ns) {
            if (p.x - p.r < 0) p.x = p.r;
            if (p.x + p.r > W) p.x = W - p.r;
            if (p.y + p.r > H) p.y = H - p.r;
            if (p.y - p.r < 0) p.y = p.r;
          }
        }
        for (const p of ns) p.g.setAttribute("transform", "translate(" + p.x.toFixed(2) + "," + p.y.toFixed(2) + ")");
        sim.running = false; if (sim.raf) cancelAnimationFrame(sim.raf); return;
      }
      sim.raf = requestAnimationFrame(step);
    }
    function repour() {
      for (const p of nodes) {
        p.x = p.r + Math.random() * (W - 2 * p.r);
        p.y = -Math.random() * H * 0.6 - p.r;
        p.vx = 0; p.vy = 0;
      }
      if (!sim.running) { sim.running = true; sim.raf = requestAnimationFrame(step); }
    }

    // ── 右上角「重新倒入」按钮
    const cardEl = body.closest("article.card");
    const headEl = cardEl && cardEl.querySelector(".card-head");
    if (headEl) {
      const btn = document.createElement("button");
      btn.className = "repour-btn";
      btn.type = "button";
      btn.textContent = "重新倒入";
      btn.addEventListener("click", repour);
      headEl.appendChild(btn);
    }
  }

  /* ══════════════════════════════════════════════════════
     词缀扫描层 — ⑥⑧ 共用（PRD：Suffix_Ref.csv 去 BOM）
     匹配规则：词去掉已知前后缀后（含 i→y / 双写辅音两种常见交替），
     余下部分必须仍是词库中的词，才认定命中
  ══════════════════════════════════════════════════════ */
  let affixCache = null;

  function parseSuffixRef(text) {
    const prefixes = {}, suffixes = {};
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/); // PRD 已知坑：去 BOM
    for (const line of lines) {
      if (!line || !line.trim()) continue;
      const parts = line.split(",");
      const c0 = (parts[0] || "").trim().toLowerCase();
      const meaning = (parts[1] || "").trim();
      if (!c0 || c0.indexOf("-") < 0) continue; // 'v' / 'n' / 'adj' / '其他1' 等段落标题
      const variants = c0.split("/");
      for (let v of variants) {
        v = v.replace(/^[-–—]+|[-–—]+$/g, "").trim();
        if (!/^[a-z]{1,8}$/.test(v)) continue; // 过滤 '等'、括号说明、空串
        if (c0.indexOf("-") === 0 || /^[-–—]/.test(c0.trim())) {
          suffixes[v] = suffixes[v] || meaning;
        } else {
          prefixes[v] = prefixes[v] || meaning;
        }
      }
    }
    return { prefixes: prefixes, suffixes: suffixes };
  }

  function stemCandidate(wordSet, s) {
    if (s.length < 3) return null;
    if (wordSet.has(s)) return s;
    if (s.charAt(s.length - 1) === "i") {
      const t = s.slice(0, -1) + "y";
      if (wordSet.has(t)) return t;
    }
    if (s.length >= 4 && s.charAt(s.length - 1) === s.charAt(s.length - 2)) {
      const t = s.slice(0, -1);
      if (wordSet.has(t)) return t;
    }
    return null;
  }

  function buildAffixIndex() {
    if (affixCache) return affixCache;
    affixCache = Promise.all([
      fetch("data/Suffix_Ref.csv").then((r) => r.text()),
      loadJSON("data/vocab_entries.json"),
    ]).then((p) => {
      const t0 = (window.performance || Date).now();
      const ref = parseSuffixRef(p[0]);
      const corpus = buildCorpus(p[1]);
      const wordSet = new Set(corpus.entries);
      const singles = corpus.words;

      // 长词缀优先，避免 -ion 抢在 -ation 之前截断判断
      const preKeys = Object.keys(ref.prefixes).sort((a, b) => b.length - a.length);
      const sufKeys = Object.keys(ref.suffixes).sort((a, b) => b.length - a.length);

      const preCount = {}, sufCount = {}, pairs = {}, deriv = {};
      for (let wi = 0; wi < singles.length; wi++) {
        const w = singles[wi];
        const hp = [], hs = [];
        const c0 = w.charCodeAt(0);
        for (let i = 0; i < preKeys.length; i++) {
          const a = preKeys[i];
          if (w.length < a.length + 3 || c0 !== a.charCodeAt(0) || !w.startsWith(a)) continue;
          const stem = stemCandidate(wordSet, w.slice(a.length));
          if (stem) hp.push({ a: a, stem: stem });
        }
        for (let i = 0; i < sufKeys.length; i++) {
          const a = sufKeys[i];
          if (w.length < a.length + 3 || !w.endsWith(a)) continue;
          const stem = stemCandidate(wordSet, w.slice(0, w.length - a.length));
          if (stem) hs.push({ a: a, stem: stem });
        }
        for (let i = 0; i < hp.length; i++) {
          const m = hp[i];
          preCount[m.a] = (preCount[m.a] || 0) + 1;
          (deriv[m.stem] = deriv[m.stem] || []).push({ word: w, affix: m.a, type: "pre" });
        }
        for (let i = 0; i < hs.length; i++) {
          const m = hs[i];
          sufCount[m.a] = (sufCount[m.a] || 0) + 1;
          (deriv[m.stem] = deriv[m.stem] || []).push({ word: w, affix: m.a, type: "suf" });
        }
        if (hp.length && hs.length) {
          for (let i = 0; i < hp.length; i++) {
            for (let j = 0; j < hs.length; j++) {
              const key = hp[i].a + "|" + hs[j].a;
              const rec = pairs[key] || (pairs[key] = { n: 0, ex: [] });
              rec.n++;
              if (rec.ex.length < 5) rec.ex.push(w);
            }
          }
        }
      }

      const res = {
        ref: ref,
        corpus: corpus,
        preCount: preCount,
        sufCount: sufCount,
        pairs: pairs,
        deriv: deriv,
        _ms: Math.round((window.performance || Date).now() - t0),
      };
      console.info("[Dashboard] affix index built in " + res._ms + "ms");
      return res;
    });
    return affixCache;
  }

  /* ══════════════════════════════════════════════════════
     词条详情 + 发音（⑥ 派生词树悬停卡）
     data/word_detail.json（由 scripts/build_word_detail.py 生成）
       { words: { "<word>": { m: 中文释义, p: 音标, c: 词性标签（空格分隔） } } }
  ══════════════════════════════════════════════════════ */
  const WD = {};
  let wdDone = false;

  function loadWordDetail() {
    if (wdDone) return Promise.resolve(WD);
    return loadJSON("data/word_detail.json")
      .then((payload) => {
        const src = (payload && payload.words) || {};
        for (const w in src) WD[w] = src[w];
        console.info("[Dashboard] word detail loaded: " + Object.keys(WD).length + " words");
        wdDone = true;
        return WD;
      })
      .catch((e) => {
        console.warn("[Dashboard] word_detail.json 未加载，悬停只显示派生信息", e);
        wdDone = true;
        return WD;
      });
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
    );
  }

  const SPEAK_ICON =
    '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  // 设为词根按钮图标：与 SPEAK_ICON 同风格（线性、currentColor）的树杈图标
  const ROOT_ICON =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="7" cy="6" r="2.2"/><circle cx="7" cy="18" r="2.2"/><circle cx="17" cy="12" r="2.2"/>' +
    '<path d="M7 8.2v7.6"/><path d="M9 7c4.6 0 6.6 2 6.6 5"/></svg>';

  /* ── 发音引擎：系统 TTS 优先（自动挑最好听的英文音色），
        没有英文音色 / 浏览器不支持时回退在线音频 ── */
  const speech = {
    enabled: true,
    voices: [],

    ok() {
      return typeof window !== "undefined" && "speechSynthesis" in window;
    },

    init() {
      if (!this.ok()) return;
      const load = () => {
        try { this.voices = window.speechSynthesis.getVoices() || []; } catch (e) { this.voices = []; }
      };
      load();
      try { window.speechSynthesis.addEventListener("voiceschanged", load); } catch (e) { /* 老浏览器忽略 */ }
    },

    /** 挑最优英文音色：Natural/Neural/Premium > Google > 常见真人音 > en-US > 本地服务 */
    pick() {
      if (!this.voices || !this.voices.length) {
        this.voices = (this.ok() && window.speechSynthesis.getVoices()) || [];
      }
      const vs = this.voices.filter((v) => /^en/i.test(String(v.lang || "").replace("_", "-")));
      if (!vs.length) return null;
      const rank = (v) => {
        const n = (v.name || "") + " " + (v.voiceURI || "");
        let s = 0;
        if (/natural|neural|premium|enhanced/i.test(n)) s += 100;
        if (/google/i.test(n)) s += 60;
        if (/samantha|karen|daniel|aria|jenny|guy|libby|sonia|zira|hazel|serena/i.test(n)) s += 30;
        if (/^en[-_]us$/i.test(v.lang || "")) s += 10;
        if (v.localService) s += 5;
        return s;
      };
      return vs.slice().sort((a, b) => rank(b) - rank(a))[0];
    },

    /** 在线音频兜底（有道公开词典音频，英式 type=2） */
    audio(word, onState) {
      try {
        const a = new Audio("https://dict.youdao.com/dictvoice?type=2&audio=" + encodeURIComponent(word));
        if (onState) {
          onState(true);
          const off = () => onState(false);
          a.addEventListener("ended", off);
          a.addEventListener("error", off);
          setTimeout(off, 1500);   // 兜底：音频事件不触发也能收尾
        }
        a.play().catch(() => { if (onState) onState(false); });
      } catch (e) { if (onState) onState(false); }
    },

    /**
     * 朗读一个词
     * @param {string} word
     * @param {(on:boolean)=>void} [onState] 开始/结束回调（用于节点脉冲动画）
     */
    speak(word, onState) {
      if (!this.enabled || !word) return;
      this._fellBack = false;
      const v = this.ok() ? this.pick() : null;
      if (!v) { this.audio(word, onState); return; }
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.voice = v;
        u.lang = v.lang || "en-US";
        u.rate = 0.9;      // 稍慢，单词听得更清
        u.pitch = 1;
        u.volume = 1;
        if (onState) {
          u.onstart = () => onState(true);
          u.onend = () => { clearTimeout(this._off); onState(false); };
          u.onerror = () => {
            clearTimeout(this._off);
            // 系统 TTS 合成失败（无语音包 / 无音频设备）→ 退到在线音频，只退一次
            if (!this._fellBack) { this._fellBack = true; this.audio(word, onState); }
            else onState(false);
          };
        }
        // Chrome 在 cancel() 后立刻 speak 有概率静默，延迟一帧更稳
        setTimeout(() => {
          try { synth.speak(u); } catch (e) { this.audio(word, onState); if (onState) onState(false); }
        }, 60);
        if (onState) {
          // 先亮起（部分环境不触发 onstart），4s 兜底收尾
          onState(true);
          clearTimeout(this._off);
          this._off = setTimeout(() => onState(false), 4000);
        }
      } catch (e) {
        this.audio(word, onState);
      }
    },
  };
  speech.init();

  /** 统一词条悬停卡：单词 + 音标 + 词性 + 中文释义 */
  function wordTipHTML(word, extra) {
    const d = WD[word];
    const ipa = d && d.p ? d.p : "";
    const tags = d && d.c ? d.c.split(" ") : [];
    const mean = d && d.m ? d.m : "";

    let h =
      '<div class="tip-head">' +
        '<span class="tip-word">' + esc(word) + "</span>" +
        (ipa ? '<span class="tip-ipa">' + esc(ipa) + "</span>" : "") +
        '<span class="tip-say">' + SPEAK_ICON + "</span>" +
      "</div>";
    if (tags.length) {
      h += '<div class="tip-pos">' +
        tags.map((t) => '<span class="pos-chip">' + esc(POS_LABEL[t] || t) + "</span>").join("") +
        "</div>";
    }
    h += '<div class="tip-mean">' +
      (mean ? esc(mean) : '<span style="color:var(--text-3)">暂无中文释义</span>') +
      "</div>";
    if (extra) h += extra;
    return h;
  }

  /* ══════════════════════════════════════════════════════
     ⑥ 派生词树（径向树 + 碰撞松弛，无 D3）
  ══════════════════════════════════════════════════════ */
  const DERIVE_COLOR = { pre: "#f08a4b", suf: "#35b3a3", both: "#8b7cf6", more: "#9aa0a6" };

  function deriveChildren(idx, root, cap) {
    const seen = {}, out = [];
    const list = idx.deriv[root] || [];
    for (const m of list) {
      const ex = seen[m.word];
      if (ex) {
        if (ex.type !== m.type) { ex.type = "both"; ex.affix += " / " + m.affix; }
        continue;
      }
      seen[m.word] = { word: m.word, affix: m.affix, type: m.type };
      out.push(seen[m.word]);
    }
    out.sort((a, b) => a.word.length - b.word.length || (a.word < b.word ? -1 : 1));
    return { children: out.slice(0, cap), more: Math.max(0, out.length - cap), total: out.length };
  }

  function drawDeriveTree(body, idx) {
    // ── 候选词根：派生数最多的前 40 个
    const cands = Object.keys(idx.deriv)
      .map((w) => ({ w: w, n: idx.deriv[w].length }))
      .filter((d) => d.w.length >= 3 && d.n >= 3)
      .sort((a, b) => b.n - a.n || (a.w < b.w ? -1 : 1))
      .slice(0, 40);

    body.innerHTML = "";

    // ── 全词库去重派生词总数（标题下方展示用）
    const seenWord = new Set();
    let totalDerived = 0;
    for (const stem in idx.deriv) {
      for (const e of idx.deriv[stem]) {
        if (!seenWord.has(e.word)) { seenWord.add(e.word); totalDerived++; }
      }
    }
    const note = body.closest(".card") && body.closest(".card").querySelector(".card-note");
    if (note) {
      note.innerHTML =
        "共 <b>" + fmtNum(totalDerived) + "</b> 个派生词（去重）· 可选词根 " + cands.length +
        " 个 · 悬停看释义/音标 · 单击发音 · 双击换词根 · 右上可切「列表」视图";
    }

    // ── 左列表 + 右可视化 双栏布局
    const layout = el("div", "derive-layout");
    const listWrap = el("div", "derive-list");
    const listHead = el("div", "derive-list-head");
    listHead.innerHTML = '词根列表 <span class="derive-list-count">' + cands.length + "</span>";
    const list = el("div", "derive-list-items");
    listWrap.appendChild(listHead);
    listWrap.appendChild(list);

    const viz = el("div", "derive-viz");
    const toolbar = el("div", "derive-toolbar");

    // 展开深度（仅树状图显示），靠右
    const btnDepth = el("button", "hud-btn", "展开到深度 2");
    btnDepth.title = "展开到深度 2 查看多跳派生";

    // 显示方式切换：树状图 / 列表（左右分段 toggle）
    const seg = el("div", "derive-seg");
    const segTree = el("button", "hud-btn is-on", "树状图");
    const segList = el("button", "hud-btn", "列表");
    segTree.title = "径向树图：看派生关系";
    segList.title = "列表视图：一行一词，便于对比";
    segTree.addEventListener("click", () => {
      if (mode === "tree") return;
      mode = "tree";
      segTree.classList.add("is-on");
      segList.classList.remove("is-on");
      btnDepth.style.display = "";
      render();
    });
    segList.addEventListener("click", () => {
      if (mode === "list") return;
      mode = "list";
      segList.classList.add("is-on");
      segTree.classList.remove("is-on");
      btnDepth.style.display = "none";   // 列表只展示直接派生，深度按钮无意义
      render();
    });
    seg.appendChild(segTree);
    seg.appendChild(segList);
    toolbar.appendChild(seg);
    toolbar.appendChild(btnDepth);

    const crumbs = el("nav", "derive-crumbs");
    crumbs.style.display = "none";
    crumbs.addEventListener("click", (e) => {
      const b = e.target.closest(".dc-item");
      if (!b) return;
      const i = +b.dataset.i;
      path = path.slice(0, i + 1);
      selected = path[path.length - 1];
      syncList();
      render();
    });
    const svgWrap = el("div", "derive-svg-wrap");
    viz.appendChild(toolbar);
    viz.appendChild(crumbs);
    viz.appendChild(svgWrap);

    layout.appendChild(listWrap);
    layout.appendChild(viz);
    body.appendChild(layout);

    const foot = el("p", "donut-footnote");
    body.appendChild(foot);

    let depth = 1;
    let selected = cands[0].w;
    let mode = "tree";            // "tree" 径向树图 / "list" 列表视图
    let path = [selected];        // 派生根下钻历史：候选词根 → 设为词根/双击 逐级 append

    function syncList() {
      Array.from(list.children).forEach((c, i) =>
        c.classList.toggle("is-active", cands[i].w === selected)
      );
    }

    // 切换词根并维护 path：reset=true 表示从左侧候选词根重新开始；否则向下钻一级
    function setRoot(w, reset) {
      if (w === selected) return;
      if (reset) {
        path = [w];
      } else if (path.indexOf(w) !== -1) {
        path = path.slice(0, path.indexOf(w) + 1);   // 防环：已在路径中则截断到该级
      } else {
        path = path.concat(w);
      }
      selected = w;
      syncList();
      render();
    }

    // 派生路径面包屑：仅在已下钻（path.length > 1）时显示
    function updateCrumbs() {
      if (path.length <= 1) { crumbs.style.display = "none"; crumbs.innerHTML = ""; return; }
      crumbs.style.display = "";
      let html = '<span class="dc-label">派生路径</span>';
      path.forEach((w, i) => {
        if (i > 0) html += '<span class="dc-sep">›</span>';
        if (i < path.length - 1)
          html += '<button class="dc-item" data-i="' + i + '">' + esc(w) + "</button>";
        else
          html += '<span class="dc-current">' + esc(w) + "</span>";
      });
      crumbs.innerHTML = html;
    }

    // 左列表项（一次性构建，点击切换词根）
    cands.forEach((d) => {
      const it = el("button", "derive-list-item" + (d.w === selected ? " is-active" : ""));
      it.innerHTML = "<span>" + d.w + '</span><span class="n">' + d.n + "</span>";
      it.addEventListener("click", () => {
        setRoot(d.w, true);   // 候选词根 = 入口级，重置路径
      });
      list.appendChild(it);
    });

    function render() {
      const root = selected;
      const CAP = 30;
      const l1 = deriveChildren(idx, root, CAP);
      updateCrumbs();
      if (mode === "list") { renderList(root, l1, CAP); return; }

      const NS = "http://www.w3.org/2000/svg";
      const W = Math.max(360, svgWrap.clientWidth || 600);
      const H = depth === 1 ? 460 : 580;

      // ── 建树
      const nodes = [{ id: root, depth: 0, type: "root", label: root }];
      const links = [];
      const leafAng = [];

      function addLevel1() {
        l1.children.forEach((m) => {
          const node = { id: m.word, depth: 1, type: m.type, label: m.word, affix: m.affix, stem: root };
          nodes.push(node);
          links.push({ s: nodes[0], t: node, type: m.type, affix: m.affix });
          // 深度 2：只给「还有自己派生的词」挂第二层
          if (depth === 2) {
            const sub = deriveChildren(idx, m.word, 6);
            sub.children.forEach((m2) => {
              const n2 = { id: m2.word, depth: 2, type: m2.type, label: m2.word, affix: m2.affix, stem: m.word };
              nodes.push(n2);
              links.push({ s: node, t: n2, type: m2.type, affix: m2.affix });
            });
            if (sub.more > 0) {
              const n2 = { id: m.word + " +N", depth: 2, type: "more", label: "+" + sub.more, more: true };
              nodes.push(n2);
              links.push({ s: node, t: n2, type: "more", affix: "" });
            }
          }
        });
        if (l1.more > 0) {
          const node = { id: root + "+N", depth: 1, type: "more", label: "+" + l1.more, more: true };
          nodes.push(node);
          links.push({ s: nodes[0], t: node, type: "more", affix: "" });
        }
      }
      addLevel1();

      // ── 径向布局：叶子均分角度，深度定半径（椭圆铺满可用空间）
      const byDepth = [1, 0, 0];
      nodes.forEach((n) => (byDepth[n.depth] = (byDepth[n.depth] || 0) + 1));
      const leafCount = byDepth[2] || byDepth[1];
      // 叶子标签约需 34px 弧长；椭圆直接用满卡片，标签间距只会更宽裕
      const rx = Math.max(130, W / 2 - 84);
      const ry = Math.max(110, H / 2 - 46);
      const maxD = depth === 2 ? 2 : 1;
      let slot = 0;
      function place(n, ang0, ang1) {
        if (n.depth === maxD || !(n.id && idx.deriv[n.id] && n.depth < maxD)) {
          const mid = (ang0 + ang1) / 2;
          n.ang = mid;
          slot++;
          return;
        }
        // 有子节点：把角度区间分给子树
        const kids = links.filter((l) => l.s === n);
        const span = (ang1 - ang0) / kids.length;
        kids.forEach((l, i) => place(l.t, ang0 + span * i, ang0 + span * (i + 1)));
        n.ang = (ang0 + ang1) / 2;
      }
      const span0 = (2 * Math.PI) / leafCount;
      // 顶层节点（深度 1）均分整圆
      const top = links.filter((l) => l.s === nodes[0]);
      top.forEach((l, i) => place(l.t, -Math.PI / 2 + span0 * i, -Math.PI / 2 + span0 * (i + 1)));
      nodes[0].ang = -Math.PI / 2;
      nodes.forEach((n) => {
        const rr = maxD === 1 ? 1 : Math.max(n.depth, 1) / maxD;
        n.x = W / 2 + rx * rr * Math.cos(n.ang);
        n.y = H / 2 + ry * rr * Math.sin(n.ang);
      });

      // ── SVG
      svgWrap.innerHTML = "";
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "derive-svg");
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      svg.setAttribute("height", H);
      svgWrap.appendChild(svg);

      links.forEach((l) => {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("class", "derive-link");
        p.setAttribute("d",
          "M" + l.s.x.toFixed(1) + "," + l.s.y.toFixed(1) +
          " Q" + ((l.s.x + l.t.x) / 2).toFixed(1) + "," + ((l.s.y + l.t.y) / 2).toFixed(1) +
          " " + l.t.x.toFixed(1) + "," + l.t.y.toFixed(1));
        p.setAttribute("stroke", DERIVE_COLOR[l.type] || DERIVE_COLOR.more);
        if (l.type === "more") p.setAttribute("stroke-dasharray", "3 3");
        svg.appendChild(p);
      });

      nodes.forEach((n) => {
        const g = document.createElementNS(NS, "g");
        g.setAttribute("class", "derive-node");
        const c = document.createElementNS(NS, "circle");
        const r = n.depth === 0 ? 9 : n.type === "more" ? 5 : 6.5;
        c.setAttribute("cx", n.x.toFixed(1));
        c.setAttribute("cy", n.y.toFixed(1));
        c.setAttribute("r", r);
        c.setAttribute("fill", n.depth === 0 ? "var(--accent)" : (DERIVE_COLOR[n.type] || DERIVE_COLOR.more));
        if (n.type === "more") c.setAttribute("fill-opacity", "0.35");
        g.appendChild(c);

        const t = document.createElementNS(NS, "text");
        t.setAttribute("class", "derive-label");
        t.setAttribute("x", n.x.toFixed(1));
        t.setAttribute("y", (n.y + r + 12).toFixed(1));
        t.textContent = n.label;
        g.appendChild(t);

        if (!n.more) {
          const word = n.label;
          const canRoot = !!idx.deriv[word] && word !== selected;
          const affixTxt =
            n.type === "both" ? "前后缀" : n.type === "pre" ? "加前缀" : n.type === "suf" ? "加后缀" : "";
          const extra =
            (affixTxt ? '<div class="tip-row" style="margin-top:5px">' + affixTxt + "：<b>" + esc(n.affix) + "</b></div>" : "") +
            (n.depth > 0 ? '<div class="tip-row">词根：<b>' + esc(n.stem) + "</b></div>" : "") +
            '<div class="tip-hint">' + SPEAK_ICON +
              "<span>单击发音</span>" +
              (canRoot ? "<span>· 双击以此为词根</span>" : "") +
            "</div>";

          const enter = (ev) => {
            showTip(wordTipHTML(word, extra), ev.clientX, ev.clientY);
            hoverBus.emit({ type: "derive", word: word });
          };
          g.style.cursor = "pointer";
          g.addEventListener("mouseenter", enter);
          g.addEventListener("mousemove", enter);
          g.addEventListener("mouseleave", () => { hideTip(); hoverBus.emit(null); });

          // 单击 = 发音（朗读期间节点脉冲高亮）
          g.addEventListener("click", () => {
            speech.speak(word, (on) => g.classList.toggle("is-speaking", !!on));
          });
          // 双击 = 以该词为词根重绘
          g.addEventListener("dblclick", () => {
            if (!canRoot) return;
            hideTip();
            setRoot(word, false);   // 树状图双击下钻，追加路径
          });
        }
        svg.appendChild(g);
      });

      foot.innerHTML =
        '<span class="derive-legend">' +
        '<span><i style="background:' + DERIVE_COLOR.pre + '"></i>加前缀</span>' +
        '<span><i style="background:' + DERIVE_COLOR.suf + '"></i>加后缀</span>' +
        '<span><i style="background:' + DERIVE_COLOR.both + '"></i>前后缀都加</span>' +
        '<span><i style="background:' + DERIVE_COLOR.more + '"></i>折叠 / 未展开</span>' +
        "</span>" +
        "<br>构边规则：词 A 去掉词缀后仍是词库中的词（含 i→y、双辅音两种常见交替）才连边；" +
        "默认深度 1，单根最多 30 条边，超出折叠为 +N。" +
        '<br>交互：<b>悬停</b>看中文释义 / 音标 / 词性；<b>单击</b>朗读该词（朗读时节点脉冲）；<b>双击</b>以该词为词根重绘。' +
        (l1.total > CAP ? "当前词根共 " + l1.total + " 个派生，已显示 " + Math.min(CAP, l1.total) + " 个。" : "");
    }

    btnDepth.addEventListener("click", () => {
      depth = depth === 1 ? 2 : 1;
      btnDepth.textContent = depth === 1 ? "展开到深度 2" : "收回深度 1";
      render();
    });

    /* ── 列表视图：按派生方式分组，一行一词，左对齐便于对比 ── */
    function renderList(root, l1, CAP) {
      svgWrap.innerHTML = "";
      const wrap = el("div", "derive-list-view");

      const groups = [
        { key: "pre",  label: "加前缀",     color: DERIVE_COLOR.pre },
        { key: "suf",  label: "加后缀",     color: DERIVE_COLOR.suf },
        { key: "both", label: "前后缀都加", color: DERIVE_COLOR.both },
      ];

      groups.forEach((g) => {
        const items = l1.children.filter((m) => m.type === g.key).sort((a, b) => (a.word < b.word ? -1 : 1));
        if (!items.length) return;
        const sec = el("div", "dl-group");
        const head = el("div", "dl-group-head");
        head.innerHTML =
          '<span class="dl-dot" style="background:' + g.color + '"></span>' +
          g.label + ' <span class="dl-count">' + items.length + "</span>";
        sec.appendChild(head);

        items.forEach((m) => {
          const word = m.word;
          const d = WD[word] || {};
          const ipa = d.p || "";
          const tags = d.c ? d.c.split(" ").filter(Boolean) : [];
          const mean = d.m || "";
          const canRoot = !!idx.deriv[word] && word !== selected;

          const row = el("div", "dl-row");
          row.dataset.w = word;
          let html = '<span class="dl-word">' + esc(word) + "</span>";
          if (ipa) html += '<span class="dl-ipa">' + esc(ipa) + "</span>";
          if (tags.length)
            html += '<span class="dl-pos">' +
              tags.map((t) => '<span class="pos-chip">' + esc(POS_ABBR[t] || t) + "</span>").join("") +
              "</span>";
          // 中文释义放中间（flex 撑开），把「设为词根 + 派生方式」整体推到最右
          if (mean) html += '<span class="dl-mean">' + esc(mean) + "</span>";

          // 右对齐簇：设为词根 → 派生方式（加前缀 / 加后缀）
          let right = "";
          if (canRoot)
            right += '<button class="dl-root" data-w="' + esc(word) + '" title="以该词为词根重绘">' + ROOT_ICON + "<span>设为词根</span></button>";
          const badges = String(m.affix).split(" / ").map((tok) => {
            const suf = tok.charAt(0) === "-";
            return '<span class="dl-badge ' + (suf ? "suf" : "pre") + '">' +
              (suf ? "加后缀 " : "加前缀 ") + esc(tok) + "</span>";
          }).join("");
          right += '<span class="dl-affix">' + badges + "</span>";
          html += '<span class="dl-right">' + right + "</span>";
          row.innerHTML = html;
          sec.appendChild(row);
        });

        wrap.appendChild(sec);
      });

      if (l1.more > 0) {
        const more = el("div", "dl-more");
        more.textContent = "还有 " + l1.more + " 个派生未显示（单根最多 " + CAP + " 条）";
        wrap.appendChild(more);
      }

      svgWrap.appendChild(wrap);

      // 交互：单击整行发音；点「设为词根」换根（不触发发音）
      wrap.querySelectorAll(".dl-row").forEach((row) => {
        const w = row.dataset.w;
        row.addEventListener("click", (e) => {
          if (e.target.closest(".dl-root")) return;
          if (!speech.enabled) return;
          speech.speak(w, (on) => row.classList.toggle("is-speaking", !!on));
        });
      });
      wrap.querySelectorAll(".dl-root").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          setRoot(btn.dataset.w, false);   // 列表「设为词根」，追加路径
        });
      });

      foot.innerHTML =
        '<span class="derive-legend">' +
        '<span><i style="background:' + DERIVE_COLOR.pre + '"></i>加前缀</span>' +
        '<span><i style="background:' + DERIVE_COLOR.suf + '"></i>加后缀</span>' +
        '<span><i style="background:' + DERIVE_COLOR.both + '"></i>前后缀都加</span>' +
        "</span>" +
        "<br>列表模式：按派生方式分组、一行一词、左对齐便于对比；<b>单击整行</b>朗读该词（朗读时高亮），点「🌳 设为词根」以该词重绘。" +
        (l1.more > 0 ? "当前词根共 " + l1.total + " 个派生，已显示 " + Math.min(CAP, l1.total) + " 个。" : "");
    }

    render();
  }

  /* ══════════════════════════════════════════════════════
     ⑧ 词缀弦图（前缀半圆 × 后缀半圆，原生 SVG）
  ══════════════════════════════════════════════════════ */
  function drawChord(body, idx) {
    const TOPP = 14, TOPS = 16;
    const CHORD_PRE = "#8b7cf6", CHORD_SUF = "#35b3a3";

    const preList = Object.keys(idx.preCount)
      .map((k) => ({ a: k, n: idx.preCount[k], m: idx.ref.prefixes[k] || "" }))
      .sort((x, y) => y.n - x.n);
    const sufList = Object.keys(idx.sufCount)
      .map((k) => ({ a: k, n: idx.sufCount[k], m: idx.ref.suffixes[k] || "" }))
      .sort((x, y) => y.n - x.n);

    const pre = preList.slice(0, TOPP);
    const suf = sufList.slice(0, TOPS);
    const preSet = {}, sufSet = {};
    pre.forEach((d) => (preSet[d.a] = 1));
    suf.forEach((d) => (sufSet[d.a] = 1));

    // 弧长权重 = 视图内共现流量（没有共现的词缀给最小权重，保证出现在圆上）
    const flowP = {}, flowS = {};
    let totP = 0, totS = 0;
    pre.forEach((d) => (flowP[d.a] = 0));
    suf.forEach((d) => (flowS[d.a] = 0));
    Object.keys(idx.pairs).forEach((key) => {
      const pi = key.indexOf("|");
      const a = key.slice(0, pi), b = key.slice(pi + 1);
      if (!preSet[a] || !sufSet[b]) return;
      flowP[a] += idx.pairs[key].n;
      flowS[b] += idx.pairs[key].n;
    });
    pre.forEach((d) => { flowP[d.a] = Math.max(flowP[d.a], d.n * 0.12); totP += flowP[d.a]; });
    suf.forEach((d) => { flowS[d.a] = Math.max(flowS[d.a], d.n * 0.12); totS += flowS[d.a]; });

    const NS = "http://www.w3.org/2000/svg";
    const W = Math.max(360, body.clientWidth || 960);
    const H = 640;
    const cx = W / 2, cy = H / 2;
    const INSET = 14;
    const RX = W / 2 - 96, RY = H / 2 - 64;       // 外椭圆：横向吃满卡片宽度
    const RXI = RX - INSET, RYI = RY - INSET;     // 内椭圆：弧带厚度 = INSET
    const pol = (ang) => [cx + RX * Math.cos(ang), cy + RY * Math.sin(ang)];
    const polI = (ang) => [cx + RXI * Math.cos(ang), cy + RYI * Math.sin(ang)];

    body.innerHTML = "";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "chord-svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("height", H);
    body.appendChild(svg);

    // ── 分配弧段：前缀占左半（110°→250°），后缀占右半（-70°→70°）
    function totalFlow(list, flow) {
      let s = 0;
      list.forEach((d) => (s += flow[d.a]));
      return s || 1;
    }
    function alloc(list, flow, a0, a1) {
      const GAP = 0.014; // 弧间缝隙（弧度）
      const usable = (a1 - a0) - GAP * list.length;
      const tot = totalFlow(list, flow);
      let cur = a0;
      const out = [];
      list.forEach((d) => {
        const span = (flow[d.a] / tot) * usable;
        out.push({ d: d, s: cur + GAP / 2, e: cur + GAP / 2 + span });
        cur += span + GAP;
      });
      return out;
    }
    const D2R = Math.PI / 180;
    const arcsP = alloc(pre, flowP, 110 * D2R, 250 * D2R);
    const arcsS = alloc(suf, flowS, -70 * D2R, 70 * D2R);

    const allArcs = [];
    function drawArcs(arcs, color, kind) {
      arcs.forEach((rec) => {
        const large = rec.e - rec.s > Math.PI ? 1 : 0;
        const [x0, y0] = pol(rec.s), [x1, y1] = pol(rec.e);
        const [x2, y2] = polI(rec.e), [x3, y3] = polI(rec.s);
        const p = document.createElementNS(NS, "path");
        p.setAttribute("class", "chord-arc");
        p.setAttribute("d",
          "M" + x0 + "," + y0 + " A" + RX + "," + RY + " 0 " + large + " 1 " + x1 + "," + y1 +
          " L" + x2 + "," + y2 + " A" + RXI + "," + RYI + " 0 " + large + " 0 " + x3 + "," + y3 + "Z");
        p.setAttribute("fill", color);
        p.setAttribute("fill-opacity", "0.8");
        svg.appendChild(p);
        rec.node = p;
        rec.color = color;
        rec.kind = kind;
        allArcs.push(rec);

        // 标签
        const mid = (rec.s + rec.e) / 2;
        const left = Math.cos(mid) < 0;
        const _o = pol(mid);
        const lx = _o[0] + ((_o[0] - cx) / RX) * 8;
        const ly = _o[1] + ((_o[1] - cy) / RY) * 8;
        const t = document.createElementNS(NS, "text");
        t.setAttribute("class", "chord-lab");
        t.setAttribute("x", lx.toFixed(1));
        t.setAttribute("y", (ly + 4).toFixed(1));
        t.setAttribute("text-anchor", left ? "end" : "start");
        t.textContent = (kind === "pre" ? rec.d.a + "-" : "-" + rec.d.a);
        svg.appendChild(t);
        const t2 = document.createElementNS(NS, "text");
        t2.setAttribute("class", "chord-lab-n");
        t2.setAttribute("x", (left ? lx - 4 : lx + 4).toFixed(1));
        t2.setAttribute("y", (ly + 15).toFixed(1));
        t2.setAttribute("text-anchor", left ? "end" : "start");
        t2.textContent = fmtNum(rec.d.n);
        svg.appendChild(t2);
        rec.labelNodes = [t, t2];
      });
    }
    drawArcs(arcsP, CHORD_PRE, "pre");
    drawArcs(arcsS, CHORD_SUF, "suf");

    // ── 带状连接：每个词缀弧内按对端顺序切子弧
    function subAlloc(rec, items) {
      // items: [{key, n}] 已按对端顺序排好
      const GAP = 0.006;
      const usable = (rec.e - rec.s) - GAP * Math.max(0, items.length - 1);
      const tot = items.reduce((s, it) => s + it.n, 0) || 1;
      let cur = rec.s;
      return items.map((it) => {
        const span = (it.n / tot) * usable;
        const seg = { key: it.key, s: cur, e: cur + span, n: it.n, ex: it.ex };
        cur += span + GAP;
        return seg;
      });
    }

    const ribbons = [];
    arcsP.forEach((rp) => {
      const items = [];
      arcsS.forEach((rs) => {
        const key = rp.d.a + "|" + rs.d.a;
        const rec = idx.pairs[key];
        if (rec) items.push({ key: key, n: rec.n, ex: rec.ex, other: rs });
      });
      if (!items.length) return;
      subAlloc(rp, items).forEach((seg) => {
        const rs = seg.key.slice(seg.key.indexOf("|") + 1);
        const target = arcsS.find((a) => a.d.a === rs);
        const itemsS = [];
        arcsP.forEach((rp2) => {
          const key2 = rp2.d.a + "|" + rs;
          const rec2 = idx.pairs[key2];
          if (rec2) itemsS.push({ key: key2, n: rec2.n, ex: rec2.ex });
        });
        const segsS = subAlloc(target, itemsS);
        const segS = segsS.find((s) => s.key === seg.key);
        if (!segS) return;

        const [x0, y0] = pol(seg.s), [x1, y1] = pol(seg.e);
        const [x2, y2] = pol(segS.e), [x3, y3] = pol(segS.s);
        const la = seg.e - seg.s > Math.PI ? 1 : 0;
        const lb = segS.e - segS.s > Math.PI ? 1 : 0;
        const p = document.createElementNS(NS, "path");
        p.setAttribute("class", "chord-ribbon");
        p.setAttribute("d",
          "M" + x0 + "," + y0 + " A" + RX + "," + RY + " 0 " + la + " 1 " + x1 + "," + y1 +
          " Q" + cx + "," + cy + " " + x2 + "," + y2 +
          " A" + RX + "," + RY + " 0 " + lb + " 0 " + x3 + "," + y3 +
          " Q" + cx + "," + cy + " " + x0 + "," + y0 + " Z");
        p.setAttribute("fill", rp.color);
        p.setAttribute("fill-opacity", "0.22");
        svg.insertBefore(p, svg.firstChild); // 带子垫在弧下面
        ribbons.push({ node: p, segP: seg, segS: segS, rp: rp, rs: target });
      });
    });

    // ── 交互
    function dimAllExcept(fn) {
      ribbons.forEach((r) => r.node.classList.toggle("is-dim", !fn(r)));
      allArcs.forEach((a) => a.node.classList.toggle("is-dim", !fn({ rp: a, rs: a })));
    }
    ribbons.forEach((r) => {
      const tipHTML =
        "<div><b>" + r.rp.d.a + "- × -" + r.rs.d.a + "</b></div>" +
        "<div>" + fmtNum(r.segP.n) + " 个词同时命中</div>" +
        '<div style="margin-top:4px;color:var(--text-2)">示例：' +
        ((r.segP.ex || []).map((w) => "<b>" + w + "</b>").join("、") || "—") + "</div>";
      const enter = (ev) => {
        ribbons.forEach((o) => o.node.classList.toggle("is-dim", o !== r));
        allArcs.forEach((a) => a.node.classList.toggle("is-dim", a !== r.rp && a !== r.rs));
        showTip(tipHTML, ev.clientX, ev.clientY);
      };
      r.node.addEventListener("mouseenter", enter);
      r.node.addEventListener("mousemove", enter);
      r.node.addEventListener("mouseleave", () => {
        dimAllExcept(null);
        hideTip();
      });
    });
    allArcs.forEach((a) => {
      const meaning = a.d.m || "—";
      const tipHTML =
        "<div><b>" + (a.kind === "pre" ? a.d.a + "-" : "-" + a.d.a) + "</b> · " +
        (a.kind === "pre" ? "前缀" : "后缀") + "</div>" +
        "<div>命中 " + fmtNum(a.d.n) + " 词</div>" +
        '<div style="margin-top:4px;color:var(--text-2)">' + meaning + "</div>";
      const enter = (ev) => {
        ribbons.forEach((o) => o.node.classList.toggle("is-dim", o.rp !== a && o.rs !== a));
        allArcs.forEach((o) => o.node.classList.toggle("is-dim", o !== a));
        showTip(tipHTML, ev.clientX, ev.clientY);
      };
      a.node.addEventListener("mouseenter", enter);
      a.node.addEventListener("mousemove", enter);
      a.node.addEventListener("mouseleave", () => {
        dimAllExcept(null);
        hideTip();
      });
    });

    const foot = el("p", "donut-footnote");
    const totPairs = Object.keys(idx.pairs).length;
    foot.innerHTML =
      "圆环左半是出现最多的 " + pre.length + " 个前缀、右半是 " + suf.length +
      " 个后缀；一段弧线连接一对前后缀，线越粗代表同时带这对前后缀的词越多。<br>" +
      "全部前后缀组合共 " + fmtNum(totPairs) + " 种，这里展示最主要 " + ribbons.length +
      " 条。";
    body.appendChild(foot);
  }

  /* ══════════════════════════════════════════════════════
     CHART REGISTRY — 新增图表在此注册
     key 对应 HTML 里的 data-chart="key"
  ══════════════════════════════════════════════════════ */
  const CHART_REGISTRY = {
    "pos-donut": async (body) => {
      const payload = await loadJSON("data/word_pos.json");
      drawPosDonut(body, aggregatePos(payload));
    },
    "len-bars": async (body) => {
      drawLenBars(body, buildCorpus(await loadJSON("data/vocab_entries.json")));
    },
    "initial-cloud": async (body) => {
      drawInitialCloud(body, buildCorpus(await loadJSON("data/vocab_entries.json")));
    },
    "ngram-heat": async (body) => {
      drawNgramHeat(body, buildCorpus(await loadJSON("data/vocab_entries.json")));
    },
    "phonics": async (body) => {
      const corpus = buildCorpus(await loadJSON("data/vocab_entries.json"));
      drawPhonics(body, buildPhonicsIndex(corpus.words));
    },
    "syllable": async (body) => {
      const [vocab, ipa] = await Promise.all([
        loadJSON("data/vocab_entries.json"),
        loadJSON("data/ipa.json"),
      ]);
      drawSyllable(body, buildSyllableIndex(vocab.entries, ipa));
    },
    "umap-scatter": async (body) => {
      const p = await Promise.all([
        loadJSON("data/word_coords.json"),
        loadJSON("data/cluster_names.json"),
      ]);
      drawScatter(body, p[0], p[1]);
    },
    "cluster-bubbles": async (body) => {
      const p = await Promise.all([
        loadJSON("data/cluster_centers.json"),
        loadJSON("data/cluster_names.json"),
      ]);
      drawBubbles(body, p[0], p[1]);
    },
    "derive-tree": async (body) => {
      // 词条详情 2.2MB，与词缀索引并行拉取；失败也不阻塞出图
      const [idx] = await Promise.all([buildAffixIndex(), loadWordDetail()]);
      drawDeriveTree(body, idx);
    },
    "affix-chord": async (body) => {
      drawChord(body, await buildAffixIndex());
    },
  };

  /* ══════════════════════════════════════════════════════
     LAZY RENDER — IntersectionObserver 滚入视口才绘制
  ══════════════════════════════════════════════════════ */
  function initCards() {
    const cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-chart]"));
    if (!cards.length) return;

    const render = async (card) => {
      const key = card.getAttribute("data-chart");
      const body = card.querySelector(".card-body");
      const draw = CHART_REGISTRY[key];
      if (!draw || !body) return;
      try {
        await draw(body);
      } catch (e) {
        body.innerHTML = '<div class="card-error">图表加载失败：' + (e && e.message ? e.message : e) + "</div>";
        console.error("[Dashboard] chart '" + key + "' failed:", e);
      }
    };

    if (!("IntersectionObserver" in window)) {
      cards.forEach(render);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          render(entry.target);
        });
      },
      { rootMargin: "200px 0px" }
    );
    cards.forEach((c) => io.observe(c));
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function boot() {
    loadInitial();
    initCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // 暴露给开发工具 / 后续步骤
  window.__dashboard = { renderStats, fmtNum, fmtPct, loadJSON, hoverBus, showTip, hideTip };
})();
