/* =========================================================================
   HONKAI: STAR RAIL - FAN LANDING PAGE
   particles.js - lapisan "debu bintang" berkelip berbasis canvas 2D.

   Pemakaian:
     const field = new ParticleField(elementSection, { count: 120 });
     field.setColors(['#ff6b45', '#ffffff']); // ganti palet kapan saja

   Tiga jenis partikel dicampur supaya terasa hidup, tidak monoton:
     - dust  : debu 2-6px, melayang pelan dengan goyangan halus + twinkle
     - star  : "bintang terang" 6-10px dengan halo + kilau silang, jarang
     - spark : percikan cepat yang melintas dengan ekor cahaya, lalu jeda
               sebentar sebelum muncul lagi

   - Canvas otomatis dibuat & dipasang di dalam element (position: absolute,
     inset 0, pointer-events none). Atur urutan layer lewat CSS .particle-canvas.
   - Ukuran canvas mengikuti ukuran section (ResizeObserver).
   - Animasi otomatis PAUSE saat section di luar viewport (IntersectionObserver)
     atau tab browser tidak aktif, supaya tidak boros CPU.
   - Di layar < 768px jumlah partikel otomatis dipotong setengah.
   - Kalau user mengaktifkan "reduce motion", partikel digambar sekali (statis).
   ========================================================================= */

(function () {
  'use strict';

  // Palet default: violet / pink / cyan keputihan + putih polos (bintang).
  // Warna diulang = bobot lebih besar (putih muncul lebih sering).
  const DEFAULT_COLORS = ['#c4b5fd', '#a78bfa', '#f5b8f0', '#a5f3fc', '#ffffff', '#ffffff'];

  const DEFAULTS = {
    count: 100,           // total partikel di desktop (mobile = setengahnya)
    colors: DEFAULT_COLORS,
    minSize: 2,           // diameter debu minimum (px)
    maxSize: 6,           // diameter debu maksimum (px)
    starRatio: 0.08,      // porsi "bintang terang" 6-10px
    starMinSize: 6,
    starMaxSize: 10,
    sparkRatio: 0.08,     // porsi percikan cepat
    speed: 0.35,          // kecepatan dasar debu (px per frame @60fps)
    sparkSpeed: [5, 10],  // rentang kecepatan percikan (px per frame)
    direction: 'up',      // 'up' = melayang ke atas, 'side' = menyamping
    className: '',        // class tambahan untuk canvas
  };

  const MOBILE_BREAKPOINT = 768;
  const MAX_DPR = 2; // batasi resolusi di layar retina biar tetap ringan

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Cache sprite glow per warna: gradient digambar SEKALI ke canvas kecil,
  // lalu tiap frame cukup drawImage (jauh lebih murah daripada shadowBlur).
  const spriteCache = new Map();

  function getGlowSprite(color) {
    if (spriteCache.has(color)) return spriteCache.get(color);

    const size = 64;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = size;
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.14, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.26, color);
    g.addColorStop(0.5, hexToRgba(color, 0.3));
    g.addColorStop(1, hexToRgba(color, 0));
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, size, size);

    spriteCache.set(color, sprite);
    return sprite;
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  const rand = (min, max) => Math.random() * (max - min) + min;

  class ParticleField {
    constructor(container, options = {}) {
      if (!container) return;

      this.container = container;
      this.opts = Object.assign({}, DEFAULTS, options);

      this.canvas = document.createElement('canvas');
      this.canvas.className = `particle-canvas ${this.opts.className}`.trim();
      this.canvas.setAttribute('aria-hidden', 'true');
      this.ctx = this.canvas.getContext('2d');
      container.appendChild(this.canvas);

      this.particles = [];
      this.width = 0;
      this.height = 0;
      this.isVisible = false;
      this.rafId = null;
      this.lastTime = 0;
      this.time = 0;

      this.loop = this.loop.bind(this);
      this.onVisibilityChange = this.onVisibilityChange.bind(this);

      this.resize();
      this.observe();
    }

    /* Jumlah partikel efektif: setengah di layar kecil */
    get targetCount() {
      const base = this.opts.count;
      return window.innerWidth < MOBILE_BREAKPOINT ? Math.round(base / 2) : base;
    }

    randomColor() {
      const { colors } = this.opts;
      return colors[Math.floor(Math.random() * colors.length)];
    }

    /* Tentukan jenis partikel ke-i secara deterministik dari rasio,
       jadi proporsi star/spark tetap stabil walau jumlah berubah. */
    typeFor(i, total) {
      const stars = Math.round(total * this.opts.starRatio);
      const sparks = Math.round(total * this.opts.sparkRatio);
      if (i < stars) return 'star';
      if (i < stars + sparks) return 'spark';
      return 'dust';
    }

    /* Satu partikel. Semua parameter gerak & kedip diacak per partikel
       supaya tidak ada pola yang terlihat seragam/kaku. */
    createParticle(type) {
      const o = this.opts;
      const p = {
        type,
        x: rand(0, this.width),
        y: rand(0, this.height),
        color: this.randomColor(),
        // Goyangan halus (sway) supaya lintasan melengkung, bukan garis lurus
        swayAmp: rand(0.15, 0.6),
        swayFreq: rand(0.0006, 0.0018),
        swayPhase: rand(0, Math.PI * 2),
        // Twinkle: gabungan 2 gelombang sinus beda frekuensi = kedip tidak beraturan
        baseAlpha: rand(0.55, 1),
        twA: rand(0.0008, 0.0025),
        twB: rand(0.0003, 0.0011),
        phA: rand(0, Math.PI * 2),
        phB: rand(0, Math.PI * 2),
      };

      if (type === 'spark') {
        this.resetSpark(p, true);
        return p;
      }

      const isStar = type === 'star';
      const size = isStar ? rand(o.starMinSize, o.starMaxSize) : rand(o.minSize, o.maxSize);
      // Partikel besar bergerak sedikit lebih cepat -> ilusi kedalaman (parallax)
      const depth = (size - o.minSize) / Math.max(o.maxSize - o.minSize, 0.001);
      const velocity = o.speed * (isStar ? 0.5 : 0.4 + depth * 0.9) * rand(0.7, 1.3);

      p.radius = size / 2;
      p.vx = o.direction === 'side' ? velocity : rand(-0.1, 0.1);
      p.vy = o.direction === 'side' ? rand(-0.06, 0.06) : -velocity;
      if (isStar) {
        // Bintang terang: kedip lebih lambat & dalam -> "sesekali muncul"
        p.twA = rand(0.0005, 0.0012);
        p.flareAngle = rand(0, Math.PI / 4);
      }
      return p;
    }

    /* Percikan: mulai dari tepi bawah/samping, melesat miring, lalu hilang.
       `delay` = jeda (ms) sebelum muncul lagi, biar munculnya sporadis. */
    resetSpark(p, initial = false) {
      const o = this.opts;
      const speed = rand(o.sparkSpeed[0], o.sparkSpeed[1]);
      let angle;
      if (o.direction === 'side') {
        angle = rand(-0.35, 0.35); // ke kanan
        p.x = rand(-40, this.width * 0.3);
        p.y = rand(0, this.height);
      } else {
        angle = -Math.PI / 2 + rand(-0.7, 0.7); // ke atas, miring kiri/kanan
        p.x = rand(0, this.width);
        p.y = this.height + rand(0, 40);
      }
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.radius = rand(1.2, 2.2);
      p.color = this.randomColor();
      p.delay = initial ? rand(0, 5000) : rand(800, 4500);
      // Percikan hanya terbang sepanjang sebagian layar lalu padam
      p.life = rand(0.35, 0.8) * (this.height + this.width) / speed;
      p.age = 0;
    }

    /* Ganti palet warna (misal saat slide karakter berganti) */
    setColors(colors) {
      if (!colors || !colors.length) return;
      this.opts.colors = colors;
      for (const p of this.particles) p.color = this.randomColor();
      if (prefersReducedMotion || !this.isVisible) this.draw();
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const prevW = this.width;
      const prevH = this.height;

      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sesuaikan jumlah partikel (misal pindah dari landscape ke portrait)
      const target = this.targetCount;
      if (this.particles.length !== target) {
        this.particles = Array.from({ length: target }, (_, i) => this.createParticle(this.typeFor(i, target)));
      } else if (prevW && prevH) {
        // Ukuran berubah: sebar ulang posisi secara proporsional
        for (const p of this.particles) {
          p.x = (p.x / prevW) * this.width;
          p.y = (p.y / prevH) * this.height;
        }
      }

      if (prefersReducedMotion || !this.isVisible) this.draw();
    }

    /* Pasang observer: resize + visibility + tab aktif/tidak */
    observe() {
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);
      } else {
        window.addEventListener('resize', () => this.resize());
      }

      if (prefersReducedMotion) {
        this.draw(); // cukup satu frame statis
        return;
      }

      if ('IntersectionObserver' in window) {
        this.intersectionObserver = new IntersectionObserver(
          (entries) => {
            this.isVisible = entries[0].isIntersecting;
            this.isVisible ? this.start() : this.stop();
          },
          { rootMargin: '100px 0px' }
        );
        this.intersectionObserver.observe(this.container);
      } else {
        this.isVisible = true;
        this.start();
      }

      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    onVisibilityChange() {
      if (document.hidden) this.stop();
      else if (this.isVisible) this.start();
    }

    start() {
      if (this.rafId || prefersReducedMotion) return;
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.loop);
    }

    stop() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    loop(now) {
      // dt dinormalisasi ke 60fps & dibatasi, supaya tidak "loncat" setelah tab kembali aktif
      const elapsed = Math.min(now - this.lastTime, 50);
      const dt = elapsed / 16.667;
      this.lastTime = now;
      this.time = now;

      this.update(dt, elapsed);
      this.draw();

      this.rafId = requestAnimationFrame(this.loop);
    }

    update(dt, elapsedMs) {
      const w = this.width;
      const h = this.height;
      const t = this.time;
      const margin = 16;

      for (const p of this.particles) {
        if (p.type === 'spark') {
          if (p.delay > 0) { p.delay -= elapsedMs; continue; }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.age += dt;
          if (p.age > p.life || p.y < -60 || p.x < -60 || p.x > w + 60) this.resetSpark(p);
          continue;
        }

        const sway = Math.sin(t * p.swayFreq + p.swayPhase) * p.swayAmp;

        if (this.opts.direction === 'side') {
          p.x += p.vx * dt;
          p.y += (p.vy + sway * 0.4) * dt;
        } else {
          p.x += (p.vx + sway * 0.4) * dt;
          p.y += p.vy * dt;
        }

        // Wrap-around: keluar satu sisi -> muncul lagi di sisi seberang
        if (p.y < -margin) { p.y = h + margin; p.x = rand(0, w); }
        else if (p.y > h + margin) { p.y = -margin; p.x = rand(0, w); }
        if (p.x < -margin) { p.x = w + margin; p.y = rand(0, h); }
        else if (p.x > w + margin) { p.x = -margin; p.y = rand(0, h); }
      }
    }

    draw() {
      const ctx = this.ctx;
      const t = this.time;
      ctx.clearRect(0, 0, this.width, this.height);
      // 'lighter' = warna yang bertumpuk saling menambah terang (kesan cahaya)
      ctx.globalCompositeOperation = 'lighter';

      for (const p of this.particles) {
        if (p.type === 'spark') {
          if (p.delay <= 0) this.drawSpark(ctx, p);
          continue;
        }

        // Twinkle: nilai 0..1 dari dua sinus -> fade in/out tidak beraturan
        const a = 0.5 + 0.5 * Math.sin(t * p.twA + p.phA);
        const b = 0.5 + 0.5 * Math.sin(t * p.twB + p.phB);
        const twinkle = a * (0.45 + 0.55 * b);

        if (p.type === 'star') {
          this.drawStar(ctx, p, p.baseAlpha * twinkle * twinkle); // kuadrat = lebih sering redup
        } else {
          ctx.globalAlpha = p.baseAlpha * (0.15 + 0.85 * twinkle);
          const s = p.radius * 5;
          ctx.drawImage(getGlowSprite(p.color), p.x - s / 2, p.y - s / 2, s, s);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    /* Bintang terang: halo besar + kilau silang 4 arah */
    drawStar(ctx, p, alpha) {
      if (alpha < 0.02) return;
      const s = p.radius * 7;
      ctx.globalAlpha = alpha;
      ctx.drawImage(getGlowSprite(p.color), p.x - s / 2, p.y - s / 2, s, s);

      const len = p.radius * 5 * (0.7 + alpha * 0.6);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.flareAngle);
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = alpha * 0.9;
      ctx.beginPath();
      ctx.moveTo(-len, 0); ctx.lineTo(len, 0);
      ctx.moveTo(0, -len); ctx.lineTo(0, len);
      ctx.stroke();
      ctx.restore();
    }

    /* Percikan: garis ekor bergradasi searah gerak + kepala terang */
    drawSpark(ctx, p) {
      // Fade in di awal & fade out di akhir umur
      const lifeT = p.age / p.life;
      const alpha = Math.min(1, lifeT * 6) * (1 - lifeT);
      if (alpha <= 0) return;

      const tail = 7; // panjang ekor = kecepatan x 7 frame
      const tx = p.x - p.vx * tail;
      const ty = p.y - p.vy * tail;
      const grad = ctx.createLinearGradient(tx, ty, p.x, p.y);
      grad.addColorStop(0, hexToRgba(p.color, 0));
      grad.addColorStop(1, hexToRgba(p.color, 1));

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.radius * 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      const s = p.radius * 6;
      ctx.drawImage(getGlowSprite(p.color), p.x - s / 2, p.y - s / 2, s, s);
    }

    destroy() {
      this.stop();
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.intersectionObserver) this.intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      this.canvas.remove();
    }
  }

  window.ParticleField = ParticleField;
})();
