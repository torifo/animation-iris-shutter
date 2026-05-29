/* ────────────────────────────────────────────
   A·Tr · Iris Shutter
   - 多枚葉アイリス絞り：SVG の三角 blade を rim-pivot で回転
   - close(staggered) → swap(callback) → open(staggered) の 3 フェーズ
   - data-iris ルートに自動初期化、el._iris.transition(swap) で発火
   - REEL ZERO controller：thumb 直接ジャンプ + arrow keys + 進捗バー
   ──────────────────────────────────────────── */

(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ════════════ IrisShutter ════════════
  function initIris(root) {
    const stage  = root.querySelector('.reel-stage') || root;
    const target = root.querySelector('[data-iris-target]');
    if (!target) return;

    const blades   = clampInt(root.dataset.irisBlades, 6, 3, 12);
    const closeMs  = clampInt(root.dataset.irisClose, 440, 80, 2000);
    const holdMs   = clampInt(root.dataset.irisHold, 120,  0, 1200);
    const openMs   = clampInt(root.dataset.irisOpen,  520, 80, 2000);
    const stagger  = clampInt(root.dataset.irisStagger, 32, 0, 200);

    // SVG 構築
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '-100 -100 200 200');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('iris-svg');

    // 内側ヘアラインの輪（aperture の縁を仄かに示唆）— 画面に映る最小領域に置く
    const rim = document.createElementNS(SVG_NS, 'circle');
    rim.setAttribute('cx','0'); rim.setAttribute('cy','0'); rim.setAttribute('r','86');
    rim.classList.add('rim');
    svg.appendChild(rim);

    // 各 blade の local 形状（rim=130：広いフレームでも隅まで覆う）
    const BLADE_RIM = 130;
    const sectorHalf = 360 / (2 * blades);
    const overlap = 7;
    const half = (sectorHalf + overlap) * Math.PI / 180;
    const h = Math.sin(half) * BLADE_RIM;
    const xOuter = Math.cos(half) * BLADE_RIM;
    const innerTipX = -42;

    const bladesGroup = document.createElementNS(SVG_NS, 'g');
    bladesGroup.setAttribute('class', 'blades');

    for (let i = 0; i < blades; i++) {
      const posDeg = (360 / blades) * i;
      const posG = document.createElementNS(SVG_NS, 'g');
      posG.setAttribute('transform', `rotate(${posDeg})`);

      const blade = document.createElementNS(SVG_NS, 'polygon');
      blade.setAttribute('points',
        `${xOuter},${-h} ${xOuter},${h} ${innerTipX},0`);
      blade.classList.add('blade');
      blade.style.setProperty('--iris-dly', `${i * stagger}ms`);

      posG.appendChild(blade);
      bladesGroup.appendChild(posG);
    }
    svg.appendChild(bladesGroup);

    // 閉じ切ったときの中央フラッシュ
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx','0'); dot.setAttribute('cy','0'); dot.setAttribute('r','3');
    dot.classList.add('center-dot');
    svg.appendChild(dot);

    // iris-svg はフレーム内に append（topbar/thumbs/controls を覆わない）
    target.appendChild(svg);

    root.setAttribute('data-iris-state', 'open');

    const lastDelay = (blades - 1) * stagger;
    const closeEach = Math.max(80, closeMs - lastDelay);
    const openEach  = Math.max(80, openMs  - lastDelay);
    setBladeDuration(svg, openEach);

    let busy = false;
    root._iris = {
      get busy() { return busy; },
      transition(swapFn) {
        if (busy) return Promise.resolve(false);
        busy = true;

        if (REDUCED) {
          safe(swapFn);
          busy = false;
          return Promise.resolve(true);
        }

        return new Promise((resolve) => {
          setBladeDuration(svg, closeEach);
          root.setAttribute('data-iris-state', 'closing');

          const closeTotal = closeEach + lastDelay;
          setTimeout(() => {
            root.setAttribute('data-iris-state', 'closed');
            safe(swapFn);

            setTimeout(() => {
              setBladeDuration(svg, openEach);
              root.setAttribute('data-iris-state', 'opening');
              const openTotal = openEach + lastDelay;
              setTimeout(() => {
                root.setAttribute('data-iris-state', 'open');
                busy = false;
                resolve(true);
              }, openTotal + 40);
            }, holdMs);
          }, closeTotal + 40);
        });
      },
    };
  }

  function setBladeDuration(svg, ms) {
    svg.style.setProperty('--iris-d', `${ms}ms`);
  }

  function clampInt(raw, fallback, min, max) {
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function safe(fn) { try { fn && fn(); } catch (e) { console.error(e); } }

  // ════════════ Title char-split（reveal 用） ════════════
  function splitTitleChars(titleEl) {
    if (titleEl.dataset.split === 'done') return;

    const out = [];
    let idx = 0;
    const STAGGER = 28; // ms

    Array.from(titleEl.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        for (const c of text) {
          if (c === ' ' || c === ' ' || c === '\n' || c === '\t') {
            // 空白は plain text のまま（折り返し可能性を保つ）
            out.push(c === ' ' ? ' ' : ' ');
          } else {
            const esc = escapeHtml(c);
            const delay = idx * STAGGER;
            out.push(`<span class="ch" style="animation-delay:${delay}ms">${esc}</span>`);
            idx++;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          out.push('<br/>');
        } else {
          out.push(node.outerHTML);
        }
      }
    });

    titleEl.innerHTML = out.join('');
    titleEl.dataset.split = 'done';
  }

  function escapeHtml(c) {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    return c;
  }

  // ════════════ REEL ZERO controller ════════════
  function initReelController(root) {
    if (!root._iris) return;

    const films = Array.from(root.querySelectorAll('[data-film]'));
    if (films.length < 2) return;

    const prevBtn   = root.querySelector('[data-iris-prev]');
    const nextBtn   = root.querySelector('[data-iris-next]');
    const counterEl = root.querySelector('[data-counter-current]');
    const totalEl   = root.querySelector('[data-counter-total]');
    const progressEl= root.querySelector('[data-progress-bar]');
    const thumbs    = Array.from(root.querySelectorAll('[data-film-idx]'));

    // 全タイトルを char-split（1回だけ）
    films.forEach((f) => {
      const t = f.querySelector('.film-title');
      if (t) splitTitleChars(t);
    });

    let idx = films.findIndex(f => f.classList.contains('is-active'));
    if (idx < 0) idx = 0;

    if (totalEl) totalEl.textContent = String(films.length).padStart(2, '0');
    updateUI();

    function goto(target) {
      if (root._iris.busy) return;
      target = ((target % films.length) + films.length) % films.length;
      if (target === idx) return;

      setBtnsDisabled(true);

      root._iris.transition(() => {
        films[idx].classList.remove('is-active');
        films[target].classList.add('is-active');
        // タイトルのアニメーションを再発火（DOM 再構築で animation 再生）
        const newTitle = films[target].querySelector('.film-title');
        if (newTitle) {
          // animation を強制再スタート：clone & replace
          const clone = newTitle.cloneNode(true);
          newTitle.parentNode.replaceChild(clone, newTitle);
        }
        idx = target;
        updateUI();
      }).then(() => setBtnsDisabled(false));
    }

    function go(delta) { goto(idx + delta); }

    function updateUI() {
      if (counterEl) counterEl.textContent = String(idx + 1).padStart(2, '0');
      if (progressEl) {
        const pct = ((idx + 1) / films.length) * 100;
        progressEl.style.setProperty('--rp', `${pct}%`);
        // 直接 width 指定（CSS の var(--rp) 経由でも動くがフォールバックで両方）
        progressEl.style.width = `${pct}%`;
      }
      thumbs.forEach((t, i) => {
        t.classList.toggle('is-active', i === idx);
      });
    }

    function setBtnsDisabled(d) {
      if (prevBtn) prevBtn.disabled = d;
      if (nextBtn) nextBtn.disabled = d;
      thumbs.forEach(t => { t.disabled = d; });
    }

    prevBtn && prevBtn.addEventListener('click', () => go(-1));
    nextBtn && nextBtn.addEventListener('click', () => go(+1));

    thumbs.forEach((t) => {
      t.addEventListener('click', () => {
        const target = parseInt(t.dataset.filmIdx, 10);
        if (Number.isFinite(target)) goto(target);
      });
    });

    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.target?.isContentEditable) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(+1); }
    });
  }

  // ════════════ boot ════════════
  function boot() {
    document.querySelectorAll('[data-iris]').forEach((root) => {
      initIris(root);
      initReelController(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
