/* SpongeBob & Patrick 500 — interactions */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- ticker: duplicate list for seamless loop ---------- */
  const tape = document.getElementById('tape');
  if (tape) {
    tape.innerHTML += tape.innerHTML;
    tape.querySelectorAll('li').forEach((li, i) => { if (i >= tape.children.length / 2) li.setAttribute('aria-hidden', 'true'); });
  }

  /* ---------- contract address (set it here once live) ---------- */
  const CA = ''; // e.g. 'So1aNa...pump'
  if (CA) {
    document.querySelectorAll('.js-ca').forEach(el => { el.textContent = CA; });
    const btn = document.querySelector('.js-copy');
    if (btn) {
      btn.disabled = false;
      btn.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(CA); btn.textContent = 'Copied!'; }
        catch { btn.textContent = 'Copy failed'; }
        setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
      });
    }
  }

  /* ---------- bubbles (click to pop) ---------- */
  const field = document.querySelector('.js-bubbles');
  const popEls = document.querySelectorAll('.js-pops');
  let pops = 0;
  const words = ['POP!', 'PLIP!', 'BLOOP!', 'PIP!', 'POMF!'];

  function spawn() {
    if (!field || document.hidden) return;
    const b = document.createElement('span');
    const s = 14 + Math.random() * 46;
    b.className = 'bubble';
    b.style.setProperty('--x', (Math.random() * 96) + '%');
    b.style.setProperty('--s', s + 'px');
    b.style.setProperty('--t', (7 + Math.random() * 8) + 's');
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
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 400);
    setInterval(spawn, 900);
  }

  /* ---------- title letters: boing on tap ---------- */
  document.querySelectorAll('.title .L').forEach(l => {
    l.addEventListener('click', () => {
      l.classList.remove('is-boing'); void l.offsetWidth; l.classList.add('is-boing');
      setTimeout(() => l.classList.remove('is-boing'), 450);
    });
  });

  /* ---------- sparkline (vibes only, always ends up) ---------- */
  const spark = document.querySelector('.js-spark');
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
    const xy = pts.map((p, i) => [ (i / (N - 1)) * W, H - 14 - ((p - min) / (max - min || 1)) * (H - 34) ]);
    const line = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    spark.querySelector('.spark__line').setAttribute('d', line);
    spark.querySelector('.spark__area').setAttribute('d', line + ` L${W} ${H} L0 ${H} Z`);
    if (!reduce) {
      const path = spark.querySelector('.spark__line');
      const len = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.2s ease-out';
      path.style.strokeDashoffset = 0;
    }
  }
  document.querySelectorAll('.tf button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf button').forEach(b => b.setAttribute('aria-selected', String(b === btn)));
      drawSpark(btn.dataset.tf);
    });
  });
  drawSpark('ALL');

  /* ---------- reveal on scroll ---------- */
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el, i) => { el.style.transitionDelay = (el.classList.contains('candle') ? (i % 5) * 0.12 : 0) + 's'; io.observe(el); });
  } else {
    items.forEach(el => el.classList.add('is-in'));
  }
})();
