

      /* ═══════════════════════════════════════
   CSV PARSER (lightweight)
═══════════════════════════════════════ */
      const Papa = {
        parse(text) {
          return {
            data: text.split(/\r?\n/).map((line) => {
              const cols = [];
              let cur = "",
                inQ = false;
              for (const c of line) {
                if (c === '"') {
                  inQ = !inQ;
                  continue;
                }
                if (c === "," && !inQ) {
                  cols.push(cur);
                  cur = "";
                  continue;
                }
                cur += c;
              }
              cols.push(cur);
              return cols;
            }),
          };
        },
      };

      /* ═══════════════════════════════════════
   THEME — Material Design 3
═══════════════════════════════════════ */
      function applyTheme(t) {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("vocab-theme", t);
        document.getElementById("themeToggle").textContent =
          t === "light" ? "🌙" : "☀️";
        document.getElementById("themeToggle").title =
          t === "light" ? "Switch to Dark" : "Switch to Light";
      }
      applyTheme(localStorage.getItem("vocab-theme") || "dark");
      document.getElementById("themeToggle").addEventListener("click", () => {
        applyTheme(
          document.documentElement.getAttribute("data-theme") === "dark"
            ? "light"
            : "dark",
        );
      });

      /* ═══════════════════════════════════════
   GLOBAL STATE
═══════════════════════════════════════ */
      let vocab = [],
        suffixList = [];
      let currentFilter = {
        suffix: null,
        suffixType: null,
        pos: "All",
        letter: null,
      };
      let lastScrollTop = 0,
        showAllDef = false;
      let currentPage = 0;
      const PAGE_SIZE = 40;
      let filteredVocab = [];
      const isMobile = () => window.innerWidth <= 1024;

      /* ═══════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════ */
      if (!localStorage.getItem("vocab-onboarded")) {
        document.getElementById("onboardOverlay").style.display = "flex";
      }
      document
        .getElementById("onboardDismiss")
        .addEventListener("click", () => {
          document.getElementById("onboardOverlay").style.display = "none";
          localStorage.setItem("vocab-onboarded", "1");
        });

      /* ═══════════════════════════════════════
   SKELETON
═══════════════════════════════════════ */
      function showSkeletons(n = 12) {
        document.getElementById("grid").innerHTML = Array(n)
          .fill(
            `<div class="skeleton">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line sub"></div>
            <div class="skeleton-line sub2"></div>
        </div>`,
          )
          .join("");
      }

      /* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
window.addEventListener("load", () => {
  // 1. 先显示骨架屏
  if (typeof showSkeletons === "function") showSkeletons();

  // 2. 加载词库列表（带分类标题美化）
  fetch("data/list.json")
    .then((r) => r.json())
    .then((data) => {
      const sel = document.getElementById("vocabSelect");
      if (!sel) return;
      sel.innerHTML = "";

      // 遍历列表生成选项
      data.vocabs.forEach((n) => {
        if (n === "---") return; // 自动跳过横线

        if (n.endsWith(".csv")) {
          // 真正的词库选项
          const o = document.createElement("option");
          o.value = `data/${n}`;
          o.textContent = "    " + n.replace(".csv", ""); // 加缩进更美观
          sel.appendChild(o);
        } else {
          // 分类标题（如：【雅思】）
          const g = document.createElement("option");
          g.disabled = true; // 禁止点击
          g.textContent = `── ${n} ──`;
          g.className = "vocab-group-title"; // 对应之前给你的 CSS
          g.style.color = "var(--md-primary)";
          g.style.fontWeight = "bold";
          sel.appendChild(g);
        }
      });

      // 3. 初始加载第一个有效的词库和后缀
      const firstValidVocab = data.vocabs.find(v => v.endsWith(".csv"));
      const firstSuffix = data.suffixes ? data.suffixes[0] : null;

      Promise.all([
        firstValidVocab ? loadVocab(`data/${firstValidVocab}`) : Promise.resolve(),
        firstSuffix ? loadSuffix(`data/${firstSuffix}`) : Promise.resolve(),
      ]);
    })
    .catch(() =>
      showError("无法加载 data/list.json，请检查路径"),
    );
});

      /* ═══════════════════════════════════════
   LOAD VOCAB / SUFFIX
═══════════════════════════════════════ */
      function loadVocab(url) {
        showSkeletons();
        return fetch(url)
          .then((r) => r.text())
          .then((text) => {
            const { data } = Papa.parse(text.trim());
            vocab = data
              .filter((r) => r[0] && r[1])
              .map((r) => ({
                word: r[0].trim(),
                def: r[1].trim(),
                pos: r[1].match(/[a-z]+\./g) || [],
              }));
            updatePOSMenu();
            updateAZBar();
            applyFilters();
          })
          .catch(() => showError("Failed to load vocab: " + url));
      }

      function loadSuffix(url) {
        return fetch(url)
          .then((r) => r.text())
          .then((text) => {
            suffixList = [];
            Papa.parse(text.trim()).data.forEach((r) => {
              if (!r[0]) return;
              r[0].split("/").forEach((p) => {
                p = p.trim();
                if (!p) return;
                const isPrefix = p.endsWith("-") && !p.startsWith("-");
                const type = isPrefix ? "prefix" : "suffix";
                const s = p.replace(/-/g, "").trim();
                if (s)
                  suffixList.push({ suffix: s, meaning: r[1] || "", type });
              });
            });
            renderSuffixControls();
          });
      }

      /* ═══════════════════════════════════════
   POS MENU
═══════════════════════════════════════ */
      function updatePOSMenu() {
        const posList = ["All", ...new Set(vocab.flatMap((v) => v.pos))];
        // Populate both mobile pos-bar and desktop top-bar-pos
        ["pos-container", "topBarPos"].forEach((id) => {
          const box = document.getElementById(id);
          box.innerHTML = "";
          posList.forEach((p) => {
            const btn = document.createElement("button");
            btn.className =
              "pos-btn" + (p === currentFilter.pos ? " active" : "");
            btn.textContent = p;
           btn.onclick = () => {
    currentFilter.pos = (p !== 'All' && currentFilter.pos === p) ? 'All' : p;
    updatePOSMenu();
    applyFilters();
};
            box.appendChild(btn);
          });
        });
      }

      /* ═══════════════════════════════════════
   A-Z BAR
═══════════════════════════════════════ */
      function updateAZBar() {
        const bar = document.getElementById("azBar");
        bar.innerHTML = "";
        const letterCounts = {};
        vocab.forEach((v) => {
          const l = v.word[0]?.toUpperCase();
          if (l && l >= "A" && l <= "Z")
            letterCounts[l] = (letterCounts[l] || 0) + 1;
        });
        const allBtn = document.createElement("button");
        allBtn.className =
          "az-btn" + (currentFilter.letter === null ? " active" : "");
        allBtn.textContent = "All";
        allBtn.onclick = () => {
          currentFilter.letter = null;
          updateAZBar();
          applyFilters();
        };
        bar.appendChild(allBtn);

        for (let i = 65; i <= 90; i++) {
          const letter = String.fromCharCode(i);
          const count = letterCounts[letter] || 0;
          const btn = document.createElement("button");
          btn.className =
            "az-btn" +
            (currentFilter.letter === letter ? " active" : "") +
            (count === 0 ? " has-no-data" : "");
          btn.textContent = letter;
          btn.onclick = () => {
            currentFilter.letter =
              currentFilter.letter === letter ? null : letter;
            updateAZBar();
            applyFilters();
          };
          bar.appendChild(btn);
        }
      }

      /* ═══════════════════════════════════════
   SUFFIX CONTROLS
═══════════════════════════════════════ */
function renderSuffixControls(filterText = "") {
  const q = filterText.toLowerCase();
  const sidebarContainer = document.getElementById("suffix-container");
  const mobileNav = document.getElementById("mobileBottomNav");

  if (!sidebarContainer || !mobileNav) return;
  sidebarContainer.innerHTML = "";
  mobileNav.innerHTML = "";

  // 1. 组合列表，添加 "All" 开头
  const items = [{ suffix: null, meaning: " ", type: null }, ...suffixList];

  items.forEach((item) => {
    // 2. 搜索过滤
    if (q && item.suffix && !item.suffix.toLowerCase().includes(q) && !item.meaning.toLowerCase().includes(q)) return;

    // 3. 【核心修改】判定是否为 CSV 里的标题行（如 adj,,,,）
    // 逻辑：如果这个项只有第一个格子有字(suffix)，但第二个格子(meaning)是空的，它就是标题
    const isHeader = item.suffix && (!item.meaning || item.meaning.trim() === "");

    if (isHeader) {
      // 渲染 PC 侧边栏大标题
      const groupLabel = document.createElement("div");
      groupLabel.className = "suffix-group-label";
      groupLabel.textContent = item.suffix.toUpperCase(); // 显示 ADJ, N, V
      sidebarContainer.appendChild(groupLabel);
      
      // 渲染手机底栏小标签
      const mobileGroupTag = document.createElement("span");
      mobileGroupTag.className = "mobile-group-tag";
      mobileGroupTag.textContent = item.suffix.toUpperCase();
      mobileNav.appendChild(mobileGroupTag);
      
      return; // 标题行不生成按钮，直接跳过
    }

    // 4. 正常按钮渲染逻辑
    const isActive = currentFilter.suffix === item.suffix;
    const label = item.suffix || "ALL";

    // PC 按钮
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (isActive ? " active" : "");
    btn.innerHTML = `<span class="sfx">${label}</span><span class="meaning">${item.meaning}</span>`;
    btn.onclick = () => toggleSuffix(item.suffix, item.type);
    sidebarContainer.appendChild(btn);

    // 手机按钮
    const pill = document.createElement("button");
    pill.className = "suffix-pill" + (isActive ? " active" : "");
    pill.textContent = label;
    pill.onclick = () => {
      toggleSuffix(item.suffix, item.type);
      if(document.getElementById("grid")) document.getElementById("grid").scrollTop = 0;
    };
    mobileNav.appendChild(pill);
  });
}
      // Sidebar search
      document.getElementById("suffixSearch").addEventListener("input", (e) => {
        renderSuffixControls(e.target.value);
      });

      function toggleSuffix(s, type) {
        if (currentFilter.suffix === s) {
          currentFilter.suffix = null;
          currentFilter.suffixType = null;
        } else {
          currentFilter.suffix = s;
          currentFilter.suffixType = type;
        }
        renderSuffixControls(document.getElementById("suffixSearch").value);
        applyFilters();
        if (isMobile()) {
          document.getElementById("grid").scrollTop = 0;
        }
      }

      /* ═══════════════════════════════════════
   IPA
═══════════════════════════════════════ */
      function getIPACache() {
        try {
          return JSON.parse(localStorage.getItem("ipa-cache") || "{}");
        } catch {
          return {};
        }
      }
      function setIPACache(word, ipa) {
        const cache = getIPACache();
        cache[word] = ipa;
        const keys = Object.keys(cache);
        if (keys.length > 5000)
          keys.slice(0, keys.length - 5000).forEach((k) => delete cache[k]);
        localStorage.setItem("ipa-cache", JSON.stringify(cache));
      }
      async function fetchIPA(word, element) {
        const cache = getIPACache();
        if (word in cache) {
          element.textContent = cache[word];
          if (cache[word]) element.style.opacity = "0.8";
          return;
        }
        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
          );
          if (!res.ok) {
            setIPACache(word, "");
            element.textContent = "";
            return;
          }
          const data = await res.json();
          const ipa =
            data[0]?.phonetics?.find((p) => p.text)?.text ||
            data[0]?.phonetic ||
            "";
          setIPACache(word, ipa);
          element.textContent = ipa;
          if (ipa) element.style.opacity = "0.8";
        } catch {
          setIPACache(word, "");
          element.textContent = "";
        }
      }

      // IntersectionObserver-based IPA — no hard cap, loads as cards enter viewport
      const ipaObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const card = entry.target;
              const ipaEl = card.querySelector(".word-phonetic");
              if (ipaEl && ipaEl.textContent === "...")
                fetchIPA(card.dataset.word, ipaEl);
              ipaObserver.unobserve(card);
            }
          });
        },
        { threshold: 0.1 },
      );

      // Separate observer for load-more auto-trigger
      const loadMoreObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadMoreObserver.unobserve(entry.target);
              currentPage++;
              renderNextPage();
            }
          });
        },
        { threshold: 0.5 },
      );

      /* ═══════════════════════════════════════
   FILTER + PAGINATION
═══════════════════════════════════════ */
              function applyFilters() {
        if (spellingState && spellingState.active) exitSpellingMode(false);
        if (playerState && playerState.active) stopPlayer();
        filteredVocab = vocab;


        if (currentFilter.pos !== "All")
          filteredVocab = filteredVocab.filter((v) =>
            v.pos.includes(currentFilter.pos),
          );
        if (currentFilter.suffix) {
          const s = currentFilter.suffix.toLowerCase();
          const type = currentFilter.suffixType || "suffix";
          filteredVocab = filteredVocab.filter((v) => {
            const w = v.word.toLowerCase();
            return type === "prefix" ? w.startsWith(s) : w.endsWith(s);
          });
        }
        if (currentFilter.letter) {
          const l = currentFilter.letter;
          filteredVocab = filteredVocab.filter(
            (v) => v.word[0]?.toUpperCase() === l,
          );
        }

        document.getElementById("match-count").textContent =
          filteredVocab.length;
        document.getElementById("total-count").textContent = vocab.length;
        document.getElementById("match-percent").textContent = vocab.length
          ? ((filteredVocab.length / vocab.length) * 100).toFixed(1) + "%"
          : "0%";

        currentPage = 0;
        document.getElementById("grid").innerHTML = "";
         // ✅ 新增：清空前断开旧 Observer，防止内存泄漏
        ipaObserver.disconnect();
        loadMoreObserver.disconnect();

        if (!filteredVocab.length) {
          document.getElementById("grid").innerHTML =
            `<div class="empty-state"><div class="icon">🔍</div><p>No words match this filter.<br>Try a different combination.</p></div>`;
          return;
        }
        renderNextPage();
      }

      function renderNextPage() {
        const grid = document.getElementById("grid");
        const oldTrigger = grid.querySelector(".load-more-wrapper");
        if (oldTrigger) oldTrigger.remove();

        const start = currentPage * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, filteredVocab.length);
        const slice = filteredVocab.slice(start, end);

        const frag = document.createDocumentFragment();
        const sfxReg = currentFilter.suffix
          ? new RegExp(
              currentFilter.suffixType === "prefix"
                ? "^" + currentFilter.suffix
                : currentFilter.suffix + "$",
              "i",
            )
          : null;

        slice.forEach((item) => {
          const card = createCard(item, sfxReg);
          frag.appendChild(card);
          ipaObserver.observe(card);
        });
        grid.appendChild(frag);

        if (end < filteredVocab.length) {
          const wrapper = document.createElement("div");
          wrapper.className = "load-more-wrapper";
          wrapper.innerHTML = `<button class="load-more-btn">Load more (${end} / ${filteredVocab.length})</button>`;
          wrapper.querySelector("button").onclick = () => {
            currentPage++;
            renderNextPage();
          };
          grid.appendChild(wrapper);
          // Auto-load when sentinel enters viewport
          loadMoreObserver.observe(wrapper);
        }

        if (showAllDef) grid.classList.add("show-all-def");
      }

      /* ═══════════════════════════════════════
   CARD CREATION
═══════════════════════════════════════ */
      const esc = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      function createCard(item, sfxReg) {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.word = item.word;
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "article");
        card.setAttribute("aria-label", item.word);

        let wordHTML = esc(item.word);
        if (sfxReg)
          wordHTML = wordHTML.replace(
            sfxReg,
            (m) => `<span class="highlight">${m}</span>`,
          );
        const w = encodeURIComponent(item.word);

        card.innerHTML = `
    <div class="card-inner">
        <div class="word-header">
            <div class="word-text">${wordHTML}</div>
        </div>
        <div class="word-phonetic" data-word="${esc(item.word)}">...</div>
        <div class="word-def">${esc(item.def)}</div>
        <div class="card-links">
            <a href="https://dict.eudic.net/dicts/en/${w}" target="_blank" class="dict-link en-cn" title="Eudic">中文</a>
            <a href="https://www.onelook.com/?w=${w}&phrases=1" target="_blank" class="dict-link en-en" title="OneLook">EN↗</a>
            <a href="https://www.ldoceonline.com/dictionary/${w}" target="_blank" class="dict-link en-cn" title="Longman">Lang</a>
        </div>
    </div>`;
        let cardAudio = null;
        function playWord() {
          // 播放器运行中时不重复播放音频，避免冲突
          if (playerState && playerState.active && playerState.playing) {
            card.classList.add("viewed");
            return;
          }
          // 停掉本卡片之前的音频
          if (cardAudio) { cardAudio.pause(); cardAudio = null; }
          // 停掉拼写模式的音频，避免重叠
          if (spellingState && spellingState.audio) {
            spellingState.audio.pause();
            spellingState.audio.onended = null;
            spellingState.audio.onerror = null;
            spellingState.audio = null;
          }
          card.classList.add("speaking", "viewed");

          const audio = new Audio(
            `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(item.word)}&type=2`,
          );
          cardAudio = audio;
          audio.play().catch(() => {});
          audio.onended = () => { card.classList.remove("speaking"); cardAudio = null; };
          audio.onerror = () => { card.classList.remove("speaking"); cardAudio = null; };
        }


               card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;

          // ✅ 播放模式：点击任意卡片跳转到该位置播放
          if (playerState && playerState.active) {
            const idx = filteredVocab.findIndex(v => v.word === item.word);
            if (idx !== -1) {
              clearTimeout(playerState.timer);
              if (playerState.audio) {
                playerState.audio.pause();
                playerState.audio.onended = null;
                playerState.audio.onerror = null;
                playerState.audio = null;
              }
              document.querySelectorAll(".card.now-playing").forEach(c => c.classList.remove("now-playing"));
              document.querySelectorAll(".card.revealed").forEach(c => c.classList.remove("revealed"));

              playerState.currentIndex = idx;
              playerState.repeatIndex = 0;
              playerState.playing = true;
              updatePlayerProgress();
              playCurrentWord();
            }
            return;
          }

          // 拼写模式
          if (document.body.classList.contains("spelling-mode") && spellingState) {
            if (!spellingState.started && spellingState.currentIndex === -1) return;
            if (spellingState.finished) { playWord(); return; }
            if (spellingState.started) {
              const activeCard = document.querySelector(".card.spelling-active");
              if (card === activeCard && e.target.closest(".spelling-input-wrap")) return;
            }
          }

          playWord();
        });




                card.addEventListener("keydown", (e) => {
          if (document.body.classList.contains("spelling-mode") && spellingState && spellingState.started) {
            const activeCard = document.querySelector(".card.spelling-active");
            if (card === activeCard) return;
          }

          if (e.key === " " || e.key === "Enter") {

            e.preventDefault();
            playWord();
          }
        });


        return card;
      }

      /* ═══════════════════════════════════════
   UI EVENT HANDLERS
═══════════════════════════════════════ */
     document.getElementById("toggleAllBtn").addEventListener("click", function () {
  const grid = document.getElementById("grid");
  const label = this.querySelector('.label');
  const icon = this.querySelector('.icon');

  if (isMobile()) {
    const hiding = grid.classList.toggle("hide-all-def");
    this.classList.toggle("active", hiding);
    label.textContent = hiding ? "Show All" : "Hide All";
    icon.textContent = hiding ? "👁" : "🙈";
  } else {
    showAllDef = !showAllDef;
    grid.classList.toggle("show-all-def", showAllDef);
    this.classList.toggle("active", showAllDef);
    label.textContent = showAllDef ? "Hide All" : "Show All";
    icon.textContent = showAllDef ? "🙈" : "👁";
  }
});

      document
        .getElementById("vocabSelect")
        .addEventListener("change", (e) => loadVocab(e.target.value));

      document.getElementById("viewToggleBtn").addEventListener("click", function () {
  const grid = document.getElementById("grid");
  const label = this.querySelector('.label');
  const icon = this.querySelector('.icon');
  
  const isList = grid.classList.toggle("list-view");
  label.textContent = isList ? "Card" : "List";
  icon.textContent = isList ? "⊞" : "☰";
  localStorage.setItem("vocab-view", isList ? "list" : "card");
});


/* ═══════════════════════════════════════
   AUTO-PLAY PLAYER
═══════════════════════════════════════ */
let playerState = {
  active: false,
  playing: false,
  currentIndex: -1,
  repeatCount: 1,
  repeatIndex: 0,
  hideWords: false,
  timer: null,
  audio: null,
};

// ── 入口按钮（顶部工具栏） ──
document.getElementById("playModeBtn").addEventListener("click", () => {
  if (playerState.active) {
    stopPlayer();
  } else {
    startPlayer();
  }
});

function startPlayer() {
  if (filteredVocab.length === 0) return;
  if (spellingState && spellingState.active) exitSpellingMode(true);
  playerState.active = true;
lastScrollTop = 0; // ✅ 新增：重置滚动方向判断
  playerState.playing = false;
  playerState.currentIndex = 0;
  playerState.repeatIndex = 0;
  document.getElementById("playerBar").style.display = "flex";
  document.body.classList.add("player-active");
  document.getElementById("playModeBtn").classList.add("active");
  document.getElementById("playModeBtn").querySelector(".icon").textContent = "⏹";
  updatePlayerProgress();
  playCurrentWord();
}

function stopPlayer() {
  playerState.active = false;
  playerState.playing = false;
   playerState.hideWords = false;                          // ✅ 新增
  document.getElementById("grid").classList.remove("hide-words"); // ✅ 新增
  document.getElementById("playerHide").classList.remove("active"); // ✅ 新增
  clearTimeout(playerState.timer);
  if (playerState.audio) {
    playerState.audio.pause();
    playerState.audio.onended = null;
    playerState.audio.onerror = null;
    playerState.audio = null;
  }
  document.querySelectorAll(".card.now-playing").forEach(c => c.classList.remove("now-playing"));
  document.querySelectorAll(".card.revealed").forEach(c => c.classList.remove("revealed"));
  document.getElementById("playerBar").style.display = "none";
  document.body.classList.remove("player-active");
            // 恢复被隐藏的导航栏
          document.getElementById("topBar").classList.remove("nav-hidden-top");
          document.getElementById("posBar").classList.remove("nav-hidden-top");
          document.getElementById("azBar").classList.remove("nav-hidden-top");
          document.getElementById("mobileBottomNav").classList.remove("nav-hidden-bottom");
          lastScrollTop = 0;

  document.getElementById("playModeBtn").classList.remove("active");
  document.getElementById("playModeBtn").querySelector(".icon").textContent = "▶";
  document.getElementById("playerPlay").textContent = "▶";
}

function playCurrentWord() {
  if (!playerState.active) return;
  if (playerState.currentIndex >= filteredVocab.length) { stopPlayer(); return; }

  playerState.playing = true;
  document.getElementById("playerPlay").textContent = "⏸";

  // 清除旧高亮
  document.querySelectorAll(".card.now-playing").forEach(c => c.classList.remove("now-playing"));
  document.querySelectorAll(".card.revealed").forEach(c => c.classList.remove("revealed"));

  const word = filteredVocab[playerState.currentIndex].word;
  let targetCard = null;
  document.querySelectorAll(".card").forEach(c => {
    if (c.dataset.word === word) {
      c.classList.add("now-playing", "viewed");
      targetCard = c;
    }
  });

  // 隐藏模式下显示当前卡片
  if (playerState.hideWords && targetCard) {
    targetCard.classList.add("revealed");
  }

  // 自动滚动到当前卡片
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // ✅ 修改：传入 onSkip 回调，跳过时给卡片一个视觉提示
  playWordAudio(word, () => {
    if (targetCard) {
      targetCard.classList.add("no-audio");
      setTimeout(() => targetCard.classList.remove("no-audio"), 2000);
    }
  });
}

function playWordAudio(word, onSkip) {
  if (!playerState.active) return;

  // 停掉上一段
  if (playerState.audio) {
    playerState.audio.pause();
    playerState.audio.onended = null;
    playerState.audio.onerror = null;
    playerState.audio.onloadedmetadata = null;
    playerState.audio = null;
  }

  // 防止 play().catch 和 onerror 双重触发
  let moved = false;
  function safeNext() {
    if (moved) return;
    moved = true;
    playerState.repeatIndex = 0;
    scheduleNext();
  }

  const audio = new Audio(
    `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`
  );
  audio.playbackRate = parseFloat(document.getElementById("playerSpeed").value) || 1;
  playerState.audio = audio;

  // 检测空音频 / 无效音频
  audio.addEventListener("loadedmetadata", () => {
    if (!audio.duration || isNaN(audio.duration) || audio.duration < 0.1) {
      audio.pause();
      if (typeof onSkip === "function") onSkip();
      safeNext();
    }
  }, { once: true });

  audio.play().catch(() => safeNext());

  audio.onended = () => {
    if (moved) return;
    playerState.repeatIndex++;
    if (playerState.repeatIndex < playerState.repeatCount) {
      setTimeout(() => {
        if (playerState.active) playWordAudio(word, onSkip);
      }, 400);
    } else {
      safeNext();
    }
  };

  audio.onerror = () => safeNext();
}


function scheduleNext() {
  const sec = parseInt(document.getElementById("playerInterval").value) || 0;
  if (sec === 0) { goToNext(); return; }
  playerState.timer = setTimeout(goToNext, sec * 1000);
}

function goToNext() {
  if (!playerState.active) return;
  playerState.currentIndex++;
  updatePlayerProgress();
  if (playerState.currentIndex >= filteredVocab.length) {
    // ✅ 修改：全部播完，停止播放但不关闭播放器栏
    playerState.playing = false;
    clearTimeout(playerState.timer);
    if (playerState.audio) {
      playerState.audio.pause();
      playerState.audio.onended = null;
      playerState.audio.onerror = null;
      playerState.audio = null;
    }
    document.querySelectorAll(".card.now-playing").forEach(c => c.classList.remove("now-playing"));
    document.getElementById("playerPlay").textContent = "▶";
    return;
  }
  playCurrentWord();
}


function goToPrev() {
  if (!playerState.active || playerState.currentIndex <= 0) return;
  clearTimeout(playerState.timer);
  if (playerState.audio) {
    playerState.audio.pause();
    playerState.audio.onended = null;
    playerState.audio.onerror = null;
    playerState.audio = null;
  }
  playerState.currentIndex--;
  playerState.repeatIndex = 0;
  updatePlayerProgress();
  playCurrentWord();
}

function updatePlayerProgress() {
  document.getElementById("playerProgress").textContent =
    (playerState.currentIndex + 1) + "/" + filteredVocab.length;
}

// ── 播放器按钮事件 ──
document.getElementById("playerPlay").addEventListener("click", () => {
  if (!playerState.active) return;
  if (playerState.playing) {
    playerState.playing = false;
    clearTimeout(playerState.timer);
    if (playerState.audio) playerState.audio.pause();
    document.getElementById("playerPlay").textContent = "▶";
  } else {
    playCurrentWord();
  }
});

document.getElementById("playerPrev").addEventListener("click", goToPrev);

document.getElementById("playerNext").addEventListener("click", () => {
  if (!playerState.active) return;
  clearTimeout(playerState.timer);
  if (playerState.audio) {
    playerState.audio.pause();
    playerState.audio.onended = null;
    playerState.audio.onerror = null;
    playerState.audio = null;
  }
  playerState.repeatIndex = 0;
  goToNext();
});

document.getElementById("playerRepeat").addEventListener("change", (e) => {
  playerState.repeatCount = parseInt(e.target.value) || 1;
});

// ── 隐藏单词开关 ──
document.getElementById("playerHide").addEventListener("click", () => {
  playerState.hideWords = !playerState.hideWords;
  document.getElementById("grid").classList.toggle("hide-words", playerState.hideWords);
  document.getElementById("playerHide").classList.toggle("active", playerState.hideWords);
});

// ── 关闭播放器 ──
document.getElementById("playerClose").addEventListener("click", stopPlayer);

// ── 隐藏模式下：点击卡片临时翻牌 ──
document.getElementById("grid").addEventListener("click", (e) => {
  if (!playerState.hideWords) return;
  if (playerState.active && playerState.playing) return;
  if (e.target.closest("a")) return;
  const card = e.target.closest(".card");
  if (card) {
    card.classList.add("revealed");
    setTimeout(() => {
      if (!card.classList.contains("now-playing")) {
        card.classList.remove("revealed");
      }
    }, 3000);
  }
});


/* ═══════════════════════════════════════
   SPELLING MODE
═══════════════════════════════════════ */
let spellingState = {
  active: false,
  started: false,
  finished: false,       // ✅ 新增：review 阶段标志
  currentIndex: -1,
  vocabList: [],
  results: [],
  audio: null,
  waitingForEnter: false,
   showWords: false,      // ✅ 新增：显示/隐藏单词
};

// ── Button Events ──
document.getElementById("spellingModeBtn").addEventListener("click", () => {
  if (spellingState.active) {
    exitSpellingMode(true);
  } else {
    enterSpellingMode();
  }
});
document.getElementById("spellSkip").addEventListener("click", skipSpelling);
document.getElementById("spellListen").addEventListener("click", relistenSpelling);
document.getElementById("spellExit").addEventListener("click", () => exitSpellingMode(true));

document.getElementById("statsRetry").addEventListener("click", retryWrongWords);
document.getElementById("statsClose").addEventListener("click", () => {
  document.getElementById("spellingStats").style.display = "none";
  document.getElementById("spellingBar").style.display = "flex";
  document.getElementById("spellSkip").style.display = "none";
  document.getElementById("spellListen").style.display = "none";
  document.getElementById("spellHints").style.display = "none";

  const speedOpt = document.getElementById("spellSpeed").closest(".player-opt");
  if (speedOpt) speedOpt.style.display = "none";
  document.getElementById("spellProgress").textContent = "Review";
  spellingState.started = false;
});

// ✅ 移到外面：拼写引导弹窗（只注册一次）
document.getElementById("spellingIntroDismiss").addEventListener("click", () => {
  document.getElementById("spellingIntro").style.display = "none";
  document.getElementById("spellProgress").textContent = "Click any word to start";
});

document.getElementById("spellingIntro").addEventListener("click", (e) => {
  if (e.target === document.getElementById("spellingIntro")) {
    document.getElementById("spellingIntro").style.display = "none";
  }
});

// ✅ 移到外面：显示/隐藏单词（只注册一次）
document.getElementById("spellShowWords").addEventListener("click", () => {
  spellingState.showWords = !spellingState.showWords;
  document.body.classList.toggle("spelling-show-words", spellingState.showWords);
  const btn = document.getElementById("spellShowWords");
  btn.textContent = spellingState.showWords ? "🙈" : "👁";
  btn.title = spellingState.showWords ? "Hide words" : "Show words";
  btn.classList.toggle("active", spellingState.showWords);
});


// Spelling bar click → refocus input (except selects)
document.getElementById("spellingBar").addEventListener("mouseup", (e) => {
  if (e.target.closest("select")) return;
  setTimeout(() => {
    const ac = document.querySelector(".card.spelling-active");
    if (ac) { const inp = ac.querySelector(".spelling-input"); if (inp) inp.focus(); }
  }, 10);
});

// ── Grid Click for Spelling ──
document.getElementById("grid").addEventListener("click", (e) => {
  if (!spellingState.active) return;
  if (spellingState.finished) return; // ✅ 新增：review 阶段不拦截，让卡片自己发音
  if (e.target.closest("a")) return;
  const card = e.target.closest(".card");
  if (!card) return;

  if (!spellingState.started) {
    const idx = parseInt(card.dataset.spellIndex);
    if (isNaN(idx)) return;
    startSpellingFrom(idx);
  } else {
    const ac = document.querySelector(".card.spelling-active");
    if (ac) { const inp = ac.querySelector(".spelling-input"); if (inp) inp.focus(); }
  }
});

// ── Enter ──
function enterSpellingMode(wordList) {
  const list = wordList || filteredVocab;
  if (list.length === 0) return;
  if (playerState && playerState.active) stopPlayer();

  spellingState.active = true;
  spellingState.started = false;
   spellingState.finished = false;          // ✅ 新增
  spellingState.showWords = false;         // ✅ 新增
  spellingState.currentIndex = -1;
  spellingState.vocabList = [...list];
  spellingState.results = new Array(list.length).fill(null);
  spellingState.waitingForEnter = false;

  const grid = document.getElementById("grid");
  grid.classList.remove("show-all-def", "hide-all-def", "hide-words");
  grid.innerHTML = "";

  const frag = document.createDocumentFragment();
  list.forEach((item, i) => {
    const card = createCard(item, null);
    card.dataset.spellIndex = i;
    frag.appendChild(card);
    ipaObserver.observe(card);
  });
  grid.appendChild(frag);

  document.querySelectorAll("#grid .card").forEach((card, i) => {
    const seq = document.createElement("div");
    seq.className = "card-seq";
    seq.textContent = i + 1;
    card.appendChild(seq);
  });

  // ✅ 拼写栏显示
  document.getElementById("spellingBar").style.display = "flex";

  // ✅ 未开始拼写：隐藏 Skip / Listen / Speed，只留提示和退出
  document.getElementById("spellSkip").style.display = "none";
  document.getElementById("spellListen").style.display = "none";
  document.getElementById("spellShowWords").style.display = "none";  // ✅ 新增：未开始时隐藏


  const speedOpt = document.getElementById("spellSpeed").closest(".player-opt");
  if (speedOpt) speedOpt.style.display = "none";
document.getElementById("spellHints").style.display = "none";      // ✅ 新增：未开始时隐藏
  // ✅ 提示文字（不是进度数字）
    document.getElementById("spellProgress").textContent = "0 / " + list.length;


  document.getElementById("spellingStats").style.display = "none";
  document.body.classList.add("spelling-mode");
  document.body.classList.remove("spelling-started", "spelling-show-words"); // ✅ 确保干净
  // 注意：不加 spelling-started，所以单词全部可见
  document.getElementById("spellingModeBtn").classList.add("active");
  document.getElementById("spellingModeBtn").querySelector(".icon").textContent = "⏹";
   // ✅ 新增：显示引导弹窗
  document.getElementById("spellingIntro").style.display = "flex";
}


// ── Exit ──
function exitSpellingMode(rerender) {
  if (spellingState.audio) {
    spellingState.audio.pause();
    spellingState.audio.onended = null;
    spellingState.audio.onerror = null;
    spellingState.audio = null;
  }
  spellingState.active = false;
  spellingState.started = false;

  document.getElementById("spellingBar").style.display = "none";
    document.getElementById("spellSkip").style.display = "none";
  document.getElementById("spellListen").style.display = "none";
  const speedOpt = document.getElementById("spellSpeed").closest(".player-opt");
  if (speedOpt) speedOpt.style.display = "none";


  document.getElementById("spellingStats").style.display = "none";
  document.body.classList.remove("spelling-started"); // ✅ 新增
   document.body.classList.remove("spelling-show-words"); // ✅ 新增
  spellingState.finished = false;                        // ✅ 新增
  spellingState.showWords = false;                       // ✅ 新增
  document.getElementById("spellShowWords").textContent = "👁"; // ✅ 重置图标
  document.getElementById("spellShowWords").classList.remove("active");
  document.getElementById("spellingIntro").style.display = "none"; // ✅ 关闭弹窗
  document.body.classList.remove("spelling-mode");
  document.getElementById("spellingModeBtn").classList.remove("active");
  document.getElementById("spellingModeBtn").querySelector(".icon").textContent = "✏️";

  if (rerender) {
    currentPage = 0;
    document.getElementById("grid").innerHTML = "";
    renderNextPage();
  }
}

// ── Start from Card ──
function startSpellingFrom(index) {
  spellingState.started = true;
  spellingState.currentIndex = index;

  // ✅ 触发 CSS 隐藏所有单词
  document.body.classList.add("spelling-started");

  // ✅ 显示操作按钮
  document.getElementById("spellSkip").style.display = "";
  document.getElementById("spellListen").style.display = "";
  document.getElementById("spellShowWords").style.display = "";  // ✅ 显示 show/hide
  const speedOpt = document.getElementById("spellSpeed").closest(".player-opt");
  if (speedOpt) speedOpt.style.display = "";
  document.getElementById("spellHints").style.display = "";      // ✅ 显示快捷键提示

  activateSpellingCard(index);
}



// ── Activate Card ──
function activateSpellingCard(index) {
  if (index >= spellingState.vocabList.length) { finishSpelling(); return; }

  spellingState.currentIndex = index;
  spellingState.waitingForEnter = false;

  const word = spellingState.vocabList[index].word;
  const card = document.querySelector(`.card[data-spell-index="${index}"]`);
  if (!card) { spellingState.results[index] = "skipped"; advanceSpelling(); return; }

  // Deactivate previous
  document.querySelectorAll(".card.spelling-active").forEach(c => {
    c.classList.remove("spelling-active");
    const w = c.querySelector(".spelling-input-wrap");
    if (w) w.remove();
  });

  card.classList.add("spelling-active");

  // Insert input (CSS hides word-text/word-def automatically)
  const wrap = document.createElement("div");
  wrap.className = "spelling-input-wrap";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "spelling-input";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.autocorrect = "off";
  input.spellcheck = false;
  input.maxLength = word.length;
  wrap.appendChild(input);

  const inner = card.querySelector(".card-inner");
  inner.insertBefore(wrap, inner.firstChild);
  input.focus();

  input.addEventListener("keydown", handleSpellingKeydown);
  input.addEventListener("input", handleSpellingInput);

  card.scrollIntoView({ behavior: "smooth", block: "center" });
  playSpellingAudio(word);
  updateSpellProgress();
}


// ── Keydown ──
function handleSpellingKeydown(e) {
  e.stopPropagation();
  if (e.key === "Enter") {

    e.preventDefault();
    if (spellingState.waitingForEnter) { advanceSpelling(); }
    else { submitSpelling(); }
  }
  if (e.key === " ") {
    e.preventDefault();
    relistenSpelling();
  }
}


// ── Input (auto-submit on length match) ──
function handleSpellingInput() {
  if (spellingState.waitingForEnter) return;
  const idx = spellingState.currentIndex;
  if (idx < 0 || idx >= spellingState.vocabList.length) return;
  const correctLen = spellingState.vocabList[idx].word.length;
  const card = document.querySelector(`.card[data-spell-index="${idx}"]`);
  if (!card) return;
  const input = card.querySelector(".spelling-input");
  if (!input) return;
  if (input.value.length >= correctLen) {
    input.disabled = true; // ✅ 新增：防止重复触发
    setTimeout(() => submitSpelling(), 150);
  }
}

// ── Submit ──
function submitSpelling() {
  const idx = spellingState.currentIndex;
  if (idx < 0 || !spellingState.started) return;
  const card = document.querySelector(`.card[data-spell-index="${idx}"]`);
  if (!card) return;
  const input = card.querySelector(".spelling-input");
  if (!input) return;

  const correct = spellingState.vocabList[idx].word.toLowerCase();
  const answer = input.value.trim().toLowerCase();

  const wrap = card.querySelector(".spelling-input-wrap");
  if (wrap) wrap.remove();

  if (answer === correct) {
    spellingState.results[idx] = "correct";
    card.classList.add("spelling-correct");
    card.classList.remove("spelling-active");
    showWordAndDef(card);
    setTimeout(() => advanceSpelling(), 400);
  } else {
    spellingState.results[idx] = "wrong";
    card.classList.add("spelling-wrong");
    card.classList.remove("spelling-active");
    spellingState.waitingForEnter = true;
    showLetterComparison(card, answer, correct);
    showWordAndDef(card);
  }
}

function showWordAndDef(card) {
  card.classList.add("spelling-answered");
}


// ── Letter Comparison ──
function showLetterComparison(card, userAns, correct) {
  const wrap = document.createElement("div");
  wrap.className = "spelling-compare";

  let uHTML = "";
  const max = Math.max(userAns.length, correct.length);
  for (let i = 0; i < max; i++) {
    const uc = userAns[i] || "";
    const cc = correct[i] || "";
    if (!uc) uHTML += `<span class="spell-char missing">${cc}</span>`;
    else if (uc === cc) uHTML += `<span class="spell-char correct">${uc}</span>`;
    else uHTML += `<span class="spell-char wrong">${uc}</span>`;
  }

  let aHTML = "";
  for (let i = 0; i < correct.length; i++) {
    aHTML += `<span class="spell-char">${correct[i]}</span>`;
  }

  wrap.innerHTML =
    `<div class="compare-row compare-user">${uHTML}</div>` +
    `<div class="compare-row compare-answer">${aHTML}</div>`;

  const inner = card.querySelector(".card-inner");
  const header = card.querySelector(".word-header");
  inner.insertBefore(wrap, header);
}

// ── Advance ──
function advanceSpelling() {
  spellingState.waitingForEnter = false;
  const next = spellingState.currentIndex + 1;
  if (next >= spellingState.vocabList.length) { finishSpelling(); }
  else { activateSpellingCard(next); }
}

// ── Skip ──
function skipSpelling() {
  const idx = spellingState.currentIndex;
  if (idx < 0 || idx >= spellingState.vocabList.length) return;
  spellingState.results[idx] = "skipped";
  const card = document.querySelector(`.card[data-spell-index="${idx}"]`);
  if (card) {
    card.classList.remove("spelling-active");
    const w = card.querySelector(".spelling-input-wrap");
    if (w) w.remove();
    card.classList.add("spelling-skipped");
    showLetterComparison(card, "", spellingState.vocabList[idx].word.toLowerCase());
    showWordAndDef(card);
  }
  advanceSpelling();
}

// ── Re-listen ──
function relistenSpelling() {
  const idx = spellingState.currentIndex;
  if (idx < 0 || idx >= spellingState.vocabList.length) return;
  playSpellingAudio(spellingState.vocabList[idx].word);
}

// ── Play Audio ──
function playSpellingAudio(word) {
  if (spellingState.audio) {
    spellingState.audio.pause();
    spellingState.audio.onended = null;
    spellingState.audio.onerror = null;
  }
  const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`);
  audio.playbackRate = parseFloat(document.getElementById("spellSpeed").value) || 1;
  spellingState.audio = audio;
  audio.play().catch(() => {});
}

// ── Finish ──
function finishSpelling() {
  spellingState.started = false;
  spellingState.finished = true;                    // ✅ 新增：进入 review 阶段
  document.body.classList.remove("spelling-started"); // ✅ 新增：结束后所有卡片显示结果
  document.getElementById("spellHints").style.display = "none"; // ✅ 新增：隐藏快捷键
   document.getElementById("spellShowWords").style.display = "none"; // ✅ 新增：Review 阶段隐藏
  if (spellingState.audio) { spellingState.audio.pause(); spellingState.audio = null; }

  const c = spellingState.results.filter(r => r === "correct").length;
  const w = spellingState.results.filter(r => r === "wrong").length;
  const s = spellingState.results.filter(r => r === "skipped").length;
  const t = spellingState.vocabList.length;
  const rate = t > 0 ? ((c / t) * 100).toFixed(1) : "0";

  document.getElementById("statsCorrect").textContent = c;
  document.getElementById("statsWrong").textContent = w;
  document.getElementById("statsSkipped").textContent = s;
  document.getElementById("statsRate").textContent = rate + "%";
    // ✅ 新增：全部正确时隐藏 Retry 按钮
  document.getElementById("statsRetry").style.display =
    (w === 0 && s === 0) ? "none" : "";

  document.getElementById("spellingBar").style.display = "none";
  document.getElementById("spellingStats").style.display = "flex";
}

// ── Retry Wrong ──
function retryWrongWords() {
  const wrong = spellingState.vocabList.filter((_, i) =>
    spellingState.results[i] === "wrong" || spellingState.results[i] === "skipped"
  );
  if (wrong.length === 0) return;
  if (spellingState.audio) { spellingState.audio.pause(); spellingState.audio = null; }

  spellingState.active = true;
  spellingState.started = false;
  spellingState.currentIndex = -1;
  spellingState.vocabList = wrong;
  spellingState.results = new Array(wrong.length).fill(null);
  spellingState.waitingForEnter = false;
  spellingState.finished = false;                    // ✅ 新增
  spellingState.showWords = false;                   // ✅ 新增
  document.body.classList.remove("spelling-show-words"); // ✅ 新增
   document.getElementById("spellShowWords").textContent = "👁";       // ✅ 新增
  document.getElementById("spellShowWords").classList.remove("active"); // ✅ 新增
    document.body.classList.remove("spelling-started"); // ✅ 新增：重试时单词重新可见

  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();
  wrong.forEach((item, i) => {
    const card = createCard(item, null);
    card.dataset.spellIndex = i;
    frag.appendChild(card);
  });
  grid.appendChild(frag);

  document.querySelectorAll("#grid .card").forEach((card, i) => {
    const seq = document.createElement("div");
    seq.className = "card-seq";
    seq.textContent = i + 1;
    card.appendChild(seq);
  });

  document.getElementById("spellingBar").style.display = "flex";
    document.getElementById("spellSkip").style.display = "";           // ✅ 新增：恢复显示
  document.getElementById("spellListen").style.display = "";         // ✅ 新增：恢复显示
  const speedOpt = document.getElementById("spellSpeed").closest(".player-opt");
  if (speedOpt) speedOpt.style.display = "";     
  document.getElementById("spellingStats").style.display = "none";
  updateSpellProgress();
}

// ── Progress ──
function updateSpellProgress() {
  const cur = spellingState.currentIndex + 1;
  const total = spellingState.vocabList.length;
  document.getElementById("spellProgress").textContent = cur + "/" + total;
}

// ── Document-level: Enter/Space when input is removed (wrong answer) ──
document.addEventListener("keydown", (e) => {
  if (!spellingState.active || !spellingState.started) return;
  if (e.key === "Enter" && spellingState.waitingForEnter) {
    e.preventDefault();
    advanceSpelling();
  }
  if (e.key === " " && spellingState.waitingForEnter) {
    e.preventDefault();
    relistenSpelling();
  }
});






      /* ═══════════════════════════════════════
   SCROLL — hide/show top bars on mobile
═══════════════════════════════════════ */
      const grid = document.getElementById("grid");
      grid.addEventListener(
        "scroll",
        () => {
          if (!isMobile()) return;
          // 播放器运行时不隐藏导航栏
                    if ((playerState && playerState.active) || (spellingState && spellingState.active)) return;

          const st = grid.scrollTop;
          const down = st > lastScrollTop && st > 60;
          document
            .getElementById("topBar")
            .classList.toggle("nav-hidden-top", down);
          document
            .getElementById("posBar")
            .classList.toggle("nav-hidden-top", down);
          document
            .getElementById("azBar")
            .classList.toggle("nav-hidden-top", down);
          document
            .getElementById("mobileBottomNav")
            .classList.toggle("nav-hidden-bottom", down);
          lastScrollTop = Math.max(0, st);
        },
        { passive: true },
      );


      function showError(msg) {
        document.getElementById("grid").innerHTML =
          `<div class="empty-state"><div class="icon">⚠️</div><p>${msg}</p></div>`;
      }
 