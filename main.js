/* SpongeBob & Patrick 500 — interactions & motion */
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* =========================================================
     CONTRACT ADDRESS — paste it here once live
     ========================================================= */
  const CA = 'ACVkPjBRHWMZEKExATPQaw6PwMZ7ED4wobxomeWGpump';
  if (CA) {
    $$('.js-ca').forEach(el => { el.textContent = CA; });
    const btn = $('.js-copy');
    if (btn) {
      btn.disabled = false;
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(CA); btn.textContent = 'Copied!'; }
        catch { btn.textContent = 'Copy failed'; }
        setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
      });
    }
  }

  /* =========================================================
     INTRO title card → then hero entrance
     ========================================================= */
  $$('.title .L').forEach((l, i) => l.style.setProperty('--i', i));
  const intro = $('#intro');
  const ready = () => root.classList.add('is-ready');

  if (intro && !root.classList.contains('no-intro')) {
    root.classList.add('intro-lock');
    const bubbleBox = $('.js-intro-bubbles');
    for (let i = 0; i < 22; i++) {
      const b = document.createElement('span');
      b.style.setProperty('--x', rand(0, 100) + '%');
      b.style.setProperty('--s', rand(14, 90) + 'px');
      b.style.setProperty('--t', rand(1.6, 2.8) + 's');
      b.style.setProperty('--d', rand(0, .9) + 's');
      bubbleBox.appendChild(b);
    }
    let done = false;
    const leave = () => {
      if (done) return; done = true;
      try { sessionStorage.setItem('sp-intro', '1'); } catch (e) {}
      intro.classList.add('is-out');
      root.classList.remove('intro-lock');
      setTimeout(ready, 260);
      setTimeout(() => intro.remove(), 1000);
    };
    intro.addEventListener('click', leave);
    window.addEventListener('keydown', leave, { once: true });
    setTimeout(leave, 2300);
  } else {
    intro && intro.remove();
    requestAnimationFrame(ready);
  }

  /* =========================================================
     BUBBLES in hero (click to pop)
     ========================================================= */
  const field = $('.js-bubbles');
  const popEls = $$('.js-pops');
  let pops = 0;
  const words = ['POP!', 'PLIP!', 'BLOOP!', 'PIP!', 'POMF!'];

  function spawnBubble() {
    if (!field || document.hidden) return;
    const b = document.createElement('span');
    b.className = 'bubble';
    b.style.setProperty('--x', rand(0, 96) + '%');
    b.style.setProperty('--s', rand(14, 60) + 'px');
    b.style.setProperty('--t', rand(7, 15) + 's');
    b.addEventListener('animationend', e => { if (e.animationName === 'rise' || e.animationName === 'pop') b.remove(); });
    b.addEventListener('pointerdown', e => {
      e.preventDefault();
      const r = b.getBoundingClientRect(), fr = field.getBoundingClientRect();
      const w = document.createElement('span');
      w.className = 'pop-word';
      w.textContent = words[Math.floor(Math.random() * words.length)];
      w.style.left = (r.left - fr.left + r.width / 2) + 'px';
      w.style.top = (r.top - fr.top + r.height / 2) + 'px';
      field.appendChild(w);
      w.addEventListener('animationend', () => w.remove());
      b.style.bottom = getComputedStyle(b).bottom;
      b.classList.add('is-pop');
      pops++;
      popEls.forEach(el => { el.textContent = pops.toLocaleString('en-US'); });
    });
    field.appendChild(b);
  }
  if (field && !reduce) {
    for (let i = 0; i < 6; i++) setTimeout(spawnBubble, i * 400);
    setInterval(spawnBubble, 900);
  }

  /* title letters: boing on tap */
  $$('.title .L').forEach(l => {
    l.addEventListener('click', () => {
      l.classList.remove('is-boing'); void l.offsetWidth; l.classList.add('is-boing');
      setTimeout(() => l.classList.remove('is-boing'), 450);
    });
  });

  /* =========================================================
     MARQUEES (ticker tape + crossing bands) — react to scroll speed
     ========================================================= */
  const flowerSvg = '<svg aria-hidden="true"><use href="#flower"/></svg>';
  $$('.js-marquee').forEach(track => {
    const parts = track.dataset.text.split('|');
    const unit = parts.map(p => `<span class="band__item">${p}${flowerSvg}</span>`).join('');
    track.innerHTML = unit.repeat(4);
    track.innerHTML += track.innerHTML; // two identical halves for seamless loop
  });
  const tape = $('#tape');
  if (tape) {
    tape.innerHTML += tape.innerHTML;
    $$('li', tape).forEach((li, i, all) => { if (i >= all.length / 2) li.setAttribute('aria-hidden', 'true'); });
  }
  const marquees = [];
  if (!reduce) {
    if (tape) { tape.classList.add('is-js'); marquees.push({ el: tape, speed: 0.6, x: 0 }); }
    $$('.js-marquee').forEach(el => marquees.push({ el, speed: parseFloat(el.dataset.speed) || 1, x: 0 }));
  }

  /* =========================================================
     SCROLL + POINTER state, one rAF loop
     ========================================================= */
  const hero = $('.hero');
  let lastY = window.scrollY, vel = 0, dir = 1;
  let mx = 0, my = 0, tmx = 0, tmy = 0;
  const gaugeFill = $('.js-gauge-fill'), gaugeBob = $('.js-gauge-bob'), depthEl = $('.js-depth');

  if (hero && finePointer && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      tmx = ((e.clientX - r.left) / r.width) * 2 - 1;
      tmy = ((e.clientY - r.top) / r.height) * 2 - 1;
    });
    hero.addEventListener('pointerleave', () => { tmx = 0; tmy = 0; });
  }

  function frame() {
    const y = window.scrollY;
    const dy = y - lastY; lastY = y;
    vel += (dy - vel) * 0.12;
    if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;

    // marquees: base speed + scroll boost, flips with scroll direction
    for (const m of marquees) {
      const half = m.el.scrollWidth / 2;
      if (!half) continue;
      m.x -= (m.speed * dir) * (1 + Math.min(Math.abs(vel) * 0.25, 10));
      if (m.x <= -half) m.x += half;
      if (m.x > 0) m.x -= half;
      m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0)`;
    }

    // hero parallax
    if (hero && !reduce) {
      mx += (tmx - mx) * 0.07; my += (tmy - my) * 0.07;
      const sy = Math.min(y, window.innerHeight * 1.2);
      hero.style.setProperty('--mx', mx.toFixed(4));
      hero.style.setProperty('--my', my.toFixed(4));
      hero.style.setProperty('--sy', sy.toFixed(1));
    }

    // depth gauge
    if (gaugeFill) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      gaugeFill.style.scale = `1 ${p}`;
      gaugeBob.style.top = (p * 100) + '%';
      depthEl.textContent = Math.round(p * 500);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* =========================================================
     CURSOR bubble trail
     ========================================================= */
  const trail = $('.js-trail');
  if (trail && finePointer && !reduce) {
    let last = 0;
    window.addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - last < 45 || trail.childElementCount > 28) return;
      last = now;
      const b = document.createElement('span');
      b.style.setProperty('--x', e.clientX + 'px');
      b.style.setProperty('--y', e.clientY + 'px');
      b.style.setProperty('--dx', rand(-18, 18) + 'px');
      b.style.setProperty('--s', rand(6, 16) + 'px');
      b.addEventListener('animationend', () => b.remove());
      trail.appendChild(b);
    }, { passive: true });
  }

  /* =========================================================
     MAGNETIC buttons
     ========================================================= */
  if (finePointer && !reduce) {
    $$('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        btn.classList.add('is-mag');
        btn.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px');
        btn.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.35).toFixed(1) + 'px');
      });
      btn.addEventListener('pointerleave', () => {
        btn.classList.remove('is-mag');
        btn.style.setProperty('--bx', '0px');
        btn.style.setProperty('--by', '0px');
      });
    });
  }

  /* =========================================================
     WAVE WIPE for in-page links
     ========================================================= */
  const wipe = $('.wipe');
  let wiping = false;
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? $(id) : null;
      if (!target && id !== '#top') return;
      e.preventDefault();
      const go = () => {
        const top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo({ top, behavior: 'instant' });
        history.replaceState(null, '', id);
      };
      if (reduce || !wipe) { const top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({ top, behavior: 'smooth' }); return; }
      if (wiping) return;
      wiping = true;
      wipe.classList.add('is-go');
      setTimeout(go, 560);
      wipe.addEventListener('animationend', () => { wipe.classList.remove('is-go'); wiping = false; }, { once: true });
    });
  });

  /* =========================================================
     SPLIT headings into letters
     ========================================================= */
  if (!reduce) {
    $$('.h2').forEach(h => {
      h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
      let i = 0;
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(part => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span');
              w.className = 'w'; w.setAttribute('aria-hidden', 'true');
              [...part].forEach(ch => {
                const c = document.createElement('span');
                c.className = 'ch'; c.textContent = ch; c.style.setProperty('--ci', i++);
                w.appendChild(c);
              });
              frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) {
            n.setAttribute('aria-hidden', 'true');
            walk(n);
          }
        });
      };
      walk(h);
      h.classList.add('is-split');
    });
  }

  /* =========================================================
     COUNT-UP numbers
     ========================================================= */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1500;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* =========================================================
     SPARKLINE (vibes only, always ends up)
     ========================================================= */
  const spark = $('.js-spark');
  const seeds = { '1D': 7, '1W': 19, '1Y': 42, 'ALL': 99 };
  function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  function drawSpark(tf) {
    if (!spark) return;
    const W = 600, H = 220, N = tf === 'ALL' ? 70 : 48;
    const r = rng(seeds[tf]);
    let v = 0; const pts = [];
    for (let i = 0; i < N; i++) {
      const drift = tf === 'ALL' ? 1.6 : 0.9;
      const jelly = r() < 0.08 ? -6 * r() : 0; // the odd jellyfish sting
      v += drift + (r() - 0.45) * 5 + jelly;
      pts.push(v);
    }
    const min = Math.min(...pts), max = Math.max(...pts);
    const xy = pts.map((p, i) => [(i / (N - 1)) * W, H - 14 - ((p - min) / (max - min || 1)) * (H - 34)]);
    const line = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const path = $('.spark__line', spark);
    path.setAttribute('d', line);
    $('.spark__area', spark).setAttribute('d', line + ` L${W} ${H} L0 ${H} Z`);
    if (!reduce) {
      const len = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.6,0,.2,1)';
      path.style.strokeDashoffset = 0;
    }
  }
  $$('.tf button').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tf button').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      drawSpark(btn.dataset.tf);
    });
  });

  /* =========================================================
     REVEAL on scroll (+ triggers for counters / sparkline)
     ========================================================= */
  const items = $$('.reveal, .char--chill');
  const counters = $$('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el, i) => {
      if (el.classList.contains('candle')) el.style.transitionDelay = ((i % 5) * 0.12) + 's';
      if (el.classList.contains('panel')) el.style.transitionDelay = ((i % 4) * 0.1) + 's';
      io.observe(el);
    });

    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        if (e.target.dataset.count) countUp(e.target);
        if (e.target === spark) drawSpark('ALL');
        cio.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
    if (spark) cio.observe(spark);
  } else {
    items.forEach(el => el.classList.add('is-in'));
    drawSpark('ALL');
  }
})();
