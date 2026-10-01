/* =========================================================================
   CAROUSEL (vanilla JS, dipakai hero & character spotlight)

   Markup yang dibutuhkan di dalam root:
     [data-slide]  -> tiap slide (class .is-active = slide yang tampil)
     [data-prev]   -> tombol panah kiri
     [data-next]   -> tombol panah kanan
     [data-dots]   -> wadah dot indicator (dot dibuat otomatis)
   Atribut root:
     data-interval -> durasi autoplay per slide (ms), default 6000

   Aturan autoplay:
     - Jalan otomatis tiap `interval` ms.
     - BERHENTI saat mouse hover / fokus keyboard di dalam carousel.
     - Setelah user klik panah/dot/swipe, autoplay ditahan HOLD_AFTER_INTERACTION ms.
     - Pause juga saat carousel di luar layar atau tab tidak aktif.
     - Mati total kalau user memilih "reduce motion".
   Transisi fade/zoom-nya murni CSS (lihat .hero-slide / .char-slide di css/sections/hero.css & character-spotlight.css).
   ========================================================================= */
const HOLD_AFTER_INTERACTION = 10000;

class Carousel {
  constructor(root, options = {}) {
    this.root = root;
    this.slides = Array.from(root.querySelectorAll('[data-slide]'));
    this.interval = options.interval || Number(root.dataset.interval) || 6000;
    this.onChange = options.onChange || null;
    this.index = -1;
    this.timer = null;
    this.holdTimer = null;
    this.running = false;

    // Flag-flag yang menentukan boleh autoplay atau tidak
    this.state = { hover: false, focus: false, held: false, visible: true };
    this.autoplay = !prefersReducedMotion && this.slides.length > 1;

    // Durasi dipakai CSS untuk animasi progress di dot aktif
    root.style.setProperty('--carousel-interval', `${this.interval}ms`);
    root.classList.toggle('no-autoplay', !this.autoplay);

    this.buildDots();
    this.bindEvents();

    const initial = Math.max(0, this.slides.findIndex((s) => s.classList.contains('is-active')));
    this.goTo(initial, { initial: true });
    this.refresh();
  }

  buildDots() {
    const wrap = this.root.querySelector('[data-dots]');
    this.dots = [];
    if (!wrap) return;

    this.dots = this.slides.map((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Tampilkan slide ${i + 1}${slide.dataset.label ? `: ${slide.dataset.label}` : ''}`);
      dot.addEventListener('click', () => this.userGoTo(i));
      wrap.appendChild(dot);
      return dot;
    });
  }

  bindEvents() {
    const { root } = this;

    root.querySelector('[data-prev]')?.addEventListener('click', () => this.userGoTo(this.index - 1));
    root.querySelector('[data-next]')?.addEventListener('click', () => this.userGoTo(this.index + 1));

    // Hover = pause (desktop)
    root.addEventListener('mouseenter', () => { this.state.hover = true; this.refresh(); });
    root.addEventListener('mouseleave', () => { this.state.hover = false; this.refresh(); });

    // Fokus keyboard (Tab) = pause, supaya slide tidak berganti saat user membaca
    root.addEventListener('focusin', (e) => {
      if (e.target.matches(':focus-visible')) { this.state.focus = true; this.refresh(); }
    });
    root.addEventListener('focusout', (e) => {
      if (!root.contains(e.relatedTarget)) { this.state.focus = false; this.refresh(); }
    });

    // Navigasi keyboard: panah kiri/kanan saat fokus ada di dalam carousel
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.userGoTo(this.index - 1);
      if (e.key === 'ArrowRight') this.userGoTo(this.index + 1);
    });

    // Swipe di layar sentuh (geser horizontal > 50px)
    let startX = 0;
    let startY = 0;
    root.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        this.userGoTo(this.index + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    // Pause saat carousel tidak kelihatan / tab tidak aktif
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        this.state.visible = entries[0].isIntersecting;
        this.refresh();
      }, { threshold: 0.2 }).observe(root);
    }
    document.addEventListener('visibilitychange', () => this.refresh());
  }

  /* Ganti slide karena aksi user -> tahan autoplay sebentar */
  userGoTo(i) {
    this.goTo(i);
    this.state.held = true;
    clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => {
      this.state.held = false;
      this.refresh();
    }, HOLD_AFTER_INTERACTION);
    this.refresh();
  }

  goTo(i, { initial = false } = {}) {
    const total = this.slides.length;
    const next = ((i % total) + total) % total; // wrap: -1 -> slide terakhir
    if (next === this.index && !initial) return;
    this.index = next;

    this.slides.forEach((slide, k) => {
      const active = k === next;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active; // link/tombol di slide tersembunyi tidak bisa di-Tab
    });

    this.dots.forEach((dot, k) => {
      dot.classList.toggle('is-active', k === next);
      dot.setAttribute('aria-current', k === next ? 'true' : 'false');
    });

    if (this.onChange) this.onChange(this.slides[next], next, { initial });
    if (this.running) this.schedule(); // reset hitungan mundur tiap ganti slide
  }

  get shouldRun() {
    const s = this.state;
    return this.autoplay && !s.hover && !s.focus && !s.held && !s.video && s.visible && !document.hidden;
  }

  /* Start/stop autoplay sesuai kondisi terbaru */
  refresh() {
    const run = this.shouldRun;
    this.root.classList.toggle('is-paused', !run);

    if (run && !this.running) {
      this.running = true;
      this.restartDotProgress();
      this.schedule();
    } else if (!run && this.running) {
      this.running = false;
      clearTimeout(this.timer);
    }
  }

  schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.goTo(this.index + 1), this.interval);
  }

  /* Reset animasi progress di dot aktif (trik reflow) supaya sinkron dengan timer */
  restartDotProgress() {
    const dot = this.dots[this.index];
    if (!dot) return;
    dot.classList.remove('is-active');
    void dot.offsetWidth;
    dot.classList.add('is-active');
  }
}

/* Animasi masuk teks overlay tiap slide (elemen bertanda [data-anim]) */
function animateCaption(slide, delay = 0.25) {
  if (!hasGsap() || prefersReducedMotion) return;
  const items = slide.querySelectorAll('[data-anim]');
  gsap.fromTo(items,
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.09, delay, overwrite: true }
  );
}
