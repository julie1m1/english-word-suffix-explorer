

      /* ═══════════════════════════════════════
   CSV PARSER (lightweight)
═══════════════════════════════════════ */
      const Papa = {
        parse(text) {
          // 支持引号内换行（多行释义字段）与转义引号 "" 的轻量 CSV 解析
          const rows = [];
          let cols = [],
            cur = "",
            inQ = false;
          for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (c === '"') {
              if (inQ && text[i + 1] === '"') {
                cur += '"';
                i++;
                continue;
              }
              inQ = !inQ;
              continue;
            }
            if (c === "," && !inQ) {
              cols.push(cur);
              cur = "";
              continue;
            }
            if ((c === "\n" || c === "\r") && !inQ) {
              if (c === "\r" && text[i + 1] === "\n") i++;
              cols.push(cur);
              rows.push(cols);
              cols = [];
              cur = "";
              continue;
            }
            cur += c;
          }
          if (cur !== "" || cols.length) {
            cols.push(cur);
            rows.push(cols);
          }
          return { data: rows };
        },
      };

      /* ═══════════════════════════════════════
   ICON SYSTEM — Heroicons 24/Outline
═══════════════════════════════════════ */
      const ICONS = {
        'eye': '<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>',
        'eye-slash': '<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c1.691 0 3.318-.42 4.754-1.173M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>',
        'squares-2x2': '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"/>',
        'list-bullet': '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>',
        'play': '<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/>',
        'pause': '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5"/>',
        'forward': '<path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"/>',
        'backward': '<path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.189v8.622ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.622Z"/>',
        'pencil-square': '<path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>',
        'sun': '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>',
        'moon': '<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>',
        'x-mark': '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>',
        'speaker-wave': '<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>',
        'sparkles': '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>',
        'funnel': '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"/>',
        'magnifying-glass': '<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>',
        'exclamation-triangle': '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>',
      };

      function icon(name, size = 20) {
        const paths = ICONS[name] || ICONS['eye'];
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${paths}</svg>`;
      }

      /* ═══════════════════════════════════════
   AUDIO CACHE — 预加载 + 复用
══════════════════════════════════════ */
      const AudioCache = {
        _map: new Map(),
        _MAX: 10,
        _url(w) {
          return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(w)}&type=2`;
        },
        get(word) {
          return this._map.get(word) || null;
        },
        set(word, audio) {
          if (this._map.size >= this._MAX) {
            const first = this._map.keys().next().value;
            const old = this._map.get(first);
            if (old) { old.pause(); old.src = ''; }
            this._map.delete(first);
          }
          this._map.set(word, audio);
        },
        preload(word) {
          if (this._map.has(word)) return;
          const audio = new Audio(this._url(word));
          audio.preload = 'auto';
          audio.addEventListener('canplaythrough', () => {
            this.set(word, audio);
          }, { once: true });
          audio.addEventListener('error', () => {
            audio.src = '';
          }, { once: true });
          audio.load();
        },
        preloadAhead(words, startIdx, count) {
          for (let i = 1; i <= count; i++) {
            const idx = startIdx + i;
            if (idx < words.length) this.preload(words[idx].word);
          }
        },
        clear() {
          this._map.forEach(a => { a.pause(); a.src = ''; });
          this._map.clear();
        }
      };

      /* ═══════════════════════════════════════
   THEME — Material Design 3
══════════════════════════════════════ */
      function applyTheme(t) {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("vocab-theme", t);
        document.getElementById("themeToggle").innerHTML =
          t === "light" ? icon("moon") : icon("sun");
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
      // 词缀可筛出词数缓存：key = "小写词缀|类型"，仅在词库变化时重算
      let suffixCounts = null,
        suffixCountsVocab = null;
      let currentFilter = {
        suffix: null,
        suffixType: null,
        pos: "All",
        letter: null,
        phonics: null,
        syllable: null, // { nSyl, anchors, focus, vce, diph }
        search: null,
        cluster: null, // 语义分类簇号（int）或 null
      };
      let clusterData = null; // { wordMap: {word:{cluster,name}}, clusters: [{id,name,count}] }
      let categoryOpen = false; // 分类标签栏是否展开
      // 侧边栏词缀排序：null=CSV 原序 | "desc"=各分类内多→少 | "asc"=各分类内少→多
      let suffixSortMode = (() => {
        const v = localStorage.getItem("vocab-suffix-sort");
        return v === "desc" || v === "asc" ? v : null;
      })();
      let allBookUrls = []; // 全部词库 CSV 路径（用于 All Books 合并加载）
      let lastScrollTop = 0,
        showAllDef = false;
      let azSortOrder = null; // null = 不排序, 'asc' = A→Z, 'desc' = Z→A
      let currentPage = 0;
      const PAGE_SIZE = 40;
      let filteredVocab = [];
      const isMobile = () => window.innerWidth <= 1024;

      /* ═══════════════════════════════════════
   SYLLABLE STRUCTURE (音节结构)
═══════════════════════════════════════ */
      // 词库实际出现的全部音节骨架（16 种，每行按开头辅音数 0/1/2/3 排列）
      const SYLLABLE_SKELS = [
        "V", "VC", "VCC", "VCCC",
        "CV", "CVC", "CVCC", "CVCCC",
        "CCV", "CCVC", "CCVCC", "CCVCCC",
        "CCCV", "CCCVC", "CCCVCC", "CCCVCCC",
      ];
      const SYLLABLE_META = {
        ready: false,
        total: 0, // 有本地音标且可解析出骨架的词数
        nsCount: {}, // 音节数(1..4, 5=5+) -> 词数
        skelWords: {}, // 骨架 -> 至少含一个该骨架音节的词数
        openCount: 0, // 含开音节（V 结尾）的词数
        closedCount: 0, // 含闭音节（C 结尾）的词数
        vceCount: 0, // 词尾为 VCe 魔法-e 的词数
        diphCount: 0, // 含双元音音素的词数
        sig: new Map(), // word(lower) -> { parts, label, vce, diph }
      };

      // IPA 音素解析：双元音/塞擦音按单个音素处理。
      // 注：本词库为英式 IPA（ECDICT），双元音含 əʊ（非美式 oʊ），长音带 ː 记号，
      // 并存在少量旧记法脏字符（є/ε）按元音容错处理。
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
          if (ch === "ː") { i += 1; continue; } // 长音符：跳过，不影响 V/C
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
            if (cod.length > 4) { // 长尾辅音保护：多余部分并入下一音节 onset
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

      // 开/闭音节骨架集（按发音结尾：V 结尾=开，C 结尾=闭）
      const SYL_OPEN = new Set(["V", "CV", "CCV", "CCCV"]);
      const SYL_CLOSED = new Set([
        "VC","VCC","VCCC","CVC","CVCC","CVCCC",
        "CCVC","CCVCC","CCVCCC","CCCVC","CCCVCC","CCCVCCC",
      ]);
      // VCe 魔法-e：拼写为「元音字母+辅音字母+e」时，该元音应发的长音。
      // 英式 IPA（ECDICT）带 ː 长音符：e 长音为 iː、u 长音为 uː、o 长音为 əʊ（非美式 oʊ）。
      const VCE_LONG = { a: "eɪ", e: "iː", i: "aɪ", o: "əʊ", u: "uː" };
      const VCE_EX = new Set([
        "are","were","there","where","sure","chore","yore",
        "move","prove","lose","whose","remove",
      ]);
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
      // 严格 VCe 判定：词尾拼写 元音+单辅音+e（该元音前不叠元音字母），
      // 末音节须以辅音收尾（e 不发音、元音后有尾辅音，VC/CVC/CCVC 均可），
      // 且该元音确实发对应长音（英式：e→iː、u→uː、o→əʊ）
      function wordIsVce(wordLower, parts, ipa) {
        const m = /(?<![aeiou])[aeiou][bcdfghjklmnpqrstvwxyz]e$/.exec(wordLower);
        if (!m) return false;
        if (VCE_EX.has(wordLower)) return false;
        if (!parts.length || !parts[parts.length - 1].endsWith("C")) return false;
        const v = lastVowelUnit(ipa);
        const want = VCE_LONG[m[0].charAt(0)];
        return !!want && v === want;
      }

      // 用本地英式 IPA 构建音节索引（幂等，可在音标/词库加载后重复调用）
      function buildSyllableMeta() {
        if (!Object.keys(localIPA).length || !vocab.length) return;
        const m = {
          ready: false, total: 0, nsCount: {}, skelWords: {},
          openCount: 0, closedCount: 0, vceCount: 0, diphCount: 0,
          sig: new Map(),
        };
        vocab.forEach((v) => {
          const rec = localIPA[v.word.toLowerCase()];
          if (!rec) return;
          const ipa = Array.isArray(rec) && rec.length > 1 ? rec[1] : rec;
          const r = ipaSkeleton(ipa);
          if (!r) return;
          m.total += 1;
          const n = r.parts.length;
          m.nsCount[n >= 5 ? 5 : n] = (m.nsCount[n >= 5 ? 5 : n] || 0) + 1;
          const seen = new Set();
          r.parts.forEach((p) => { seen.add(p); });
          seen.forEach((p) => {
            m.skelWords[p] = (m.skelWords[p] || 0) + 1;
          });
          let hasOpen = false, hasClosed = false;
          seen.forEach((p) => {
            if (SYL_OPEN.has(p)) hasOpen = true;
            if (SYL_CLOSED.has(p)) hasClosed = true;
          });
          if (hasOpen) m.openCount += 1;
          if (hasClosed) m.closedCount += 1;
          const ipaClean = String(ipa).replace(/[ˈˌ\s/]/g, "");
          let hasDiph = false;
          for (const d of SYL_DIPH) {
            if (ipaClean.includes(d)) { hasDiph = true; break; }
          }
          if (hasDiph) m.diphCount += 1;
          const vce = wordIsVce(v.word.toLowerCase(), r.parts, ipaClean);
          if (vce) m.vceCount += 1;
          r.vce = vce;
          r.diph = hasDiph;
          m.sig.set(v.word.toLowerCase(), r);
        });
        m.ready = true;
        // 用旧索引的引用替换（词库切换后旧 Map 由 GC 回收）
        SYLLABLE_META.ready = m.ready;
        SYLLABLE_META.total = m.total;
        SYLLABLE_META.nsCount = m.nsCount;
        SYLLABLE_META.skelWords = m.skelWords;
        SYLLABLE_META.openCount = m.openCount;
        SYLLABLE_META.closedCount = m.closedCount;
        SYLLABLE_META.vceCount = m.vceCount;
        SYLLABLE_META.diphCount = m.diphCount;
        SYLLABLE_META.sig = m.sig;
      }

      // 音节筛选状态：激活判定 / 默认焦点 / 文案
      const sylActive = (s) =>
        !!s &&
        (s.nSyl != null ||
          (s.anchors && Object.keys(s.anchors).length > 0) ||
          !!s.vce ||
          !!s.diph);
      function sylDefaultFocus(nSyl) {
        return nSyl != null && nSyl >= 1 && nSyl <= 4 ? "1" : "any";
      }
      // nSyl=1..4 时位置 = 第1..第N 音节；nSyl 不限(或 5+) 时用 首/末/任一 定位
      function sylFocusKeys(s) {
        if (s.nSyl != null && s.nSyl >= 1 && s.nSyl <= 4)
          return Array.from({ length: s.nSyl }, (_, i) => String(i + 1));
        return ["first", "last", "any"];
      }
      function sylValidFocus(s) {
        const keys = sylFocusKeys(s || { nSyl: null });
        let f = (s && s.focus) || "";
        if (!keys.includes(f)) {
          f = s && s.nSyl != null && s.nSyl >= 1 && s.nSyl <= 4 ? "1" : "any";
        }
        if (!keys.includes(f)) f = keys[0];
        return f;
      }
      function sylKeyName(key) {
        if (key === "first") return "First syllable";
        if (key === "last") return "Last syllable";
        if (key === "any") return "Any syllable";
        return `Syllable ${key}`;
      }
      function sylCondLabel(s) {
        if (!sylActive(s)) return "";
        const bits = [];
        if (s.nSyl != null)
          bits.push(s.nSyl === 5 ? "5+ syllables" : `${s.nSyl} syllable(s)`);
        Object.keys(s.anchors || {}).forEach((k) => {
          bits.push(`${sylKeyName(k)}=${s.anchors[k]}`);
        });
        if (s.vce) bits.push("final VCe");
        if (s.diph) bits.push("contains diphthong");
        return bits.join(" · ");
      }
      // 词是否满足音节条件（无本地音标的词不参与）
      function sylWordMatch(s, wordLower) {
        const rec = SYLLABLE_META.sig.get(wordLower);
        if (!rec) return false;
        const parts = rec.parts;
        const ns = parts.length;
        if (s.nSyl != null) {
          if (s.nSyl === 5 ? ns < 5 : ns !== s.nSyl) return false;
        }
        const anchors = s.anchors || {};
        for (const k of Object.keys(anchors)) {
          const skel = anchors[k];
          if (k === "any") { if (!parts.includes(skel)) return false; }
          else if (k === "first") { if (parts[0] !== skel) return false; }
          else if (k === "last") { if (parts[ns - 1] !== skel) return false; }
          else {
            const idx = parseInt(k, 10) - 1;
            if (idx >= ns || parts[idx] !== skel) return false;
          }
        }
        if (s.vce && !rec.vce) return false;
        if (s.diph && !rec.diph) return false;
        return true;
      }
      // 提交音节条件：空条件置 null，然后重筛 + 重绘
      function commitSyllable(next) {
        currentFilter.syllable = sylActive(next) ? next : null;
        applyFilters();
        if (isMobile()) {
          const g = document.getElementById("grid");
          if (g) g.scrollTop = 0;
        }
        renderPhonicsBar();
      }

      // 音节结构页签 UI
      function renderSyllableArea(body) {
        const syl = sylActive(currentFilter.syllable)
          ? currentFilter.syllable
          : null;
        const ready = SYLLABLE_META.ready;
        const num = (n) => (n == null ? "…" : n);
        const wrap = document.createElement("div");
        wrap.className = "syl-area";

        // 引导说明
        const intro = document.createElement("div");
        intro.className = "syl-intro";
        intro.innerHTML =
          "Split words into syllables by <b>pronunciation</b> — V = vowel phoneme, C = consonant phoneme. Syllable count + skeleton combinations describe all <b>" +
          num(ready ? SYLLABLE_META.total : null) +
          "</b> words with a pronunciation";
        wrap.appendChild(intro);

        // ── 音节数 chips ──
        const nsLabel = document.createElement("div");
        nsLabel.className = "syl-label";
        nsLabel.textContent = "Syllable count";
        wrap.appendChild(nsLabel);
        const nsRow = document.createElement("div");
        nsRow.className = "syl-chips";
        const nsOpts = [
          { v: null, label: "Any" },
          { v: 1, label: "1" },
          { v: 2, label: "2" },
          { v: 3, label: "3" },
          { v: 4, label: "4" },
          { v: 5, label: "5+" },
        ];
        nsOpts.forEach(({ v, label }) => {
          const cnt =
            v === null
              ? (ready ? SYLLABLE_META.total : null)
              : SYLLABLE_META.nsCount[v];
          const b = document.createElement("button");
          b.className = "syl-chip" + (syl && syl.nSyl === v ? " active" : "");
          b.innerHTML = `${esc(label)}<span class="num">${num(cnt)}</span>`;
          b.title =
            label === "Any"
              ? "No syllable-count limit"
              : `Only words with ${label === "5+" ? "5 or more" : label + " "}syllable(s)`;
          b.onclick = () => {
            const base = syl
              ? Object.assign({}, syl)
              : { nSyl: null, anchors: {}, focus: "any" };
            if (base.nSyl === v) {
              // 再点一次取消音节数限制
              base.nSyl = null;
              base.anchors = {};
              base.focus = "any";
            } else {
              base.nSyl = v;
              base.anchors = {};
              base.focus = sylDefaultFocus(v);
            }
            commitSyllable(base);
          };
          nsRow.appendChild(b);
        });
        wrap.appendChild(nsRow);

        // ── 音节位置（先点位置，再从下方骨架库选骨架填入）──
        const focus = sylValidFocus(syl);
        const posLabel = document.createElement("div");
        posLabel.className = "syl-label";
        const posLabelTxt = document.createElement("span");
        posLabelTxt.textContent = "Syllable position";
        const posHint = document.createElement("span");
        posHint.className = "syl-hint";
        posHint.textContent =
          "Pick a position → pick a skeleton · click a filled position to clear";
        posLabel.appendChild(posLabelTxt);
        posLabel.appendChild(posHint);
        wrap.appendChild(posLabel);

        const posRow = document.createElement("div");
        posRow.className = "syl-chips";
        sylFocusKeys(syl || { nSyl: null }).forEach((key) => {
          const val = syl && syl.anchors ? syl.anchors[key] : null;
          const b = document.createElement("button");
          b.className =
            "syl-pos-chip" +
            (val ? " syl-set" : "") +
            (focus === key ? " syl-focus" : "");
          b.innerHTML =
            esc(sylKeyName(key)) +
            (val
              ? `<b class="pv">${esc(val)}</b><span class="px">✕</span>`
              : "");
          b.title = val
            ? `Restricted to ${sylKeyName(key)} = ${val} (click to clear)`
            : `Select "${sylKeyName(key)}", then pick a skeleton from the library below`;
          b.onclick = () => {
            const base = syl
              ? Object.assign({}, syl)
              : { nSyl: null, anchors: {}, focus: "any" };
            if (val) {
              const a = Object.assign({}, base.anchors);
              delete a[key];
              base.anchors = a;
            }
            base.focus = key;
            commitSyllable(base);
          };
          posRow.appendChild(b);
        });
        wrap.appendChild(posRow);

        // ── 骨架库：全库 16 种，按 开音节(元音结尾)/闭音节(辅音结尾) 分组 ──
        const skelLabel = document.createElement("div");
        skelLabel.className = "syl-label";
        skelLabel.textContent = "Skeleton library · all 16";
        wrap.appendChild(skelLabel);
        const activeVal = syl && syl.anchors ? syl.anchors[focus] : null;
        const makeSkelChip = (skel) => {
          const cnt = ready ? SYLLABLE_META.skelWords[skel] || 0 : null;
          const b = document.createElement("button");
          b.className = "syl-skel-chip" + (activeVal === skel ? " active" : "");
          b.innerHTML = `${esc(skel)}<span class="num">${num(cnt)}</span>`;
          b.title = `Syllable skeleton ${skel}: ${num(cnt)} word(s) in the library contain it (filled into "${sylKeyName(focus)}")`;
          b.onclick = () => {
            const base = syl
              ? Object.assign({}, syl)
              : { nSyl: null, anchors: {}, focus };
            const a = Object.assign({}, base.anchors || {});
            if (a[focus] === skel) delete a[focus];
            else a[focus] = skel;
            base.anchors = a;
            commitSyllable(base);
          };
          return b;
        };
        const groupBox = (label, color, count, skels) => {
          const box = document.createElement("div");
          box.className = "syl-group";
          const head = document.createElement("div");
          head.className = "syl-group-title";
          head.title = `${label}: ${num(count)} word(s) in the library have at least one such syllable (open/closed are not mutually exclusive — a word may count in both)`;
          head.innerHTML = `<span class="syl-dot" style="background:${color}"></span><span>${esc(label)}</span><span class="num">${num(count)}</span>`;
          box.appendChild(head);
          const g = document.createElement("div");
          g.className = "syl-skel-grid";
          skels.forEach((s) => g.appendChild(makeSkelChip(s)));
          box.appendChild(g);
          return box;
        };
        wrap.appendChild(
          groupBox(
            "Open syllable · ends with a vowel sound",
            "#1D9E75",
            ready ? SYLLABLE_META.openCount : null,
            ["V", "CV", "CCV", "CCCV"],
          ),
        );
        wrap.appendChild(
          groupBox(
            "Closed syllable · ends with a consonant sound",
            "#E24B4A",
            ready ? SYLLABLE_META.closedCount : null,
            [
              "VC","VCC","VCCC","CVC","CVCC","CVCCC",
              "CCVC","CCVCC","CCVCCC","CCCVC","CCCVCC","CCCVCCC",
            ],
          ),
        );

        // ── 拼写层叠加：VCe 魔法-e / 双元音音素（与上方条件 AND 生效）──
        const ovLabel = document.createElement("div");
        ovLabel.className = "syl-label";
        const ovLabelTxt = document.createElement("span");
        ovLabelTxt.textContent = "Spelling-layer overlays";
        const ovHint = document.createElement("span");
        ovHint.className = "syl-hint";
        ovHint.textContent = "VCe: word-final vowel+consonant+e pronounced long";
        ovLabel.appendChild(ovLabelTxt);
        ovLabel.appendChild(ovHint);
        wrap.appendChild(ovLabel);
        const ovRow = document.createElement("div");
        ovRow.className = "syl-chips";
        const ovOpts = [
          {
            key: "vce",
            label: "VCe magic-e",
            cnt: ready ? SYLLABLE_META.vceCount : null,
            tip: "Only words ending in vowel+consonant+e pronounced with the long vowel, e.g. make / time / hope / use / these (come, there, move etc. excluded)",
          },
          {
            key: "diph",
            label: "Diphthong phoneme",
            cnt: ready ? SYLLABLE_META.diphCount : null,
            tip: "Only words with a diphthong phoneme in some syllable (/eɪ aɪ ɔɪ aʊ əʊ ɪə eə ʊə/), e.g. go / boat / now",
          },
        ];
        ovOpts.forEach((o) => {
          const b = document.createElement("button");
          b.className =
            "syl-chip syl-ov-chip" + (syl && syl[o.key] ? " active" : "");
          b.innerHTML = `${esc(o.label)}<span class="num">${num(o.cnt)}</span>`;
          b.title = o.tip;
          b.onclick = () => {
            const base = syl
              ? Object.assign({}, syl)
              : { nSyl: null, anchors: {}, focus: "any" };
            base[o.key] = !base[o.key];
            commitSyllable(base);
          };
          ovRow.appendChild(b);
        });
        wrap.appendChild(ovRow);

        // ── 命中信息条 ──
        if (syl) {
          const ex = filteredVocab.slice(0, 8).map((v) => v.word);
          const hit = document.createElement("div");
          hit.className = "syl-hitbar";
          const info = document.createElement("div");
          info.className = "syl-hit-info";
          const title = document.createElement("div");
          title.className = "syl-hit-title";
          title.innerHTML = `${esc(sylCondLabel(syl))} → <b>${filteredVocab.length}</b> words`;
          info.appendChild(title);
          const exEl = document.createElement("div");
          exEl.className = "syl-examples";
          exEl.textContent = filteredVocab.length ? ex.join(" · ") : "No matching words — try adjusting the conditions";
          exEl.title = exEl.textContent;
          info.appendChild(exEl);
          hit.appendChild(info);
          const reset = document.createElement("button");
          reset.className = "syl-reset";
          reset.textContent = "✕";
          reset.title = "Clear syllable filter";
          reset.onclick = () => {
            currentFilter.syllable = null;
            applyFilters();
            renderPhonicsBar();
          };
          hit.appendChild(reset);
          wrap.appendChild(hit);
        }

        body.appendChild(wrap);
      }

      /* ═══════════════════════════════════════
   PHONICS · Letter-Combination Classification
═══════════════════════════════════════ */
      const PHONICS_GROUPS = [
        {
          id: "short-vowel", label: "Short Vowels", rows: [
            ["[æ]", ["a"]],
            ["[ɛ]", ["e", "ea"]],
            ["[ɪ]", ["i", "y"]],
            ["[ɒ]", ["o"]],
            ["[ə]", ["o", "u"]],
          ],
        },
        {
          id: "long-vowel", label: "Long Vowels", rows: [
            ["[ɑ]", ["o"]],
            ["[ʌ]", ["u", "o", "oo", "ou"]],
            ["[ʊ]", ["u", "oo"]],
            ["[ɔ]", ["al", "au", "aw"]],
            ["[e]", ["a_e", "ai", "ay", "eigh"]],
            ["[i]", ["ea", "e_e", "ee", "ei", "ie", "ey"]],
            ["[aɪ]", ["i_e", "ie", "igh", "y"]],
            ["[o]", ["oa", "oe", "o_e", "ow"]],
            ["[u]", ["ew", "ue", "u_e", "ui", "oo"]],
          ],
        },
        {
          id: "mono-long", label: "Long Vowels", rows: [
            ["[i:]", ["ee", "ea", "e_e", "ie", "ei", "ey"]],
            ["[ɑ:]", ["ar", "are", "al", "au", "aw"]],
            ["[ɔ:]", ["or", "oar", "oor", "ore", "our", "al", "au", "aw"]],
            ["[u:]", ["oo", "u_e", "ue", "ui", "ew", "ou"]],
            ["[ɜ:]", ["ir", "ur", "er", "ear", "or", "yr"]],
          ],
        },
        {
          id: "mono-short", label: "Short Vowels", rows: [
            ["[ʌ]", ["u", "o", "oo", "ou", "oe"]],
            ["[ɪ]", ["i", "y", "e", "u", "ui"]],
            ["[ʊ]", ["oo", "u", "oul"]],
            ["[ə]", ["a", "e", "i", "o", "u", "ou"]],
            ["[ɒ]", ["o", "a", "al"]],
            ["[e]", ["e", "ea", "a", "ai", "ie"]],
            ["[æ]", ["a", "ai"]],
          ],
        },
        {
          id: "mono-dip", label: "Diphthongs", rows: [
            ["[eɪ]", ["a", "a_e", "ai", "ay", "eigh", "ey", "ea"]],
            ["[aɪ]", ["i", "i_e", "ie", "igh", "y", "eye", "uy"]],
            ["[ɔɪ]", ["oi", "oy"]],
            ["[aʊ]", ["ou", "ow"]],
            ["[əʊ]", ["o", "o_e", "oa", "oe", "ow"]],
            ["[ɪə]", ["ear", "eer", "ier", "ia"]],
            ["[eə]", ["air", "are", "ear", "eir", "ere", "aire", "ayer"]],
            ["[ʊə]", ["oor", "oure", "our", "ure"]],
          ],
        },
        {
          id: "voiceless", label: "Voiceless Consonants", rows: [
            ["[p]", ["p", "pp"]],
            ["[t]", ["t", "tt", "ed"]],
            ["[k]", ["c", "k", "ck", "ch", "que"]],
            ["[f]", ["f", "ff"]],
            ["[θ]", ["th"]],
            ["[s]", ["s", "ss", "se", "sc", "ce", "ci", "cy"]],
            ["[ʃ]", ["sh", "ti", "c", "s", "ss", "ch"]],
            ["[tʃ]", ["ch", "tch", "tu"]],
            ["[tr]", ["tr"]],
            ["[ts]", ["ts"]],
          ],
        },
        {
          id: "voiced", label: "Voiced Consonants", rows: [
            ["[b]", ["b", "bb"]],
            ["[d]", ["d", "dd"]],
            ["[g]", ["g", "gg", "gh", "gu"]],
            ["[v]", ["v", "ve", "f"]],
            ["[ð]", ["th"]],
            ["[z]", ["z", "zz", "s", "se", "ss"]],
            ["[ʒ]", ["si", "su"]],
            ["[dʒ]", ["j", "ge", "gi", "gy", "dge"]],
            ["[dr]", ["dr"]],
            ["[dz]", ["ds"]],
          ],
        },
        {
          id: "semi-voiced", label: "Semi-voiced Consonants", rows: [
            ["[h]", ["h"]],
            ["[r]", ["r", "rr", "wr", "rh"]],
          ],
        },
        {
          id: "semivowel", label: "Semivowels", rows: [
            ["[w]", ["w", "wh"]],
            ["[j]", ["y"]],
          ],
        },
        {
          id: "nasal", label: "Nasals", rows: [
            ["[m]", ["m", "mm"]],
            ["[n]", ["n", "nn"]],
            ["[ŋ]", ["ng", "nk"]],
          ],
        },
        {
          id: "lateral", label: "Lateral", rows: [
            ["[l]", ["l", "ll"]],
          ],
        },
        {
          id: "vowel-r", label: "Vowel + r", rows: [
            ["[ɑr]", ["ar"]],
            ["[ɜ]", ["er", "ir", "or", "ur"]],
            ["[ɒr]", ["ar", "er"]],
            ["[ɔr]", ["ar"]],
          ],
        },
        {
          id: "other-vowel-r", label: "Other Vowel + r", rows: [
            ["[ɛr]", ["air", "are", "ear", "ere"]],
            ["[ɪr]", ["ear", "ere", "eer"]],
            ["[or]", ["oor", "ore", "our"]],
          ],
        },
        {
          id: "special", label: "Special Vowel Combos", rows: [
            ["[aʊ]", ["ou", "ow"]],
            ["[ɔɪ]", ["oi", "oy"]],
          ],
        },
      ];

      // Combo-button count per sub-category (static, computed once)
      const phonicsCatCounts = {};
      PHONICS_GROUPS.forEach((g) => {
        phonicsCatCounts[g.id] = g.rows.reduce(
          (n, [, combos]) => n + combos.length,
          0,
        );
      });

      // Main sections, sub-categories shown side by side; cols = grid column count
      const PHONICS_SECTIONS = [
        { id: "vowel", label: "Vowels", groups: ["short-vowel", "long-vowel"], cols: 2 },
        { id: "mono-diphthong", label: "Single & Double Vowels", groups: ["mono-long", "mono-short", "mono-dip"], cols: 2 },
        { id: "consonant", label: "Consonants", groups: ["voiceless", "voiced", "semi-voiced", "semivowel", "nasal", "lateral"], cols: 2 },
        {
          id: "special-vowel",
          label: "Special Vowel Forms",
          groups: ["vowel-r", "other-vowel-r", "special"],
          cols: 3,
        },
        { id: "syllable", label: "Syllables", groups: [], cols: 1 },
      ];
      const phonicsSectionCounts = {};
      PHONICS_SECTIONS.forEach((s) => {
        if (s.id === "syllable") {
          phonicsSectionCounts[s.id] = SYLLABLE_SKELS.length;
          return;
        }
        phonicsSectionCounts[s.id] = s.groups.reduce(
          (n, gid) => n + (phonicsCatCounts[gid] || 0),
          0,
        );
      });

      // Expanded main section id; default to Vowels
      let phonicsSection = "vowel";

      // Collapsed sub-category ids
      const collapsedSubcats = new Set();

      // combo → RegExp (cached)
      // Rule: combos containing "_" are "magic-e" pairs, e.g. a_e → a + one letter + e; others are plain substrings
      const phonicsRegexCache = {};
      function phonicsRegex(combo) {
        if (phonicsRegexCache[combo]) return phonicsRegexCache[combo];
        let src;
        if (combo.includes("_")) {
          src = combo.replace(/_/g, "[a-z]");
        } else {
          src = combo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
        const re = new RegExp(src, "i");
        phonicsRegexCache[combo] = re;
        return re;
      }

      // Count words in the current vocab containing a combo
      function phonicsCount(combo) {
        const re = phonicsRegex(combo);
        return vocab.reduce((n, v) => n + (re.test(v.word) ? 1 : 0), 0);
      }

      // OR-regex over all combos of a sub-category
      const phonicsGroupRegexCache = {};
      function phonicsGroupRegex(catId) {
        if (phonicsGroupRegexCache[catId])
          return phonicsGroupRegexCache[catId];
        const group = PHONICS_GROUPS.find((g) => g.id === catId);
        const uniq = [];
        group.rows.forEach(([, combos]) =>
          combos.forEach((c) => {
            if (!uniq.includes(c)) uniq.push(c);
          }),
        );
        const src = uniq
          .map((c) =>
            c.includes("_")
              ? c.replace(/_/g, "[a-z]")
              : c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          )
          .join("|");
        const re = new RegExp(src, "i");
        phonicsGroupRegexCache[catId] = re;
        return re;
      }

      function renderPhonicsBar() {
        const body = document.getElementById("phonicsPanelBody");
        if (!body) return;
        body.innerHTML = "";

        const catRow = document.createElement("div");
        catRow.className = "phonics-cat-row";

        // Three main-section tabs
        PHONICS_SECTIONS.forEach((s) => {
          const btn = document.createElement("button");
          btn.className =
            "phonics-chip" +
            (phonicsSection === s.id ? " active" : "");
          btn.innerHTML =
            `${esc(s.label)} ` +
            `<span class="pc-cat-count">${phonicsSectionCounts[s.id]}</span>`;
          btn.title = `Show letter combinations of "${s.label}"`;
          btn.onclick = () => {
            phonicsSection = phonicsSection === s.id ? null : s.id;
            renderPhonicsBar();
          };
          catRow.appendChild(btn);
        });

        // Clear-filter button (letter-combination / syllable shared)
        if (currentFilter.phonics || sylActive(currentFilter.syllable)) {
          const clear = document.createElement("button");
          clear.className = "phonics-chip phonics-clear";
          clear.textContent = "✕ Clear";
          clear.title = "Clear the letter-combination and syllable filters";
          clear.onclick = () => {
            currentFilter.phonics = null;
            currentFilter.syllable = null;
            phonicsSection = null;
            collapsedSubcats.clear();
            applyFilters();
            renderPhonicsBar();
          };
          catRow.appendChild(clear);
        }

        body.appendChild(catRow);

        // Expanded section: sub-categories side by side
        const section = PHONICS_SECTIONS.find((s) => s.id === phonicsSection);
        if (section && section.id === "syllable") {
          renderSyllableArea(body);
        } else if (section) {
          const area = document.createElement("div");
          area.className = "phonics-section-area";
          area.dataset.cols = section.cols || 2;

          section.groups.forEach((gid) => {
            const group = PHONICS_GROUPS.find((g) => g.id === gid);
            if (!group) return;
            const col = document.createElement("div");
            col.className = "phonics-subcat-col";

            // Sub-category title: click = filter whole category; ▾ = collapse/expand combos
            const isWhole =
              currentFilter.phonics &&
              currentFilter.phonics.whole &&
              currentFilter.phonics.catId === gid;
            const title = document.createElement("div");
            title.className =
              "phonics-subcat-title" + (isWhole ? " active" : "");
            title.title = "Click to filter all words of this category";
            title.innerHTML =
              `<span class="psc-label">${esc(group.label)}</span>` +
              `<span class="psc-count">${phonicsCatCounts[gid]}</span>`;
            const arrow = document.createElement("button");
            arrow.className = "psc-arrow" + (collapsedSubcats.has(gid) ? "" : " open");
            arrow.textContent = collapsedSubcats.has(gid) ? "▸" : "▾";
            arrow.title = collapsedSubcats.has(gid)
              ? "Show combo buttons"
              : "Hide combo buttons";
            arrow.onclick = (e) => {
              e.stopPropagation();
              if (collapsedSubcats.has(gid)) collapsedSubcats.delete(gid);
              else collapsedSubcats.add(gid);
              renderPhonicsBar();
            };
            title.appendChild(arrow);
            title.onclick = () => {
              currentFilter.phonics = {
                catId: gid,
                category: group.label,
                whole: true,
              };
              applyFilters();
              renderPhonicsBar();
              if (isMobile())
                document.getElementById("grid").scrollTop = 0;
            };
            col.appendChild(title);

            // Sub-category body: combos grouped by sound (table-style rows)
            if (!collapsedSubcats.has(gid)) {
              const body2 = document.createElement("div");
              body2.className = "phonics-subcat-body";
              group.rows.forEach(([sound, combos]) => {
                const row = document.createElement("div");
                row.className = "phonics-sound-row";

                // Sound badge: marked once for the whole group
                const badge = document.createElement("span");
                badge.className =
                  "phonics-sound-badge" +
                  (currentFilter.phonics &&
                  currentFilter.phonics.sound === sound &&
                  !currentFilter.phonics.whole
                    ? " active"
                    : "");
                badge.textContent = sound;
                badge.title = `Sound ${sound} · click a combo button below to filter`;
                row.appendChild(badge);

                // Combo buttons under this sound: each filters independently
                const combosWrap = document.createElement("div");
                combosWrap.className = "phonics-sound-combos";
                combos.forEach((combo) => {
                  const isActive =
                    currentFilter.phonics &&
                    currentFilter.phonics.combo === combo;
                  const btn = document.createElement("button");
                  btn.className =
                    "phonics-combo-btn" + (isActive ? " active" : "");
                  const cnt = isActive
                    ? filteredVocab.length
                    : phonicsCount(combo);
                  btn.innerHTML =
                    `<span class="pc-combo">${esc(combo)}</span>` +
                    `<span class="pc-count">${cnt}</span>`;
                  btn.title = `Combo ${combo} · sound ${sound} · ${cnt} words`;
                  btn.onclick = () => {
                    if (isActive) {
                      currentFilter.phonics = null;
                    } else {
                      currentFilter.phonics = {
                        combo,
                        sound,
                        category: group.label,
                        catId: group.id,
                      };
                    }
                    applyFilters();
                    renderPhonicsBar();
                    if (isMobile())
                      document.getElementById("grid").scrollTop = 0;
                  };
                  combosWrap.appendChild(btn);
                });
                row.appendChild(combosWrap);
                body2.appendChild(row);
              });
              col.appendChild(body2);
            }

            area.appendChild(col);
          });
          body.appendChild(area);
        }

        updatePhonicsFab();
      }

      /* ── Floating panel: toggle / drag / position memory ── */
      function updatePhonicsFab() {
        const fab = document.getElementById("phonicsFab");
        if (!fab) return;
        const label = fab.querySelector(".fab-label");
        const s = currentFilter.syllable;
        const p = currentFilter.phonics;
        if (sylActive(s)) {
          const cond = sylCondLabel(s);
          label.textContent = cond ? `Syllable · ${cond}` : "Syllables";
          label.title = cond;
          fab.classList.add("active");
        } else if (p) {
          label.textContent = p.whole ? p.category : `${p.combo} · ${p.sound}`;
          fab.classList.add("active");
        } else {
          label.textContent = "Phonics";
          fab.classList.remove("active");
        }
      }

      function initPhonicsPanel() {
        const bar = document.getElementById("phonicsBar");
        const head = document.getElementById("phonicsPanelHead");
        const closeBtn = document.getElementById("phonicsPanelClose");
        const fab = document.getElementById("phonicsFab");
        if (!bar || !head || !closeBtn || !fab) return;

        // Restore last drag position
        try {
          const saved = localStorage.getItem("phonicsPanelPos");
          if (saved) {
            const { left, top } = JSON.parse(saved);
            if (typeof left === "number" && typeof top === "number") {
              bar.style.left = left + "px";
              bar.style.top = top + "px";
              bar.style.right = "auto";
            }
          }
        } catch (e) {
          /* ignore */
        }

        // Restore last size
        try {
          const saved = localStorage.getItem("phonicsPanelSize");
          if (saved) {
            const { width, height } = JSON.parse(saved);
            if (typeof width === "number" && width >= 320)
              bar.style.width = width + "px";
            if (typeof height === "number" && height >= 240)
              bar.style.height = height + "px";
          }
        } catch (e) {
          /* ignore */
        }

        // Open / close
        const clampPos = () => {
          const w = bar.offsetWidth;
          const h = bar.offsetHeight;
          let l = bar.offsetLeft;
          let t = bar.offsetTop;
          if (l + w > window.innerWidth)
            l = Math.max(0, window.innerWidth - w);
          if (t + h > window.innerHeight)
            t = Math.max(0, window.innerHeight - h);
          if (l !== bar.offsetLeft || t !== bar.offsetTop) {
            bar.style.left = l + "px";
            bar.style.top = t + "px";
          }
        };
        const setOpen = (open) => {
          bar.classList.toggle("open", open);
          if (open) clampPos();
          fab.title = open ? "Close phonics panel" : "Open phonics panel";
        };
        fab.addEventListener("click", () =>
          setOpen(!bar.classList.contains("open")),
        );
        closeBtn.addEventListener("click", () => setOpen(false));

        // Drag panel by its header
        let drag = null;
        head.addEventListener("pointerdown", (e) => {
          if (e.target.closest(".phonics-panel-close")) return;
          drag = {
            x: e.clientX,
            y: e.clientY,
            l: bar.offsetLeft,
            t: bar.offsetTop,
          };
          head.setPointerCapture(e.pointerId);
        });
        head.addEventListener("pointermove", (e) => {
          if (!drag) return;
          const l = Math.min(
            Math.max(drag.l + e.clientX - drag.x, 0),
            window.innerWidth - bar.offsetWidth,
          );
          const t = Math.min(
            Math.max(drag.t + e.clientY - drag.y, 0),
            window.innerHeight - bar.offsetHeight,
          );
          bar.style.left = l + "px";
          bar.style.top = t + "px";
          bar.style.right = "auto";
        });
        const endDrag = () => {
          if (!drag) return;
          drag = null;
          try {
            localStorage.setItem(
              "phonicsPanelPos",
              JSON.stringify({ left: bar.offsetLeft, top: bar.offsetTop }),
            );
          } catch (e) {
            /* ignore */
          }
        };
        head.addEventListener("pointerup", endDrag);
        head.addEventListener("pointercancel", endDrag);

        // 8-way resize handles
        const MIN_W = 320;
        const MIN_H = 260;
        let resize = null;
        const resizeHandles = bar.querySelectorAll(".ph-resize[data-dir]");
        resizeHandles.forEach((h) => {
          const dir = h.dataset.dir;
          h.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            h.classList.add("resizing");
            bar.classList.add("resizing-panel");
            resize = {
              dir,
              x: e.clientX,
              y: e.clientY,
              l: bar.offsetLeft,
              t: bar.offsetTop,
              w: bar.offsetWidth,
              h: bar.offsetHeight,
            };
            h.setPointerCapture(e.pointerId);
          });
          h.addEventListener("pointermove", (e) => {
            if (!resize || resize.dir !== dir) return;
            const dx = e.clientX - resize.x;
            const dy = e.clientY - resize.y;
            let l = resize.l;
            let t = resize.t;
            let w = resize.w;
            let h = resize.h;
            if (dir.includes("e")) {
              w = resize.w + dx;
            } else if (dir.includes("w")) {
              w = resize.w - dx;
              l = resize.l + dx;
              if (l < 0) {
                l = 0;
                w = resize.w + resize.l;
              }
            }
            if (dir.includes("s")) {
              h = resize.h + dy;
            } else if (dir.includes("n")) {
              h = resize.h - dy;
              t = resize.t + dy;
              if (t < 0) {
                t = 0;
                h = resize.h + resize.t;
              }
            }
            w = Math.min(Math.max(w, MIN_W), window.innerWidth - 24);
            h = Math.min(Math.max(h, MIN_H), window.innerHeight - 24);
            if (l + w > window.innerWidth)
              l = Math.max(0, window.innerWidth - w);
            if (t + h > window.innerHeight)
              t = Math.max(0, window.innerHeight - h);
            bar.style.left = l + "px";
            bar.style.top = t + "px";
            bar.style.width = w + "px";
            bar.style.height = h + "px";
            bar.style.right = "auto";
          });
          const endResize = () => {
            if (!resize || resize.dir !== dir) return;
            resize = null;
            h.classList.remove("resizing");
            bar.classList.remove("resizing-panel");
            try {
              localStorage.setItem(
                "phonicsPanelPos",
                JSON.stringify({ left: bar.offsetLeft, top: bar.offsetTop }),
              );
              localStorage.setItem(
                "phonicsPanelSize",
                JSON.stringify({
                  width: bar.offsetWidth,
                  height: bar.offsetHeight,
                }),
              );
            } catch (err) {
              /* ignore */
            }
          };
          h.addEventListener("pointerup", endResize);
          h.addEventListener("pointercancel", endResize);
        });

        updatePhonicsFab();
      }

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

  // 1.5 初始化自然发音浮动面板（此时 DOM 已就绪，词库异步加载后计数会再刷新）
  initPhonicsPanel();
  renderPhonicsBar();

  // 1.6 搜索框
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("searchClear");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentFilter.search = e.target.value.trim().toLowerCase();
      searchClear.style.display = e.target.value ? "flex" : "none";
      applyFilters();
    });
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      currentFilter.search = "";
      searchClear.style.display = "none";
      applyFilters();
      searchInput.focus();
    });
  }

  /* ═══════════════════════════════════════
   CATEGORY (语义分类) 控件事件
═══════════════════════════════════════ */
  const categoryBtn = document.getElementById("categoryBtn");
  if (categoryBtn) {
    categoryBtn.addEventListener("click", toggleCategoryBar);
  }
  const categoryArrowLeft = document.getElementById("categoryArrowLeft");
  const categoryArrowRight = document.getElementById("categoryArrowRight");
  if (categoryArrowLeft) categoryArrowLeft.addEventListener("click", () => scrollCategory(-1));
  if (categoryArrowRight) categoryArrowRight.addEventListener("click", () => scrollCategory(1));
  const categoryScrollEl = document.getElementById("categoryScroll");
  if (categoryScrollEl) categoryScrollEl.addEventListener("scroll", updateCategoryArrows);

  // 2. 加载语义分类 + 词库列表（带分类标题美化）
  fetch("data/cluster_map.json")
    .then((r) => r.json())
    .catch(() => null)
    .then((clusterMap) => {
      clusterData = clusterMap;
      return fetch("data/list.json").then((r) => r.json());
    })
    .then((data) => {
      const sel = document.getElementById("vocabSelect");
      if (!sel) return;
      sel.innerHTML = "";

      // 缓存全部词库 CSV 路径（供 All Books 合并加载使用）
      allBookUrls = data.vocabs
        .filter((v) => v.endsWith(".csv"))
        .map((v) => `data/${v}`);

      // 顶部「全部词库」虚拟选项
      const allOpt = document.createElement("option");
      allOpt.value = "ALL_BOOKS";
      allOpt.textContent = "All Books（全部词库）";
      allOpt.className = "vocab-all-books";
      allOpt.style.fontWeight = "bold";
      allOpt.style.color = "var(--md-primary)";
      sel.appendChild(allOpt);

      // 分隔线标题
      const sep = document.createElement("option");
      sep.disabled = true;
      sep.textContent = "── 单本词库 ──";
      sep.className = "vocab-group-title";
      sep.style.color = "var(--text-3)";
      sel.appendChild(sep);

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

      // 3. 确定初始加载的词库（支持 All Books）
      const savedBook = localStorage.getItem("vocab-selected-book");
      const firstValidVocab = data.vocabs.find(v => v.endsWith(".csv"));
      let initialVocab = null;
      if (savedBook === "ALL_BOOKS") {
        initialVocab = "ALL_BOOKS";
      } else if (savedBook && data.vocabs.some(v => `data/${v}` === savedBook)) {
        initialVocab = savedBook;
      } else if (firstValidVocab) {
        initialVocab = `data/${firstValidVocab}`;
      }

      if (initialVocab) sel.value = initialVocab;

      const firstSuffix = data.suffixes ? data.suffixes[0] : null;

      const loadInitial = initialVocab === "ALL_BOOKS"
        ? loadAllBooks()
        : (initialVocab ? loadVocab(initialVocab) : Promise.resolve());

      Promise.all([
        loadInitial,
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
        AudioCache.clear(); // 切换词库时清空缓存
        return fetch(url)
          .then((r) => r.text())
          .then((text) => {
            const { data } = Papa.parse(text.trim());
            vocab = data
              .filter((r) => r[0] && r[0].trim())
              .map((r) => ({
                word: r[0].trim(),
                def: (r[1] || "").trim(),
                pos: (r[1] || "").match(/[a-z]+\./g) || [],
              }));
            // 语义分类数据：把簇号 + 簇名挂到每个词上
            if (clusterData && clusterData.wordMap) {
              const wm = clusterData.wordMap;
              vocab.forEach((v) => {
                const hit = wm[v.word] || wm[v.word.toLowerCase()];
                if (hit) {
                  v.cluster = hit.cluster;
                  v.clusterName = hit.name;
                }
              });
            }
            updatePOSMenu();
            updateAZBar();
            buildSyllableMeta(); // 若本地音标已加载则先建一次音节索引（幂等）
            renderPhonicsBar(); // 刷新发音分类的组合计数（随词库变化）
            renderCategoryBar(); // 渲染语义分类标签栏（词库就绪后统计）
            rebuildLocalIndex();
            applyFilters();
            if (suffixList.length)
              renderSuffixControls(document.getElementById("suffixSearch").value);
          })
          .catch(() => showError("Failed to load vocab: " + url));
      }

      // 合并全部词库：并发读取所有书，按词（小写）去重，保留首次出现的释义
      function loadAllBooks() {
        showSkeletons();
        AudioCache.clear();
        if (!allBookUrls.length) return Promise.resolve();
        return Promise.all(
          allBookUrls.map((url) => fetch(url).then((r) => r.text())),
        )
          .then((texts) => {
            const seen = new Map(); // key = word.toLowerCase()
            const merged = [];
            texts.forEach((text) => {
              Papa.parse(text.trim()).data.forEach((r) => {
                if (!r[0] || !r[0].trim()) return;
                const word = r[0].trim();
                const key = word.toLowerCase();
                if (seen.has(key)) return; // 跨书去重
                seen.set(key, true);
                merged.push({
                  word,
                  def: (r[1] || "").trim(),
                  pos: (r[1] || "").match(/[a-z]+\./g) || [],
                });
              });
            });
            vocab = merged;
            // 语义分类数据：把簇号 + 簇名挂到每个词上
            if (clusterData && clusterData.wordMap) {
              const wm = clusterData.wordMap;
              vocab.forEach((v) => {
                const hit = wm[v.word] || wm[v.word.toLowerCase()];
                if (hit) {
                  v.cluster = hit.cluster;
                  v.clusterName = hit.name;
                }
              });
            }
            updatePOSMenu();
            updateAZBar();
            buildSyllableMeta(); // 若本地音标已加载则先建一次音节索引（幂等）
            renderPhonicsBar();
            renderCategoryBar();
            rebuildLocalIndex();
            applyFilters();
            if (suffixList.length)
              renderSuffixControls(document.getElementById("suffixSearch").value);
          })
          .catch(() => showError("Failed to load All Books"));
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
   语义分类（CATEGORY）· K-Means 主题簇
═══════════════════════════════════════ */
      // 渲染分类标签栏（默认收起，点导航栏 Category 按钮展开）
      function renderCategoryBar() {
        const scroll = document.getElementById("categoryScroll");
        if (!scroll || !clusterData) return;
        scroll.innerHTML = "";

        // 统计当前词库里每个簇的实际词数（用于右下角数字 + 0 词隐藏）
        const counts = new Map();
        vocab.forEach((v) => {
          const key = v.cluster === undefined ? -1 : v.cluster;
          counts.set(key, (counts.get(key) || 0) + 1);
        });

        // All 标签
        const allChip = document.createElement("button");
        allChip.className = "category-chip" + (currentFilter.cluster === null ? " active" : "");
        allChip.innerHTML = `<span class="category-chip-name">All</span><span class="category-chip-count">${vocab.length}</span>`;
        allChip.title = `全部 · ${vocab.length} 词`;
        allChip.onclick = () => {
          currentFilter.cluster = null;
          renderCategoryBar();
          applyFilters();
        };
        scroll.appendChild(allChip);

        // 各簇标签（含「短语」「其他」簇）；当前词库中 0 词的簇不渲染
        const clusters = clusterData.clusters || [];
        clusters.forEach((c) => {
          const n = counts.get(c.id) || 0;
          if (n === 0) return; // 当前词库没有该分类的词，隐藏标签
          const chip = document.createElement("button");
          chip.className = "category-chip" + (currentFilter.cluster === c.id ? " active" : "");
          chip.innerHTML = `<span class="category-chip-name">${esc(c.name)}</span><span class="category-chip-count">${n}</span>`;
          chip.title = `${c.name} · ${n} 词`;
          chip.onclick = () => {
            currentFilter.cluster = currentFilter.cluster === c.id ? null : c.id;
            renderCategoryBar();
            applyFilters();
          };
          scroll.appendChild(chip);
        });

        updateCategoryArrows();
      }

      // 左右箭头状态 + 滑动
      function updateCategoryArrows() {
        const scroll = document.getElementById("categoryScroll");
        const left = document.getElementById("categoryArrowLeft");
        const right = document.getElementById("categoryArrowRight");
        if (!scroll || !left || !right) return;
        const canLeft = scroll.scrollLeft > 1;
        const canRight = scroll.scrollLeft + scroll.clientWidth < scroll.scrollWidth - 1;
        left.classList.toggle("disabled", !canLeft);
        right.classList.toggle("disabled", !canRight);
      }

      function scrollCategory(dir) {
        const scroll = document.getElementById("categoryScroll");
        if (!scroll) return;
        const amount = scroll.clientWidth * 0.7;
        scroll.scrollBy({ left: dir * amount, behavior: "smooth" });
      }

      // 切换分类标签栏显隐
      function toggleCategoryBar() {
        const bar = document.getElementById("categoryBar");
        const btn = document.getElementById("categoryBtn");
        if (!bar) return;
        categoryOpen = !categoryOpen;
        bar.style.display = categoryOpen ? "flex" : "none";
        if (btn) btn.classList.toggle("active", categoryOpen);
        if (categoryOpen) updateCategoryArrows();
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

        // 排序按钮：正序 / 倒序
        const sortBtn = document.createElement("button");
        sortBtn.className = "az-btn az-sort-btn" + (azSortOrder ? " active" : "");
        sortBtn.title = azSortOrder === 'asc' ? 'A→Z 正序' : azSortOrder === 'desc' ? 'Z→A 倒序' : '排序 A↔Z';
        const sortIcon = azSortOrder === 'desc'
          ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9M3 12h5m8 0v8m0 0-3-3m3 3 3-3"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9M3 12h5m8 0V4m0 0-3 3m3-3 3 3"/></svg>';
        sortBtn.innerHTML = sortIcon;
        sortBtn.onclick = () => {
          if (azSortOrder === null) azSortOrder = 'asc';
          else if (azSortOrder === 'asc') azSortOrder = 'desc';
          else azSortOrder = null;
          updateAZBar();
          applyFilters();
        };
        bar.appendChild(sortBtn);
      }

      /* ═══════════════════════════════════════
   SUFFIX CONTROLS
═══════════════════════════════════════ */
function renderSuffixControls(filterText = "") {
  const q = filterText.toLowerCase();
  const sidebarContainer = document.getElementById("suffix-container");
  const mobileNav = document.getElementById("mobileBottomNav");

  if (!sidebarContainer || !mobileNav) return;

  // 计算当前词库里每个词缀可刷选出的词数（缓存，词库变化时才重算）
  computeSuffixCounts();

  sidebarContainer.innerHTML = "";
  mobileNav.innerHTML = "";

  // 手机底栏：排序按钮（吸附在最左，和桌面按钮同一状态）
  const mobileSortBtn = document.createElement("button");
  mobileSortBtn.className =
    "suffix-pill suffix-sort-pill" + (suffixSortMode ? " active" : "");
  mobileSortBtn.innerHTML = suffixSortIcon();
  mobileSortBtn.title = suffixSortLabel();
  mobileSortBtn.onclick = cycleSuffixSort;
  mobileNav.appendChild(mobileSortBtn);

  // 1. 组合列表："All" 固定置顶，其余按分类内词数排序（默认保持 CSV 原序）
  const items = [
    { suffix: null, meaning: " ", type: null },
    ...sortSuffixListByCount(suffixList),
  ];

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

    // 该词缀在当前词库里可刷选出的词数（All / 标题行不显示）
    const cnt =
      item.suffix && item.type && suffixCounts
        ? suffixCounts.get(item.suffix.toLowerCase() + "|" + item.type) || 0
        : null;

    // PC 按钮
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (isActive ? " active" : "");
    btn.innerHTML =
      `<span class="sfx">${label}</span>` +
      `<span class="meaning">${item.meaning}</span>` +
      (cnt === null ? "" : `<span class="affix-count">${cnt}</span>`);
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
      /* ══ 词缀排序（按各分类内的可筛词数）══ */
      // 只在 CSV 的分组标题（ADJ / N / V / PREFIX…）内部排序，跨组不打乱，保留分类语义
      function sortSuffixListByCount(list) {
        if (!suffixSortMode) return list;
        const countOf = (it) =>
          it.suffix && it.type
            ? (suffixCounts &&
                suffixCounts.get(it.suffix.toLowerCase() + "|" + it.type)) ||
              0
            : 0;
        const isHeader = (it) =>
          it.suffix && (!it.meaning || !it.meaning.trim());

        const out = [];
        let group = [];
        const flush = () => {
          if (!group.length) return;
          group.sort((a, b) => {
            const ca = countOf(a),
              cb = countOf(b);
            // 0 词的词缀始终沉到本分类末尾（不参与升/降序）
            if (ca === 0 && cb !== 0) return 1;
            if (cb === 0 && ca !== 0) return -1;
            if (ca !== cb)
              return suffixSortMode === "desc" ? cb - ca : ca - cb;
            return a.suffix.localeCompare(b.suffix);
          });
          out.push(...group);
          group = [];
        };
        for (const it of list) {
          if (isHeader(it)) {
            flush();
            out.push(it);
          } else group.push(it);
        }
        flush();
        return out;
      }

      const SUFFIX_SORT_SVG = {
        off: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h11M3 10h7M3 15h4"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 7.5v9M17 7.5l-2 2M17 7.5l2 2M17 16.5l-2-2M17 16.5l2-2"/></svg>',
        desc: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h11M3 10h7M3 15h4"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 5v11M17 16.5l-2.5-2.5M17 16.5l2.5-2.5"/></svg>',
        asc: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5h4M3 10h7M3 15h11"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 17V6M17 6l-2.5 2.5M17 6l2.5 2.5"/></svg>',
      };

      function suffixSortIcon() {
        return SUFFIX_SORT_SVG[suffixSortMode || "off"];
      }
      function suffixSortLabel() {
        return suffixSortMode === "desc"
          ? "词数：多 → 少（点击切到少→多）"
          : suffixSortMode === "asc"
            ? "词数：少 → 多（点击恢复默认顺序）"
            : "按词数排序：各分类内 多 → 少";
      }
      function updateSuffixSortBtn() {
        const btn = document.getElementById("suffixSortBtn");
        if (!btn) return;
        btn.innerHTML = suffixSortIcon();
        btn.title = suffixSortLabel();
        btn.setAttribute("aria-label", suffixSortLabel());
        btn.classList.toggle("active", !!suffixSortMode);
      }
      function cycleSuffixSort() {
        suffixSortMode =
          suffixSortMode === null
            ? "desc"
            : suffixSortMode === "desc"
              ? "asc"
              : null;
        localStorage.setItem("vocab-suffix-sort", suffixSortMode || "off");
        updateSuffixSortBtn();
        renderSuffixControls(document.getElementById("suffixSearch").value);
      }
      document
        .getElementById("suffixSortBtn")
        .addEventListener("click", cycleSuffixSort);
      updateSuffixSortBtn();

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

      // 统计当前 vocab 中每个词缀（前缀 startsWith / 后缀 endsWith）能刷选出的词数
      function computeSuffixCounts() {
        if (!vocab || !vocab.length || suffixCountsVocab === vocab) return;
        const map = new Map();
        for (const item of suffixList) {
          if (!item.suffix || !item.type) continue;
          const s = item.suffix.toLowerCase();
          const type = item.type;
          let n = 0;
          for (const v of vocab) {
            const w = v.word.toLowerCase();
            if (type === "prefix" ? w.startsWith(s) : w.endsWith(s)) n++;
          }
          map.set(s + "|" + type, n);
        }
        suffixCounts = map;
        suffixCountsVocab = vocab;
      }

      /* ═══════════════════════════════════════
   IPA + EXAMPLES
═══════════════════════════════════════ */
      let staticExamples = {};
      let ecdictExamples = {};
      let localIPA = {}; // 本地音标（data/ipa.json，来自 ECDICT）
      let wordnetRel = {}; // WordNet 同/反义关系（data/wordnet_rel.json）
      let localWords = new Set(); // 本地 3W 词库词（小写）
      let vocabByWord = new Map(); // 小写词 → vocab 条目

      // 加载例句数据 + 本地音标 + WordNet 关系，完成后刷新已渲染卡片
      Promise.all([
        fetch("data/examples.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch("data/ecdict-examples.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch("data/ipa.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch("data/wordnet_rel.json").then(r => r.ok ? r.json() : {}).catch(() => ({})),
      ]).then(([ex, ec, ipa, wnRel]) => {
        staticExamples = ex;
        ecdictExamples = ec;
        localIPA = ipa || {};
        wordnetRel = wnRel || {};
        // 本地音标就绪后构建音节索引，刷新音节结构页签计数
        buildSyllableMeta();
        renderPhonicsBar();
        // 刷新已渲染卡片：例句 + 音标（本地音标就绪后合并显示）
        document.querySelectorAll(".card[data-word]").forEach(card => {
          const exEl = card.querySelector(".card-examples");
          const ipaEl = card.querySelector(".word-phonetic");
          const word = card.dataset.word;
          const cached = getIPACache()[word];
          const apiEx = (cached && typeof cached === "object" && cached.examples) ? cached.examples : [];
          const merged = mergeExamples(word, apiEx);
          renderExamples(exEl, word, merged, false);
          // 已显示过音标的卡片（非 "..." 占位）→ 用本地音标重新合并
          if (ipaEl && ipaEl.textContent !== "...") {
            const remote = (cached && typeof cached === "object") ? (cached.ipa || "") : "";
            renderPhonetic(word, ipaEl, remote);
          }
        });
      });

      function getIPACache() {
        try {
          return JSON.parse(localStorage.getItem("ipa-cache") || "{}");
        } catch {
          return {};
        }
      }
      function setIPACache(word, ipa, examples) {
        const cache = getIPACache();
        cache[word] = { ipa: ipa || "", examples: examples || [] };
        const keys = Object.keys(cache);
        if (keys.length > 5000)
          keys.slice(0, keys.length - 5000).forEach((k) => delete cache[k]);
        localStorage.setItem("ipa-cache", JSON.stringify(cache));
      }
      // 本地音标查询（data/ipa.json，键为小写）
      function getLocalIPA(word) {
        return localIPA[word.toLowerCase()] || "";
      }

      // 重建「本地 3W 词库」索引（随词库切换更新）；用于区分本地库 / WordNet 扩展词
      function rebuildLocalIndex() {
        localWords = new Set();
        vocabByWord = new Map();
        for (const v of (vocab || [])) {
          const k = (v.word || "").toLowerCase();
          if (!k) continue;
          localWords.add(k);
          if (!vocabByWord.has(k)) vocabByWord.set(k, v);
        }
      }

      // 音标渲染：本地（强调色）+ 远程（灰色）同行并列，用颜色区分，相同则只显示一个
      function renderPhonetic(word, element, remoteIPA) {
        const local = getLocalIPA(word);
        const remote = remoteIPA || "";
        element.innerHTML = "";
        const items = [];
        if (local) items.push({ cls: "ipa-local", ipa: local });
        if (remote && remote !== local) items.push({ cls: "ipa-remote", ipa: remote });
        if (!items.length) {
          element.style.opacity = "";
          return;
        }
        items.forEach((it, i) => {
          if (i > 0) {
            const sep = document.createElement("span");
            sep.className = "ipa-sep";
            sep.textContent = "·";
            element.appendChild(sep);
          }
          const ip = document.createElement("span");
          ip.className = "ipa-text " + it.cls;
          ip.textContent = it.ipa;
          element.appendChild(ip);
        });
        element.style.opacity = "0.8";
      }

      async function fetchIPA(word, element, exampleEl) {
        let cache = getIPACache();
        let cached = cache[word];

        // 兼容旧格式（纯字符串）→ 删除旧条目，按新逻辑重新获取
        if (typeof cached === "string") {
          delete cache[word];
          localStorage.setItem("ipa-cache", JSON.stringify(cache));
          cached = null;
        }

        // 1) 本地音标立即显示（如远程已有缓存则直接合并）
        const remoteCached = (cached && typeof cached === "object") ? (cached.ipa || "") : "";
        renderPhonetic(word, element, remoteCached);

        // 2) 静态例句先展示
        const staticEx = staticExamples[word.toLowerCase()];
        if (staticEx) {
          renderExamples(exampleEl, word, normalizeStatic(staticEx).map(t => ({ text: t, source: "ai" })), false);
        } else if (!cached) {
          renderExamples(exampleEl, word, [], true); // loading
        }

        // 3) 已有完整缓存（对象格式）→ 渲染例句并补充 Tatoeba，结束
        if (cached && typeof cached === "object") {
          const merged = mergeExamples(word, cached.examples || []);
          renderExamples(exampleEl, word, merged, false);
          getTatoeba(word).then(tatoebaEx => {
            if (tatoebaEx.length) {
              tatoebaEx.forEach(t => {
                if (!merged.some(m => m.text.toLowerCase() === t.toLowerCase()))
                  merged.push({ text: t, source: "tatoeba" });
              });
              renderExamples(exampleEl, word, merged, false);
            }
          });
          return;
        }

        try {
          const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
            { signal: AbortSignal.timeout(6000) },
          );
          if (!res.ok) {
            // 确认查无此词（404 等）→ 缓存空值避免反复请求；本地音标继续顶住
            setIPACache(word, "", []);
            renderPhonetic(word, element, "");
            const fallback = staticEx ? normalizeStatic(staticEx).map(t => ({ text: t, source: "ai" })) : [];
            renderExamples(exampleEl, word, fallback, false);
            return;
          }
          const data = await res.json();
          const ipa =
            data[0]?.phonetics?.find((p) => p.text)?.text ||
            data[0]?.phonetic ||
            "";
          const apiExamples = [];
          data.forEach(entry => {
            entry.meanings?.forEach(m => {
              m.definitions?.forEach(d => {
                if (d.example && !apiExamples.includes(d.example)) {
                  apiExamples.push(d.example);
                }
              });
            });
          });
          setIPACache(word, ipa, apiExamples);
          renderPhonetic(word, element, ipa); // 本地 + 远程合并显示
          const merged = mergeExamples(word, apiExamples);
          renderExamples(exampleEl, word, merged, false);

          // 异步补充 Tatoeba2
          getTatoeba(word).then(tatoebaEx => {
            if (tatoebaEx.length) {
              tatoebaEx.forEach(t => {
                if (!merged.some(m => m.text.toLowerCase() === t.toLowerCase()))
                  merged.push({ text: t, source: "tatoeba" });
              });
              renderExamples(exampleEl, word, merged, false);
            }
          });
        } catch {
          // 网络失败/超时：不写缓存（下次还能重试），本地音标保持显示
          renderExamples(exampleEl, word, staticEx ? normalizeStatic(staticEx).map(t => ({ text: t, source: "ai" })) : [], false);
        }
      }

      function normalizeStatic(ex) {
        const arr = [];
        if (ex.spoken) arr.push(...(Array.isArray(ex.spoken) ? ex.spoken : [ex.spoken]));
        if (ex.written) arr.push(...(Array.isArray(ex.written) ? ex.written : [ex.written]));
        return arr;
      }

      // Tatoeba2 API（通过 CORS 代理）
      async function fetchTatoeba(word) {
        const baseUrl = `https://tatoeba.org/en/api_v0/search?query=${encodeURIComponent(word)}&from=eng&orphans=no&unapproved=no&sort=relevance&limit=10`;
        const proxies = [
          url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
          url => url, // 直连（如果服务端允许 CORS）
        ];
        for (const proxy of proxies) {
          try {
            const res = await fetch(proxy(baseUrl), { signal: AbortSignal.timeout(4000) });
            if (!res.ok) continue;
            const data = await res.json();
            return (data.results || [])
              .map(r => r.text)
              .filter(t => t.length > 15 && t.toLowerCase().includes(word.toLowerCase()))
              .slice(0, 3);
          } catch { continue; }
        }
        return [];
      }

      // ECDICT 缓存（避免重复请求 Tatoeba）
      const tatoebaCache = {};
      function getTatoeba(word) {
        const key = word.toLowerCase();
        if (key in tatoebaCache) return Promise.resolve(tatoebaCache[key]);
        return fetchTatoeba(word).then(r => { tatoebaCache[key] = r; return r; });
      }

      function mergeExamples(word, apiExamples) {
        const key = word.toLowerCase();
        const staticEx = staticExamples[key];
        const staticArr = staticEx ? normalizeStatic(staticEx) : [];
        const ecArr = ecdictExamples[key]?.ec || [];

        // 标记来源：{ text, source }
        const result = [];
        // 1. ECDICT
        ecArr.forEach(t => {
          if (!result.some(r => r.text.toLowerCase() === t.toLowerCase()))
            result.push({ text: t, source: "ecdict" });
        });
        // 2. AI 静态
        staticArr.forEach(t => {
          if (!result.some(r => r.text.toLowerCase() === t.toLowerCase())) {
            const isSpoken = staticEx?.spoken?.includes(t);
            result.push({ text: t, source: isSpoken ? "ai-spoken" : "ai-written" });
          }
        });
        // 3. Free Dictionary API
        apiExamples.forEach(t => {
          if (!result.some(r => r.text.toLowerCase() === t.toLowerCase()))
            result.push({ text: t, source: "dictapi" });
        });
        return result;
      }

      function renderExamples(el, word, examples, loading) {
        if (!el) return;
        el.innerHTML = "";
        const isList = document.getElementById("grid").classList.contains("list-view");

        if (loading && isList) {
          el.style.display = "";
          el.innerHTML = '<div class="example-skeleton"></div>';
          return;
        }

        if (!examples.length) {
          el.style.display = "none";
          return;
        }

        el.style.display = "";
        const escWord = esc(word);
        const wordRegex = new RegExp(`(${escWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");

        examples.forEach(({ text, source }) => {
          const div = document.createElement("div");
          div.className = "example-sentence";
          const highlighted = esc(text).replace(wordRegex, '<span class="example-hl">$1</span>');

          let icon = "•";
          let iconClass = "";
          if (source === "ai-spoken") { icon = "口语"; iconClass = "spoken"; }
          else if (source === "ai-written") { icon = "书面"; iconClass = "written"; }
          else if (source === "ecdict") { icon = "ECD"; iconClass = "ecdict"; }
          else if (source === "tatoeba") { icon = "Tat"; iconClass = "tatoeba"; }
          else if (source === "dictapi") { icon = "API"; iconClass = "dictapi"; }

          div.innerHTML =
            `<span class="example-icon ${iconClass}">${icon}</span>` +
            `<span>${highlighted}</span>`;
          el.appendChild(div);
        });
      }

      /* ═══════════════════════════════════════
   DETAIL PANEL (List View master-detail)
═══════════════════════════════════════ */
      const POS_ZH = {
        noun: "名词", verb: "动词", adj: "形容词", adv: "副词",
        pron: "代词", det: "限定词", prep: "介词", conj: "连词",
        interj: "感叹词", num: "数词", other: "其他",
      };

      function buildDetailExamples(word) {
        const key = word.toLowerCase();
        const out = [];
        const sp = staticExamples[key];
        if (sp) {
          (sp.spoken || []).forEach(t => out.push({ text: t, source: "ai-spoken" }));
          (sp.written || []).forEach(t => out.push({ text: t, source: "ai-written" }));
        }
        const ec = ecdictExamples[key];
        if (ec && Array.isArray(ec.ec)) {
          ec.ec.forEach(t => out.push({ text: t, source: "ecdict" }));
        }
        return out;
      }

      function showDetailPanel(item) {
        const panel = document.getElementById("detailPanel");
        const content = document.getElementById("detailContent");
        const placeholder = panel && panel.querySelector(".detail-placeholder");
        if (!panel || !content) return;

        if (placeholder) placeholder.style.display = "none";
        content.style.display = "block";

        const w = encodeURIComponent(item.word);
        const phonetic = getLocalIPA(item.word) || "";
        const isMobile = window.innerWidth <= 1024;

        const posTags = (item.pos || [])
          .map(p => `<span class="detail-pos-tag">${POS_ZH[p] || p}</span>`)
          .join("");

        // 释义（CSV 中文释义）
        const defHTML = item.def
          ? `<div class="detail-section"><div class="detail-section-title">释义</div><div class="detail-def">${esc(item.def)}</div></div>`
          : "";

        // 例句
        const examples = buildDetailExamples(item.word);
        const exampleHTML = examples.length
          ? `<div class="detail-section"><div class="detail-section-title">例句</div>` +
            examples.map(({ text, source }) => {
              let icon = "•", cls = "";
              if (source === "ai-spoken") { icon = "口语"; cls = "spoken"; }
              else if (source === "ai-written") { icon = "书面"; cls = "written"; }
              else if (source === "ecdict") { icon = "ECD"; cls = "ecdict"; }
              const wordRegex = new RegExp(`(${esc(item.word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
              const hl = esc(text).replace(wordRegex, '<span class="example-hl">$1</span>');
              return `<div class="example-sentence"><span class="example-icon ${cls}">${icon}</span><span>${hl}</span></div>`;
            }).join("") + `</div>`
          : "";

        // 搜索词高亮
        const searchQ = currentFilter.search;
        let detailWordHTML = esc(item.word);
        if (searchQ) {
          const searchRegex = new RegExp(`(${searchQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
          detailWordHTML = detailWordHTML.replace(searchRegex, '<span class="search-hl">$1</span>');
        }

        content.innerHTML = `
          <div class="detail-header">
            ${isMobile ? '<button class="detail-close-btn" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>' : ""}
            <div class="detail-title-row">
              <div class="detail-word">${detailWordHTML}</div>
              ${posTags ? `<div class="detail-pos">${posTags}</div>` : ""}
              ${phonetic ? `<span class="detail-phonetic">${esc(phonetic)}</span>` : ""}
              <button class="detail-play-btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/></svg>
              </button>
              <div class="detail-links">
                <a href="https://dict.eudic.net/dicts/en/${w}" target="_blank" class="dict-link-btn"><span>Eudic</span></a>
                <a href="https://www.onelook.com/?w=${w}&phrases=1" target="_blank" class="dict-link-btn"><span>OneLook</span></a>
                <a href="https://www.ldoceonline.com/dictionary/${w}" target="_blank" class="dict-link-btn"><span>Longman</span></a>
              </div>
            </div>
          </div>
          <div class="detail-body">
            ${defHTML}
            ${exampleHTML}
          </div>
        `;

        content.querySelector(".detail-play-btn")?.addEventListener("click", () => playDetailWord(item.word));
        content.querySelector(".detail-close-btn")?.addEventListener("click", closeDetailPanel);
      }

      function closeDetailPanel() {
        const panel = document.getElementById("detailPanel");
        const content = document.getElementById("detailContent");
        const placeholder = panel && panel.querySelector(".detail-placeholder");
        if (placeholder) placeholder.style.display = "flex";
        if (content) { content.style.display = "none"; content.innerHTML = ""; }
        document.querySelectorAll(".card.selected").forEach(c => c.classList.remove("selected"));
      }

      function playDetailWord(word) {
        const cached = AudioCache.get(word);
        const audio = cached ? cached : new Audio(AudioCache._url(word));
        audio.play().catch(() => {});
      }

      /* ═══════════════════════════════════════
   WORDNET 关联探索器（仅 list 模式 · 右侧详情面板内）
   以任意词为起点，无限层级探索同/反义词；面包屑 + 悬浮栏防迷失。
═══════════════════════════════════════ */
      const REL_ORDER = ["v", "n", "adj", "adv"];
      const REL_POS_LABEL = { v: "v.", n: "n.", adj: "adj.", adv: "adv." };
      const DEPTH_WARN = 5; // 深度预警阈值

      const Explorer = (() => {
        let path = []; // 探索路径（词串），栈顶 = 当前主词

        const isLocal = (w) => localWords.has(String(w).toLowerCase());
        const relOf = (w) => wordnetRel[String(w).toLowerCase()] || null;

        // 为任意词构造详情条目：本地词取词库释义/音标，WordNet 扩展词取 mini gloss
        function buildItem(word) {
          const k = word.toLowerCase();
          const local = vocabByWord.get(k);
          if (local) return { word: local.word, def: local.def, pos: local.pos };
          const rel = relOf(word);
          const pos = [];
          if (rel) REL_ORDER.forEach(p => { if (rel.syn[p] || rel.ant[p]) pos.push(REL_POS_LABEL[p]); });
          const def = rel && rel.g ? rel.g : "";
          return { word, def, pos };
        }

        // 复用详情面板 Header + 释义 + 例句 结构（与 showDetailPanel 一致）
        function coreHTML(item, isMobile) {
          const w = encodeURIComponent(item.word);
          const phonetic = getLocalIPA(item.word) || "";
          const posTags = (item.pos || [])
            .map(p => `<span class="detail-pos-tag">${POS_ZH[p] || p}</span>`)
            .join("");
          const defHTML = item.def
            ? `<div class="detail-section"><div class="detail-section-title">释义</div><div class="detail-def">${esc(item.def)}</div></div>`
            : "";
          const examples = buildDetailExamples(item.word);
          const exampleHTML = examples.length
            ? `<div class="detail-section"><div class="detail-section-title">例句</div>` +
              examples.map(({ text, source }) => {
                let icon = "•", cls = "";
                if (source === "ai-spoken") { icon = "口语"; cls = "spoken"; }
                else if (source === "ai-written") { icon = "书面"; cls = "written"; }
                else if (source === "ecdict") { icon = "ECD"; cls = "ecdict"; }
                const wordRegex = new RegExp(`(${esc(item.word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
                const hl = esc(text).replace(wordRegex, '<span class="example-hl">$1</span>');
                return `<div class="example-sentence"><span class="example-icon ${cls}">${icon}</span><span>${hl}</span></div>`;
              }).join("") + `</div>`
            : "";
          const searchQ = currentFilter.search;
          let detailWordHTML = esc(item.word);
          if (searchQ) {
            const searchRegex = new RegExp(`(${searchQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
            detailWordHTML = detailWordHTML.replace(searchRegex, '<span class="search-hl">$1</span>');
          }
          return `
          <div class="detail-header">
            ${isMobile ? '<button class="detail-close-btn" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg></button>' : ""}
            <div class="detail-title-row">
              <div class="detail-word">${detailWordHTML}</div>
              ${posTags ? `<div class="detail-pos">${posTags}</div>` : ""}
              ${phonetic ? `<span class="detail-phonetic">${esc(phonetic)}</span>` : ""}
              <button class="detail-play-btn" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/></svg>
              </button>
              <div class="detail-links">
                <a href="https://dict.eudic.net/dicts/en/${w}" target="_blank" class="dict-link-btn"><span>Eudic</span></a>
                <a href="https://www.onelook.com/?w=${w}&phrases=1" target="_blank" class="dict-link-btn"><span>OneLook</span></a>
                <a href="https://www.ldoceonline.com/dictionary/${w}" target="_blank" class="dict-link-btn"><span>Longman</span></a>
              </div>
            </div>
          </div>
          <div class="detail-body">
            ${defHTML}
            ${exampleHTML}
          </div>`;
        }

        // 渲染一组关系（近义 / 反义），按 POS 分组
        function relBlock(title, kind, rel) {
          if (!rel || !rel[kind]) return "";
          let html = `<div class="exp-group"><div class="exp-group-title">${title}</div>`;
          for (const pos of REL_ORDER) {
            const arr = rel[kind][pos];
            if (!arr || !arr.length) continue;
            html += `<div class="exp-sub"><span class="exp-pos">${REL_POS_LABEL[pos]}</span><div class="exp-list">`;
            arr.forEach(wd => {
              const isL = isLocal(wd);
              html += `<button class="rel-word ${isL ? "local" : "wordnet"}" data-word="${esc(wd)}">${esc(wd)}<span class="rel-tag">${isL ? "本地库" : "WordNet"}</span></button>`;
            });
            html += `</div></div>`;
          }
          html += `</div>`;
          return html;
        }

        function render() {
          const panel = document.getElementById("detailPanel");
          const content = document.getElementById("detailContent");
          if (!panel || !content) return;
          const ph = panel.querySelector(".detail-placeholder");
          if (ph) ph.style.display = "none";
          content.style.display = "block";

          const word = path[path.length - 1];
          const item = buildItem(word);
          const isMobile = window.innerWidth <= 1024;
          const rel = relOf(word);

          // 面包屑（顶部常驻单行可滚动）
          let crumbs = `<button class="exp-crumb exp-home" data-act="home">首页</button>`;
          path.forEach((ww, i) => {
            const cur = i === path.length - 1;
            crumbs += `<span class="exp-sep">›</span>` +
              (cur
                ? `<span class="exp-crumb current">${esc(ww)}</span>`
                : `<button class="exp-crumb" data-act="goto" data-i="${i}">${esc(ww)}</button>`);
          });

          const core = coreHTML(item, isMobile);

          const hasSyn = rel && rel.syn && Object.keys(rel.syn).length;
          const hasAnt = rel && rel.ant && Object.keys(rel.ant).length;
          const explore = hasSyn || hasAnt
            ? `<div class="exp-section">${relBlock("近义词", "syn", rel)}${relBlock("反义词", "ant", rel)}</div>`
            : `<div class="exp-empty">WordNet 中暂无该词的近义 / 反义关系</div>`;

          const depthIdx = path.length - 1;
          const depthLabel = depthIdx === 0 ? "起点" : `第 ${depthIdx} 层`;
          const warn = depthIdx >= DEPTH_WARN ? "warn" : "";
          const sticky = `<div class="exp-sticky ${warn}"><span class="exp-depth">深度：${depthLabel}</span><button class="exp-tostart" data-act="tostart">一键返回起点</button></div>`;

          content.innerHTML = `<div class="exp-breadcrumb">${crumbs}</div>${core}${explore}${sticky}`;

          // 事件绑定
          content.querySelector(".detail-play-btn")?.addEventListener("click", () => playDetailWord(word));
          content.querySelector(".detail-close-btn")?.addEventListener("click", closeDetailPanel);
          content.querySelector(".exp-crumb.exp-home")?.addEventListener("click", () => home());
          content.querySelectorAll('.exp-crumb[data-act="goto"]').forEach(b =>
            b.addEventListener("click", () => goto(parseInt(b.dataset.i, 10))));
          content.querySelector(".exp-tostart")?.addEventListener("click", () => toStart());
          content.querySelectorAll(".rel-word").forEach(b =>
            b.addEventListener("click", () => drill(b.dataset.word)));
        }

        function start(w) { path = [w]; render(); }
        function drill(w) {
          if (String(w).toLowerCase() === String(path[path.length - 1]).toLowerCase()) return;
          path.push(w); render();
        }
        function goto(i) { path = path.slice(0, i + 1); render(); }
        function toStart() { if (path.length) { path = [path[0]]; render(); } }
        function home() { path = []; closeDetailPanel(); }

        return { start, drill, goto, toStart, home, render };
      })();

      // IntersectionObserver-based IPA — no hard cap, loads as cards enter viewport
      const ipaObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const card = entry.target;
              const ipaEl = card.querySelector(".word-phonetic");
              const exEl = card.querySelector(".card-examples");
              if (ipaEl && ipaEl.textContent === "...")
                fetchIPA(card.dataset.word, ipaEl, exEl);
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
        // Phonics: letter-combination filter (e.g. ee / ai / a_e; whole = all combos of a sub-category)
        if (currentFilter.phonics) {
          const re = currentFilter.phonics.whole
            ? phonicsGroupRegex(currentFilter.phonics.catId)
            : phonicsRegex(currentFilter.phonics.combo);
          filteredVocab = filteredVocab.filter((v) => re.test(v.word));
        }
        // Syllable structure: syllable count + per-position skeletons (based on local IPA; words without IPA are excluded)
        if (sylActive(currentFilter.syllable)) {
          const syl = currentFilter.syllable;
          filteredVocab = filteredVocab.filter((v) =>
            sylWordMatch(syl, v.word.toLowerCase()),
          );
        }
        // Search filter: match word or definition
        if (currentFilter.search) {
          const q = currentFilter.search;
          filteredVocab = filteredVocab.filter((v) => {
            const word = v.word.toLowerCase();
            const def = (v.def || "").toLowerCase();
            return word.includes(q) || def.includes(q);
          });
        }
        // 语义分类筛选：cluster===null 不过滤；-1 = OOV「其他」；否则按簇号匹配
        if (currentFilter.cluster !== null && currentFilter.cluster !== undefined) {
          if (currentFilter.cluster === -1) {
            // wordMap 中 OOV 词的 cluster 已标为 -1；undefined 为兜底
            filteredVocab = filteredVocab.filter((v) => v.cluster === -1 || v.cluster === undefined);
          } else {
            filteredVocab = filteredVocab.filter((v) => v.cluster === currentFilter.cluster);
          }
        }

        // 排序
        if (azSortOrder) {
          filteredVocab = [...filteredVocab].sort((a, b) => {
            const cmp = a.word.localeCompare(b.word, undefined, { sensitivity: 'base' });
            return azSortOrder === 'asc' ? cmp : -cmp;
          });
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

        // 语义分类：选中某簇时，列表顶部显示「簇名 · N 词」标题条
        if (currentFilter.cluster !== null && currentFilter.cluster !== undefined) {
          let title = "其他";
          if (currentFilter.cluster !== -1 && clusterData) {
            const c = clusterData.clusters?.find((x) => x.id === currentFilter.cluster);
            if (c) title = c.name;
          }
          const head = document.createElement("div");
          head.className = "category-head";
          head.innerHTML = `<span class="category-head-name">${esc(title)}</span><span class="category-head-count">${filteredVocab.length} 词</span>`;
          document.getElementById("grid").appendChild(head);
        }

        if (!filteredVocab.length) {
          document.getElementById("grid").innerHTML =
            `<div class="empty-state"><div class="icon">${icon("magnifying-glass", 40)}</div><p>No words match this filter.<br>Try a different combination.</p></div>`;
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
          const card = createCard(item, sfxReg, currentFilter.phonics);
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

      function createCard(item, sfxReg, phonicsInfo) {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.word = item.word;
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "article");
        card.setAttribute("aria-label", item.word);

        let wordHTML = esc(item.word);
        // Phonics: highlight the matched letter combination (takes priority over suffix highlight)
        if (phonicsInfo) {
          const re = phonicsInfo.whole
            ? new RegExp(phonicsGroupRegex(phonicsInfo.catId).source, "gi")
            : phonicsRegex(phonicsInfo.combo);
          wordHTML = wordHTML.replace(
            re,
            (m) => `<span class="highlight combo-hl">${m}</span>`,
          );
        } else if (sfxReg) {
          wordHTML = wordHTML.replace(
            sfxReg,
            (m) => `<span class="highlight">${m}</span>`,
          );
        }
        // Search highlight for word
        const searchQ = currentFilter.search;
        if (searchQ) {
          const searchRegex = new RegExp(`(${searchQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
          wordHTML = wordHTML.replace(searchRegex, '<span class="search-hl">$1</span>');
        }
        const w = encodeURIComponent(item.word);

        // Phonics corner tag: combo · sound; whole-category filter shows the category name
        const comboTag = phonicsInfo
          ? phonicsInfo.whole
            ? `<span class="combo-tag" title="${esc(phonicsInfo.category)} · all combinations">${esc(phonicsInfo.category)}</span>`
            : `<span class="combo-tag" title="${esc(phonicsInfo.category)} · ${esc(phonicsInfo.sound)}">${esc(phonicsInfo.combo)}<i>${esc(phonicsInfo.sound)}</i></span>`
          : "";

        card.innerHTML = `
    <div class="card-inner">
        <div class="word-header">
            <div class="word-text">${wordHTML}</div>
            ${comboTag}
        </div>
        <div class="word-phonetic" data-word="${esc(item.word)}">...</div>
        <div class="word-def">${esc(item.def)}</div>
        <div class="card-examples" style="display:none">
          <div class="example-skeleton"></div>
        </div>
        <div class="card-links">
            <a href="https://dict.eudic.net/dicts/en/${w}" target="_blank" class="dict-link en-cn" title="Eudic">中文</a>
            <a href="https://www.onelook.com/?w=${w}&phrases=1" target="_blank" class="dict-link en-en" title="OneLook">EN</a>
            <a href="https://www.ldoceonline.com/dictionary/${w}" target="_blank" class="dict-link en-cn" title="Longman">Longman</a>
        </div>
    </div>`;
        let cardAudio = null;
        function playWord() {
          // 播放器激活时不播放单独音频，避免冲突
          if (playerState && playerState.active) {
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

          const cached = AudioCache.get(item.word);
          const audio = cached ? cached : new Audio(AudioCache._url(item.word));
          cardAudio = audio;
          audio.play().catch(() => {});
          audio.onended = () => { card.classList.remove("speaking"); cardAudio = null; };
          audio.onerror = () => { card.classList.remove("speaking"); cardAudio = null; };
        }


               card.addEventListener("click", (e) => {
          if (e.target.closest("a")) return;

          // ✅ 主从布局（list-view）：点击单词 → 右侧详情面板（WordNet 关联探索器）
          if (document.getElementById("grid").classList.contains("list-view")) {
            Explorer.start(item.word);
            document.querySelectorAll(".card.selected").forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
            playWord();
            return;
          }

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

          if (playerState && playerState.active) {
            e.preventDefault();
            if (e.key === " ") {
              if (playerState.playing) {
                playerState.playing = false;
                clearTimeout(playerState.timer);
                if (playerState.audio) playerState.audio.pause();
                document.getElementById("playerPlay").innerHTML = icon("play", 18);
              } else {
                playCurrentWord();
              }
            }
            return;
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
  const iconEl = this.querySelector('.icon');

  if (isMobile()) {
    const hiding = grid.classList.toggle("hide-all-def");
    this.classList.toggle("active", hiding);
    label.textContent = hiding ? "Show All" : "Hide All";
    iconEl.innerHTML = hiding ? icon("eye") : icon("eye-slash");
  } else {
    showAllDef = !showAllDef;
    grid.classList.toggle("show-all-def", showAllDef);
    grid.classList.toggle("show-all-examples", showAllDef);
    this.classList.toggle("active", showAllDef);
    label.textContent = showAllDef ? "Hide All" : "Show All";
    iconEl.innerHTML = showAllDef ? icon("eye-slash") : icon("eye");
  }
});

      document
        .getElementById("vocabSelect")
        .addEventListener("change", (e) => {
          localStorage.setItem("vocab-selected-book", e.target.value);
          if (e.target.value === "ALL_BOOKS") loadAllBooks();
          else loadVocab(e.target.value);
        });

      document.getElementById("viewToggleBtn").addEventListener("click", function () {
  const grid = document.getElementById("grid");
  const label = this.querySelector('.label');
  const iconEl = this.querySelector('.icon');
  const detailPanel = document.getElementById("detailPanel");

  const isList = grid.classList.toggle("list-view");
  iconEl.innerHTML = isList ? icon("squares-2x2") : icon("list-bullet");
  label.textContent = isList ? "Card" : "List";
  localStorage.setItem("vocab-view", isList ? "list" : "card");

  // 显示/隐藏右侧详情面板
  if (detailPanel) {
    detailPanel.style.display = isList ? "flex" : "none";
    if (!isList) {
      const ph = detailPanel.querySelector(".detail-placeholder");
      const ct = document.getElementById("detailContent");
      if (ph) ph.style.display = "flex";
      if (ct) { ct.style.display = "none"; ct.innerHTML = ""; }
    }
  }
});

// ── 初始化恢复视图状态（默认左/右主从布局）──
(function initView() {
  const saved = localStorage.getItem("vocab-view");
  const grid = document.getElementById("grid");
  const detailPanel = document.getElementById("detailPanel");
  const btn = document.getElementById("viewToggleBtn");
  // 未显式选过卡片视图 → 默认主从（list）布局
  if (saved !== "card") {
    grid.classList.add("list-view");
    if (detailPanel) detailPanel.style.display = "flex";
    btn.querySelector('.icon').innerHTML = icon("squares-2x2");
    btn.querySelector('.label').textContent = "Card";
  } else if (detailPanel) {
    detailPanel.style.display = "none";
  }
})();


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
  document.getElementById("playModeBtn").querySelector(".icon").innerHTML = icon("pause");
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
  AudioCache.clear(); // 清空预加载缓存
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
  document.getElementById("playModeBtn").querySelector(".icon").innerHTML = icon("play");
  document.getElementById("playerPlay").innerHTML = icon("play", 18);
}

function playCurrentWord() {
  if (!playerState.active) return;
  if (playerState.currentIndex >= filteredVocab.length) { stopPlayer(); return; }

  playerState.playing = true;
  document.getElementById("playerPlay").innerHTML = icon("pause", 18);

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

  // 预加载后面 5 个词的音频
  AudioCache.preloadAhead(filteredVocab, playerState.currentIndex, 5);
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

  // 重试逻辑：失败后等 500ms 重试一次，还失败才跳过
  let retried = false;
  function retryOrSkip() {
    if (retried) {
      if (typeof onSkip === 'function') onSkip();
      safeNext();
      return;
    }
    retried = true;
    setTimeout(() => {
      if (!playerState.active) return;
      // 重新尝试：新建 Audio 再试一次
      const retryAudio = new Audio(AudioCache._url(word));
      retryAudio.playbackRate = parseFloat(document.getElementById("playerSpeed").value) || 1;
      retryAudio.onerror = () => {
        if (typeof onSkip === 'function') onSkip();
        safeNext();
      };
      retryAudio.onended = () => {
        if (moved) return;
        playerState.repeatIndex++;
        if (playerState.repeatIndex < playerState.repeatCount) {
          setTimeout(() => {
            if (playerState.active) playWordAudio(word, onSkip);
          }, 600);
        } else {
          safeNext();
        }
      };
      playerState.audio = retryAudio;
      retryAudio.play().catch(() => {
        if (typeof onSkip === 'function') onSkip();
        safeNext();
      });
    }, 500);
  }

  // 优先从缓存获取
  const cached = AudioCache.get(word);
  const audio = cached ? cached : new Audio(AudioCache._url(word));
  audio.playbackRate = parseFloat(document.getElementById("playerSpeed").value) || 1;
  playerState.audio = audio;

  // 检测空音频 / 无效音频
  audio.addEventListener("loadedmetadata", () => {
    if (!audio.duration || isNaN(audio.duration) || audio.duration < 0.1) {
      audio.pause();
      retryOrSkip();
    }
  }, { once: true });

  // 播放失败 → 重试
  audio.play().catch(() => retryOrSkip());

  audio.onended = () => {
    if (moved) return;
    playerState.repeatIndex++;
    if (playerState.repeatIndex < playerState.repeatCount) {
      setTimeout(() => {
        if (playerState.active) playWordAudio(word, onSkip);
      }, 600);
    } else {
      // 预加载后面 5 个词
      AudioCache.preloadAhead(filteredVocab, playerState.currentIndex, 5);
      safeNext();
    }
  };

  // 网络错误 → 重试
  audio.onerror = () => retryOrSkip();
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
    document.getElementById("playerPlay").innerHTML = icon("play", 18);
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
    document.getElementById("playerPlay").innerHTML = icon("play", 18);
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
  btn.innerHTML = spellingState.showWords ? icon("eye-slash") : icon("eye");
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
  document.getElementById("spellingModeBtn").querySelector(".icon").innerHTML = icon("pause");
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
  document.getElementById("spellShowWords").innerHTML = icon("eye"); // ✅ 重置图标
  document.getElementById("spellShowWords").classList.remove("active");
  document.getElementById("spellingIntro").style.display = "none"; // ✅ 关闭弹窗
  document.body.classList.remove("spelling-mode");
  document.getElementById("spellingModeBtn").classList.remove("active");
  document.getElementById("spellingModeBtn").querySelector(".icon").innerHTML = icon("pencil-square");

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
  const cached = AudioCache.get(word);
  const audio = cached ? cached : new Audio(AudioCache._url(word));
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
   document.getElementById("spellShowWords").innerHTML = icon("eye");       // ✅ 新增
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
  const tag = document.activeElement?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

  if (playerState && playerState.active) {
    if (e.key === " ") {
      e.preventDefault();
      if (playerState.playing) {
        playerState.playing = false;
        clearTimeout(playerState.timer);
        if (playerState.audio) playerState.audio.pause();
        document.getElementById("playerPlay").innerHTML = icon("play", 18);
      } else {
        playCurrentWord();
      }
    }
    if (e.key === "ArrowLeft") { e.preventDefault(); goToPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); document.getElementById("playerNext").click(); }
    return;
  }

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
          `<div class="empty-state"><div class="icon">${icon("exclamation-triangle", 40)}</div><p>${msg}</p></div>`;
      }
 