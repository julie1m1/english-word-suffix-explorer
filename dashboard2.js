/* ══════════════════════════════════════════════════════
   DASHBOARD V2 · 全屏铺满自适应薄壳
   图表逻辑 100% 复用 dashboard.js，本文件只做一件事：
   内容区宽度变了 → 把「已经画过的」图按新宽度重画一次。
   （V1 的图表在绘制那一刻读取容器宽度后就定终身，只有语义地图自带 resize。）
══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var DEBOUNCE = 250;   // ms：拖动窗口时不要每帧重画
  var MIN_DELTA = 24;   // px：小于这个宽度变化不值得重画
  var LOCK = 600;       // ms：一次重画还没铺完时，后来的变化排队等下一次

  function start() {
    var main = document.querySelector(".dash-main");
    if (!main || typeof ResizeObserver !== "function") return;

    var lastW = main.clientWidth;
    var timer = null;
    var lockedUntil = 0;

    function flush() {
      timer = null;
      if (typeof window.__dashRedraw !== "function") return;
      if (Date.now() < lockedUntil) { schedule(); return; }  // 上一轮还在画，稍后再来
      lockedUntil = Date.now() + LOCK;
      window.__dashRedraw();
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(flush, DEBOUNCE);
    }

    /* 网格列数在 1500px 处会跳档，卡片宽度突变；其余情况是连续变化。
       两种都只需要盯住主内容区实际宽度的增量。 */
    new ResizeObserver(function () {
      var w = main.clientWidth;
      if (Math.abs(w - lastW) < MIN_DELTA) return;
      lastW = w;
      schedule();
    }).observe(main);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  /* ══════════════════════════════════════════════════════
     ④ 首字母分布 · V2 版式（参考用户给的柱状图）
     左侧刻度短横与柱子双端圆角是纯 CSS；字母保持在柱底下方、逐柱居中。
     这里只做两件事：① 把柱高等比放大到图区实际高度；② 统一标签字号
     （原来「字号随数量放大」的编码取消，否则各标签高度不同、柱区高度会不齐）。
     重绘（改窗口宽 / 切主题）会重建 DOM，所以用 MutationObserver 重来一遍。
  ══════════════════════════════════════════════════════ */
  var HEADROOM = 2;   // 最高柱与图区顶边之间留的呼吸空间（px）

  function decorateInitial(root) {
    if (!root) return;
    var cols = root.querySelectorAll(".letter-col");
    if (!cols.length) return;

    var i, col, bar, track, h;
    for (i = 0; i < cols.length; i++) {
      col = cols[i];
      var ch = col.querySelector(".letter-ch");
      if (ch) ch.style.fontSize = "";               // 统一字号（CSS 给 12.5px）
    }

    track = cols[0].querySelector(".letter-track");
    var trackH = track ? track.clientHeight : 0;
    if (trackH < 40) return;                        // 尚未布局（隐藏/未滚动到）就别乱缩

    var max = 0;
    for (i = 0; i < cols.length; i++) {
      bar = cols[i].querySelector(".letter-bar");
      h = bar ? (parseFloat(bar.style.height) || 0) : 0;
      if (h > max) max = h;
    }
    if (!max) return;
    var k = (trackH - HEADROOM) / max;
    for (i = 0; i < cols.length; i++) {
      bar = cols[i].querySelector(".letter-bar");
      if (!bar) continue;
      h = parseFloat(bar.style.height) || 0;
      bar.style.height = Math.max(2, h * k).toFixed(1) + "px";
    }
  }

  function watchInitial() {
    var card = document.querySelector('.card[data-chart="initial-cloud"]');
    var body = card && card.querySelector(".card-body");
    if (!body || typeof MutationObserver !== "function") return;
    decorateInitial(body);
    new MutationObserver(function () {
      decorateInitial(body);
    }).observe(body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchInitial);
  } else {
    watchInitial();
  }
})();
