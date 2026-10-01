/* =========================================================================
   HONKAI: STAR RAIL - FAN LANDING PAGE
   main.js - navbar behavior, mobile menu, banner carousel (hero & character
   spotlight), special program preview, particle layers, GSAP animations.
   Partikel debu bintang ada di js/particles.js (class ParticleField).
   ========================================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGsap = () => typeof window.gsap !== 'undefined';

document.addEventListener('DOMContentLoaded', () => {
  if (hasGsap() && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  initLoader();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initParticles();
  initHeroCarousel();
  initCharacterCarousel();
  initProgramPreview();
  initLiteYouTube();
  initGameplayVideos();
  initEventFeed();
  initEventDetail();
  initCharacterPage();

  if (hasGsap() && window.ScrollTrigger) {
    initScrollReveals();
    initHeroParallax();
  }
});

/* -------------------------------------------------------------------------
   LOADING SCREEN
   Overlay disembunyikan singkat setelah load, biar ada kesan "masuk" ke game
   ------------------------------------------------------------------------- */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('is-hidden');
    }, 500);
  });

  // Fallback: kalau event load lambat/tidak terpicu, tetap sembunyikan loader
  setTimeout(() => loader.classList.add('is-hidden'), 3000);
}

/* -------------------------------------------------------------------------
   NAVBAR: transparan di atas hero, jadi solid + blur setelah discroll
   ------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hero = document.getElementById('home');
  if (!navbar || !hero) return;

  function onScroll() {
    const threshold = hero.offsetHeight * 0.6;
    navbar.classList.toggle('is-scrolled', window.scrollY > threshold);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* -------------------------------------------------------------------------
   MOBILE HAMBURGER MENU
   ------------------------------------------------------------------------- */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function closeMenu() {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Tutup menu tiap kali salah satu link diklik (UX mobile yang wajar)
  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Tap di luar navbar, tombol Escape, atau layar melebar ke desktop -> tutup
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open') && !e.target.closest('#navbar')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      hamburger.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });
}

/* -------------------------------------------------------------------------
   SMOOTH SCROLL dengan offset navbar
   ------------------------------------------------------------------------- */
function initSmoothScroll() {
  const navbar = document.getElementById('navbar');
  const navbarHeight = navbar ? navbar.offsetHeight : 76;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      // Hero ada di paling atas (di bawah navbar transparan): tidak perlu offset
      const offset = target.matches('.hero-carousel') ? 0 : navbarHeight - 1;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}

/* -------------------------------------------------------------------------
   PARTICLE LAYERS (lihat js/particles.js)
   Jumlah partikel = angka desktop; di layar < 768px otomatis setengahnya.
   Hero & Character Spotlight paling ramai (dramatis), section berisi teks
   lebih sedikit supaya tetap terbaca. Instance disimpan di `particleFields`
   supaya bisa diakses lagi (misal ganti warna per slide karakter).
   ------------------------------------------------------------------------- */
const particleFields = {};

// Palet partikel per elemen karakter (dipakai di Character Spotlight)
const ELEMENT_PARTICLE_COLORS = {
  fire: ['#ff6b45', '#ff9a6b', '#ffc2a8', '#ff2e63', '#ffffff', '#ffffff'],
  ice: ['#3fd0f0', '#7dd3fc', '#c4f5ff', '#a5b4fc', '#ffffff', '#ffffff'],
  gold: ['#f7c948', '#fde68a', '#fff1b8', '#fb923c', '#ffffff', '#ffffff'],
};

function initParticles() {
  if (typeof window.ParticleField === 'undefined') return;

  // Partikel karakter dipasang di carousel; band trailer di bawahnya punya
  // layer starfield sendiri (setelan sama dengan #events) supaya nyambung
  const layers = [
    { key: 'home', selector: '#home', count: 130 },
    { key: 'about', selector: '#about', count: 40, speed: 0.22, sparkRatio: 0.05 },
    { key: 'characters', selector: '#character-spotlight .char-spotlight', count: 140, colors: ELEMENT_PARTICLE_COLORS.fire, sparkRatio: 0.1 },
    { key: 'trailer', selector: '#character-spotlight .char-trailer', count: 50, speed: 0.22, sparkRatio: 0.05 },
    { key: 'program', selector: '#events', count: 50, speed: 0.22, sparkRatio: 0.05 },
    { key: 'eventsPage', selector: '#event-list', count: 60, speed: 0.22, sparkRatio: 0.05 },
    { key: 'eventDetail', selector: '#event-detail', count: 50, speed: 0.22, sparkRatio: 0.05 },
    { key: 'charPage', selector: '#character-page', count: 50, speed: 0.22, sparkRatio: 0.05 },
    { key: 'charStage', selector: '#cpStage', count: 70, colors: ELEMENT_PARTICLE_COLORS.fire, sparkRatio: 0.1 },
    { key: 'gameplay', selector: '#gameplay', count: 35, speed: 0.2, sparkRatio: 0.05 },
  ];

  layers.forEach(({ key, selector, ...options }) => {
    const el = document.querySelector(selector);
    if (el) particleFields[key] = new ParticleField(el, options);
  });
}

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
   Transisi fade/zoom-nya murni CSS (lihat .hero-slide / .char-slide di style.css).
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

/* -------------------------------------------------------------------------
   HERO CAROUSEL
   ------------------------------------------------------------------------- */
function initHeroCarousel() {
  const root = document.querySelector('[data-carousel="hero"]');
  if (!root) return;

  const carousel = new Carousel(root, {
    onChange(slide, index, { initial }) {
      // Slide pertama: tunggu loading screen hilang dulu
      animateCaption(slide, initial ? 1.0 : 0.35);
      // Pindah slide saat trailer diputar -> hentikan videonya
      if (!initial) root.querySelector('.hero-play.is-playing')?.dispatchEvent(new Event('ytlite:stop'));
    },
  });
  initHeroTrailer(root, carousel);
}

/* Tombol play trailer di hero: klik -> .yt-lite (initLiteYouTube) memasang
   iframe; di sini hanya mengatur tampilan pemutar, tombol tutup, dan
   menahan autoplay carousel selama video diputar. */
function initHeroTrailer(root, carousel) {
  const player = root.querySelector('.hero-play');
  if (!player) return;

  const setPlaying = (on) => {
    player.classList.toggle('is-playing', on);
    carousel.state.video = on;
    carousel.refresh();
  };

  // Tombol melayang & berkilau serentak dengan judul grafis. Setelah video
  // ditutup tombol dipasang ulang -> animasinya mulai dari nol; samakan lagi
  // startTime-nya dengan animasi judul (nama keyframes sama).
  const title = root.querySelector('.hero-title-art');
  const syncWithTitle = () => {
    if (!title?.getAnimations) return;
    const titleAnims = title.getAnimations({ subtree: true });
    player.getAnimations({ subtree: true }).forEach((anim) => {
      const match = titleAnims.find((a) => a.animationName === anim.animationName);
      if (match && match.startTime !== null) anim.startTime = match.startTime;
    });
  };
  requestAnimationFrame(() => requestAnimationFrame(syncWithTitle));

  player.addEventListener('ytlite:play', () => setPlaying(true));
  player.addEventListener('ytlite:stop', () => {
    setPlaying(false);
    // Handler ini jalan sebelum initLiteYouTube mengembalikan tombol -> tunda
    setTimeout(() => {
      player.querySelector('.hero-play-btn')?.focus({ preventScroll: true });
      syncWithTitle();
    });
  });
  player.querySelector('.hero-play-close').addEventListener('click', () => {
    player.dispatchEvent(new Event('ytlite:stop'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && player.classList.contains('is-playing')) player.dispatchEvent(new Event('ytlite:stop'));
  });
}

/* -------------------------------------------------------------------------
   CHARACTER SPOTLIGHT CAROUSEL
   Tiap ganti slide: tema section (warna label) + warna partikel ikut
   elemen karakter yang aktif.
   ------------------------------------------------------------------------- */
function initCharacterCarousel() {
  const root = document.querySelector('[data-carousel="characters"]');
  if (!root) return;

  new Carousel(root, {
    onChange(slide, index, { initial }) {
      const theme = slide.dataset.theme || '';
      root.dataset.theme = theme;
      if (particleFields.characters && ELEMENT_PARTICLE_COLORS[theme]) {
        particleFields.characters.setColors(ELEMENT_PARTICLE_COLORS[theme]);
      }
      if (!initial) animateCaption(slide, 0.3);
    },
  });
}

/* -------------------------------------------------------------------------
   SPECIAL PROGRAM: thumbnail preview -> ganti isi panel utama
   Data tiap event dibaca dari atribut data-* di tombol .preview-thumb
   ------------------------------------------------------------------------- */
function initProgramPreview() {
  const tabs = Array.from(document.querySelectorAll('.preview-thumb'));
  const stage = document.getElementById('previewStage');
  const content = document.getElementById('previewContent');
  if (!tabs.length || !stage || !content) return;

  const el = {
    img: document.getElementById('previewImg'),
    name: document.getElementById('previewName'),
    phase: document.getElementById('previewPhase'),
    tag: document.getElementById('previewTag'),
    desc: document.getElementById('previewDesc'),
  };

  function applyData(d) {
    el.img.src = d.img;
    el.img.alt = d.alt || d.name;
    el.name.textContent = d.name;
    el.phase.textContent = d.phase;
    el.tag.textContent = d.tag;
    el.desc.textContent = d.desc;
    stage.dataset.theme = d.theme;
  }

  function select(tab, { focus = false } = {}) {
    if (tab.classList.contains('is-active')) return;

    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) tab.focus();

    if (!hasGsap() || prefersReducedMotion) {
      applyData(tab.dataset);
      return;
    }

    // Crossfade: fade out -> ganti data -> fade in
    gsap.to(content, {
      opacity: 0,
      y: 12,
      duration: 0.2,
      ease: 'power1.in',
      overwrite: true,
      onComplete() {
        applyData(tab.dataset);
        gsap.to(content, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      },
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    // Pola tablist standar: panah kiri/kanan pindah tab
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      select(tabs[(i + dir + tabs.length) % tabs.length], { focus: true });
    });
  });
}

/* -------------------------------------------------------------------------
   VIDEO YOUTUBE "KLIK-UNTUK-PLAY" (.yt-lite)
   Awalnya hanya thumbnail + tombol play (tanpa request ke YouTube player).
   Saat diklik, tombol diganti <iframe> dengan autoplay=1.
   Markup: <div class="video-frame yt-lite" data-yt-id="VIDEO_ID" data-yt-title="...">
             <button class="yt-lite-btn"> <img class="yt-lite-thumb"> ... </button>
           </div>
   ------------------------------------------------------------------------- */
function initLiteYouTube() {
  const players = document.querySelectorAll('.yt-lite[data-yt-id]');
  if (!players.length) return;

  // Pemanasan koneksi ke YouTube saat user mengarahkan kursor (sekali saja),
  // supaya video mulai lebih cepat ketika benar-benar diklik.
  let warmedUp = false;
  function warmUp() {
    if (warmedUp) return;
    warmedUp = true;
    ['https://www.youtube.com', 'https://i.ytimg.com', 'https://www.google.com'].forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  players.forEach((player) => {
    const id = player.dataset.ytId;
    const btn = player.querySelector('.yt-lite-btn');
    const thumb = player.querySelector('.yt-lite-thumb');
    if (!btn) return;

    // Fallback thumbnail: tidak semua video punya maxresdefault
    // (YouTube membalas gambar abu-abu 120x90 atau error).
    if (thumb) {
      const fallback = () => {
        if (!thumb.src.includes('hqdefault')) thumb.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
      };
      thumb.addEventListener('error', fallback);
      thumb.addEventListener('load', () => { if (thumb.naturalWidth <= 120) fallback(); });
    }

    btn.addEventListener('pointerenter', warmUp, { once: true });
    btn.addEventListener('focus', warmUp, { once: true });

    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = player.dataset.ytTitle || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
      iframe.focus();
      player.dispatchEvent(new CustomEvent('ytlite:play', { bubbles: true }));
    });

    // Hentikan video: kembalikan thumbnail + tombol play (dipakai baris video gameplay)
    player.addEventListener('ytlite:stop', () => {
      player.querySelector('iframe')?.replaceWith(btn);
    });
  });
}

/* -------------------------------------------------------------------------
   VIDEO GAMEPLAY: 5 card klik-untuk-play
   Card yang diputar jadi .is-featured (lebih besar), video lain yang sedang
   diputar dihentikan -> tidak ada dua audio bersamaan.
   ------------------------------------------------------------------------- */
function initGameplayVideos() {
  const row = document.getElementById('gameplayVideos');
  if (!row) return;
  const cards = Array.from(row.querySelectorAll('.gv-card'));

  // Mobile (baris bisa di-scroll): mulai dengan card featured di tengah.
  // Pakai scrollLeft, bukan scrollIntoView, supaya halaman tidak ikut bergeser.
  const featured = row.querySelector('.gv-card.is-featured');
  if (featured && row.scrollWidth > row.clientWidth) {
    row.scrollLeft = featured.offsetLeft - row.offsetLeft - (row.clientWidth - featured.offsetWidth) / 2;
  }

  const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  // Mobile (baris bisa di-scroll): geser card ke tengah baris saja, bukan halaman
  function centerInRow(card) {
    if (row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({
      left: card.offsetLeft - row.offsetLeft - (row.clientWidth - card.offsetWidth) / 2,
      behavior: scrollBehavior,
    });
  }

  // Lebar card di-transition (0.55s) -> posisi tengah baru benar setelah selesai
  let centerTimer;
  function feature(card) {
    cards.forEach((c) => c.classList.toggle('is-featured', c === card));
    clearTimeout(centerTimer);
    centerTimer = setTimeout(() => centerInRow(card), prefersReducedMotion ? 0 : 580);
  }

  row.addEventListener('ytlite:play', (e) => {
    const card = e.target.closest('.gv-card');
    feature(card);
    cards.forEach((c) => {
      c.classList.toggle('is-playing', c === card);
      if (c !== card) c.querySelector('.yt-lite')?.dispatchEvent(new Event('ytlite:stop'));
    });
    // Player membesar ke baris sendiri -> pastikan seluruhnya terlihat
    row.classList.add('has-playing');
    requestAnimationFrame(() => {
      card.querySelector('.video-frame').scrollIntoView({ behavior: scrollBehavior, block: 'nearest' });
    });
  });

  // Panah: pindah card featured. Saat ada video diputar, langsung putar video
  // sebelah (player besar tetap terbuka, seperti playlist).
  document.querySelectorAll('.gv-arrow').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cur = Math.max(0, cards.findIndex((c) => c.classList.contains('is-featured')));
      const next = cards[(cur + Number(btn.dataset.gvStep) + cards.length) % cards.length];
      if (row.classList.contains('has-playing')) next.querySelector('.yt-lite-btn')?.click();
      else feature(next);
    });
  });
}

/* -------------------------------------------------------------------------
   EVENT FEED (events.html): tampilkan EVENT_FEED_INITIAL event dulu, sisanya
   muncul setelah tombol "Lihat Selengkapnya" diklik (lalu tombol hilang).
   Dipanggil sebelum initScrollReveals; setelah baris tersembunyi ditampilkan,
   ScrollTrigger.refresh() menghitung ulang posisi reveal-nya.
   ------------------------------------------------------------------------- */
const EVENT_FEED_INITIAL = 5;

function initEventFeed() {
  const feed = document.getElementById('eventFeed');
  const button = document.getElementById('eventFeedMore');
  if (!feed || !button) return;

  const extra = Array.from(feed.children).slice(EVENT_FEED_INITIAL);
  if (!extra.length) return;

  extra.forEach((item) => { item.hidden = true; });
  button.hidden = false;

  button.addEventListener('click', () => {
    extra.forEach((item) => { item.hidden = false; });
    button.parentElement.remove();
    if (window.ScrollTrigger) ScrollTrigger.refresh();

    // Fokus pindah ke link event pertama yang baru muncul (tombolnya sudah hilang)
    const first = extra[0].querySelector('.event-row-link');
    if (first) first.focus({ preventScroll: true });
  });
}

/* -------------------------------------------------------------------------
   EVENT DETAIL (event.html?id=<id>)
   Artikel + "Berita Lainnya" dibangun dari window.HSR_EVENTS
   (js/events-data.js). id tidak dikenal -> pesan "tidak ditemukan".
   ------------------------------------------------------------------------- */
function initEventDetail() {
  const article = document.getElementById('edArticle');
  const events = window.HSR_EVENTS;
  if (!article || !Array.isArray(events)) return;

  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(window.location.search).get('id');
  const ev = events.find((e) => e.id === id);
  const detailUrl = (e) => `event.html?id=${encodeURIComponent(e.id)}`;

  const body = $('edBody');
  body.replaceChildren();

  if (!ev) {
    $('edTitle').textContent = 'Event tidak ditemukan';
    const p = document.createElement('p');
    p.textContent = 'Event yang kamu cari tidak tersedia atau sudah dipindahkan. Lihat event lain di bawah ini atau kembali ke daftar Event & Berita.';
    body.append(p);
    document.title = 'Event tidak ditemukan | Honkai: Star Rail';
  } else {
    $('edLabel').textContent = ev.label;
    $('edLabel').hidden = false;
    $('edTitle').textContent = ev.title;
    $('edDate').textContent = ev.date;
    $('edDate').dateTime = ev.datetime;

    const img = $('edImg');
    img.src = ev.img;
    img.alt = ev.alt || ev.title;
    if (ev.imgPos) img.style.objectPosition = ev.imgPos;
    $('edHero').hidden = false;

    if (ev.info && ev.info.length) {
      const dl = $('edInfo');
      ev.info.forEach(([term, value]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = term;
        dd.textContent = value;
        row.append(dt, dd);
        dl.append(row);
      });
      dl.hidden = false;
    }

    ev.body.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.append(p);
    });

    document.title = `${ev.title} | Honkai: Star Rail`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = ev.body[0];
  }

  // Berita Lainnya: semua event lain, urutan sama dengan daftar
  const list = $('edNews');
  events.filter((e) => e !== ev).forEach((e) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'ed-news-item';
    a.href = detailUrl(e);

    const thumb = document.createElement('span');
    thumb.className = 'ed-news-thumb';
    const img = document.createElement('img');
    img.src = e.img;
    img.alt = '';
    img.loading = 'lazy';
    if (e.imgPos) img.style.objectPosition = e.imgPos;
    thumb.append(img);

    const text = document.createElement('span');
    text.className = 'ed-news-text';
    const title = document.createElement('span');
    title.className = 'ed-news-title';
    title.textContent = e.title;
    const date = document.createElement('time');
    date.className = 'ed-news-date';
    date.dateTime = e.datetime;
    date.textContent = e.date;
    text.append(title, date);

    a.append(thumb, text);
    li.append(a);
    list.append(li);
  });
}

/* -------------------------------------------------------------------------
   CHARACTER PAGE (character.html)
   - Data tiap karakter dibaca dari atribut data-* di tombol .cp-thumb.
   - Klik thumbnail / panah -> ganti panel besar; kelompok di sidebar ikut
     berpindah ke kelompok karakter tersebut.
   - Klik kelompok di sidebar -> karakter di luar kelompok diredupkan dan
     karakter pertama kelompok itu langsung ditampilkan.
   Panah berputar melewati SEMUA karakter (wrap di ujung).
   Tinggi panel sama untuk semua karakter: blok teks tiap karakter diukur
   (nama bisa 1 atau 2 baris) dan yang tertinggi dipakai sebagai --content-h.
   ------------------------------------------------------------------------- */
function initCharacterPage() {
  const stage = document.getElementById('cpStage');
  const film = document.getElementById('cpFilm');
  if (!stage || !film) return;

  const thumbs = Array.from(film.querySelectorAll('.cp-thumb'));
  const factions = Array.from(document.querySelectorAll('.cp-faction'));
  const el = {
    img: document.getElementById('cpImg'),
    info: document.getElementById('cpInfo'),
    faction: document.getElementById('cpFaction'),
    badge: document.getElementById('cpBadge'),
    name: document.getElementById('cpName'),
    desc: document.getElementById('cpDesc'),
  };
  let current = Math.max(0, thumbs.findIndex((t) => t.classList.contains('is-active')));

  // Grafis judul nama: ganti gambar, ukuran area terlihat (--crop-*) & mask kilau
  const CROP_VARS = ['--img-w', '--img-h', '--crop-x', '--crop-y', '--crop-w', '--crop-h'];
  function setTitleArt(root, d) {
    const art = root.querySelector('.char-title-art');
    const img = art.querySelector('img');
    const shine = art.querySelector('.char-title-shine');
    const crop = (d.titleCrop || '').split(' ');
    CROP_VARS.forEach((v, i) => art.style.setProperty(v, crop[i]));
    img.src = d.titleImg;
    img.alt = d.name;
    img.width = crop[0];
    img.height = crop[1];
    const mask = `url('${encodeURI(d.titleImg)}')`;
    shine.style.webkitMaskImage = mask;
    shine.style.maskImage = mask;
  }

  function setFaction(id) {
    factions.forEach((f) => {
      const on = f.dataset.faction === id;
      f.classList.toggle('is-active', on);
      f.setAttribute('aria-pressed', String(on));
      if (on) el.faction.textContent = f.querySelector('.cp-faction-name').textContent;
    });
    thumbs.forEach((t) => t.classList.toggle('is-dimmed', t.dataset.faction !== id));
  }

  function render(d) {
    el.img.src = d.img;
    el.img.alt = d.name;
    el.badge.textContent = d.badge;
    setTitleArt(el.name, d);
    el.desc.textContent = d.desc;
    stage.dataset.theme = d.theme;
    stage.dataset.character = d.character || '';
    // Mulai ulang animasi melayang untuk karakter baru (tanpa lompatan fase)
    el.img.style.animation = 'none';
    void el.img.offsetWidth;
    el.img.style.animation = '';
    stage.style.setProperty('--body-x', d.bodyX || '50%');
    stage.style.setProperty('--art-y', d.artY || '0%');
    if (particleFields.charStage && ELEMENT_PARTICLE_COLORS[d.theme]) {
      particleFields.charStage.setColors(ELEMENT_PARTICLE_COLORS[d.theme]);
    }
  }

  function select(index) {
    index = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[index];
    const changed = index !== current;
    current = index;

    thumbs.forEach((t) => {
      const on = t === thumb;
      t.classList.toggle('is-active', on);
      if (on) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    setFaction(thumb.dataset.faction);
    // Geser track saja (bukan halaman) supaya thumbnail aktif ada di tengah
    const li = thumb.parentElement;
    film.scrollTo({
      left: li.offsetLeft - (film.clientWidth - li.offsetWidth) / 2,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    if (!changed) return;

    if (!hasGsap() || prefersReducedMotion) {
      render(thumb.dataset);
      return;
    }
    gsap.to([el.img, el.info], {
      opacity: 0,
      duration: 0.2,
      overwrite: true,
      onComplete() {
        render(thumb.dataset);
        // Art hanya di-fade (tanpa scale/transform): GSAP akan melebur properti
        // CSS `translate` ke inline transform dan mengunci posisi -> --body-x /
        // --art-y per karakter tidak lagi berlaku setelah ganti karakter.
        gsap.fromTo(el.img, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'opacity' });
        gsap.fromTo(el.info, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'transform' });
      },
    });
  }

  // Ukur blok teks semua karakter lewat salinan tersembunyi dari #cpInfo
  function syncStageHeight() {
    const probe = el.info.cloneNode(true);
    probe.removeAttribute('id');
    probe.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
    probe.setAttribute('aria-hidden', 'true');
    Object.assign(probe.style, { position: 'absolute', left: '0', top: '0', visibility: 'hidden', opacity: '', transform: '' });
    stage.appendChild(probe);

    const factionName = (id) => {
      const f = factions.find((x) => x.dataset.faction === id);
      return f ? f.querySelector('.cp-faction-name').textContent : '';
    };
    let tallest = 0;
    thumbs.forEach((t) => {
      probe.querySelector('.cp-stage-faction').textContent = factionName(t.dataset.faction);
      probe.querySelector('.char-badge').textContent = t.dataset.badge;
      setTitleArt(probe.querySelector('.cp-title'), t.dataset);
      probe.querySelector('.cp-bio p').textContent = t.dataset.desc;
      tallest = Math.max(tallest, probe.offsetHeight);
    });
    probe.remove();
    stage.style.setProperty('--content-h', `${Math.ceil(tallest)}px`);
  }

  syncStageHeight();
  if (document.fonts) document.fonts.ready.then(syncStageHeight);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncStageHeight, 150);
  });

  thumbs.forEach((t, i) => t.addEventListener('click', () => select(i)));

  document.querySelectorAll('.cp-film-arrow').forEach((btn) => {
    btn.addEventListener('click', () => select(current + Number(btn.dataset.step)));
  });

  factions.forEach((f) => {
    f.addEventListener('click', () => {
      const first = thumbs.findIndex((t) => t.dataset.faction === f.dataset.faction);
      if (first === -1) return setFaction(f.dataset.faction);
      // Karakter aktif sudah di kelompok ini -> cukup update sidebar & redup
      if (thumbs[current].dataset.faction === f.dataset.faction) return setFaction(f.dataset.faction);
      select(first);
    });
  });

  // Panah kiri/kanan keyboard saat fokus di filmstrip
  film.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    select(current + (e.key === 'ArrowRight' ? 1 : -1));
    thumbs[current].focus();
  });

  setFaction(thumbs[current].dataset.faction);
}

/* -------------------------------------------------------------------------
   PARALLAX HERO
   Saat discroll, gambar banner & partikel bergerak lebih lambat dari teks
   (foreground) -> kesan kedalaman. Progress scroll dikirim ke CSS variable
   --hero-parallax (0..1) yang dipakai properti `translate` di style.css,
   jadi tidak bentrok dengan `transform` zoom slide.
   ------------------------------------------------------------------------- */
function initHeroParallax() {
  if (prefersReducedMotion) return;
  const hero = document.getElementById('home');
  if (!hero) return;

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => hero.style.setProperty('--hero-parallax', self.progress.toFixed(4)),
  });
}

/* -------------------------------------------------------------------------
   SCROLL-TRIGGERED REVEALS
   Tiap section muncul dengan fade-in + slide-up saat PERTAMA kali masuk
   viewport (once: true -> tidak diulang saat scroll naik-turun).
   Elemen yang banyak dimunculkan bertahap (stagger).
   State awal di-set oleh GSAP (bukan CSS), jadi kalau JS/GSAP gagal dimuat
   konten tetap terlihat normal.
   ------------------------------------------------------------------------- */
const REVEAL = { y: 36, duration: 0.7, ease: 'power2.out' };

function reveal(targets, { trigger, stagger = 0, start = 'top 82%' } = {}) {
  const els = gsap.utils.toArray(targets);
  if (!els.length) return;

  return gsap.from(els, {
    opacity: 0,
    y: REVEAL.y,
    duration: REVEAL.duration,
    ease: REVEAL.ease,
    stagger,
    // Hapus inline style setelah selesai supaya efek :hover (transform) tetap jalan
    clearProps: 'transform,opacity',
    scrollTrigger: { trigger: trigger || els[0], start, once: true },
  });
}

function initScrollReveals() {
  if (prefersReducedMotion) return;

  // About: label + divider -> judul -> paragraf -> badge satu per satu
  const about = document.querySelector('#about .about-inner');
  if (about) {
    const q = (sel) => about.querySelectorAll(sel);
    const from = { opacity: 0, y: REVEAL.y, duration: REVEAL.duration, ease: REVEAL.ease, clearProps: 'transform,opacity' };
    gsap.timeline({ scrollTrigger: { trigger: about, start: 'top 82%', once: true } })
      .from(q('.section-kicker, .section-divider'), from)
      .from(q('.about-title'), from, '-=0.58')
      .from(q('.about-text'), from, '-=0.58')
      .from(q('.about-tags > li'), { ...from, stagger: 0.1 }, '-=0.5');
  }

  // CTA download
  // Section terakhir sebelum footer: start di-clamp supaya tidak pernah lebih
  // jauh dari batas scroll halaman (kalau tidak, trigger tidak pernah jalan
  // dan seluruh section tetap opacity 0 / kosong). Ditambah pengaman: begitu
  // pengguna sampai dasar halaman, animasi dipaksa jalan.
  const downloadReveal = reveal(['#download .section-title', '#download .section-subtitle', ...document.querySelectorAll('#download .platform-list > li')], {
    trigger: '#download .download-inner',
    stagger: 0.1,
    start: 'clamp(top 85%)',
  });
  if (downloadReveal) {
    const ensureDownloadVisible = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (!atBottom) return;
      if (downloadReveal.progress() === 0) downloadReveal.play();
      window.removeEventListener('scroll', ensureDownloadVisible);
    };
    window.addEventListener('scroll', ensureDownloadVisible, { passive: true });
    window.addEventListener('load', ensureDownloadVisible);
  }

  // Character Spotlight: slide fade-in, lalu label & caption slide-up bertahap.
  // (Track tidak digeser y supaya background full-bleed tidak meninggalkan celah.)
  const chars = document.getElementById('character-spotlight');
  if (chars) {
    const track = chars.querySelector('.carousel-track');
    const controls = chars.querySelectorAll('.carousel-arrow, .carousel-dots');
    gsap.set([track, ...controls], { opacity: 0 });

    ScrollTrigger.create({
      trigger: chars,
      start: 'top 70%',
      once: true,
      onEnter() {
        gsap.to(track, { opacity: 1, duration: 0.9, ease: 'power1.out' });
        gsap.to(controls, { opacity: 1, duration: 0.6, delay: 0.5 });
        gsap.from('.char-spotlight-kicker', { opacity: 0, y: REVEAL.y, duration: REVEAL.duration, ease: REVEAL.ease });
        const active = chars.querySelector('.char-slide.is-active');
        if (active) {
          gsap.fromTo(active.querySelectorAll('[data-anim]'),
            { opacity: 0, y: REVEAL.y },
            { opacity: 1, y: 0, duration: REVEAL.duration, ease: REVEAL.ease, stagger: 0.12, delay: 0.2, overwrite: true });
        }
      },
    });
  }

  // Band trailer kolaborasi di bawah carousel karakter
  reveal(['.char-trailer-text > *', '.char-trailer .video-frame'], { trigger: '.char-trailer', stagger: 0.12 });

  // Special Program: panel dulu, lalu isi panel satu-satu
  reveal('#events .program-panel', { start: 'top 85%' });
  reveal([
    '#events .program-head',
    '#events .preview-stage',
    ...document.querySelectorAll('#events .preview-thumb'),
    '#events .video-frame',
    '#events .video-caption',
  ], { trigger: '#events .program-panel', stagger: 0.12, start: 'top 75%' });

  // Halaman events.html: judul, lalu tiap baris event muncul saat discroll
  reveal('#event-list .events-head > *', { stagger: 0.12, start: 'top 90%' });
  gsap.utils.toArray('#event-list .event-row').forEach((row) => reveal(row, { start: 'top 92%' }));

  // Halaman detail event: kepala artikel, banner, isi, lalu sidebar
  reveal(['#event-detail .ed-back', '#event-detail .ed-head', '#event-detail .ed-hero', '#event-detail .ed-info', '#event-detail .ed-body'], { stagger: 0.1, start: 'top 95%' });
  reveal('#event-detail .ed-aside', { start: 'top 95%' });

  // Halaman character.html: label, sidebar, panel, filmstrip bertahap
  reveal(['.cp-page-label', '.cp-factions', '#cpStage', '.cp-film'], { stagger: 0.12, start: 'top 90%' });

  // Gameplay Highlights: judul lalu 4 card bertahap
  reveal('#gameplay .section-title, #gameplay .section-subtitle', { stagger: 0.12 });
  reveal('#gameplayMarquee');
  reveal('#gameplay .gameplay-trailer > *', { trigger: '.gameplay-trailer', stagger: 0.12 });

  // Footer (ada di dasar halaman -> trigger lebih longgar)
  reveal(['.footer-logo', ...document.querySelectorAll('.footer-social .social-link'), '.footer-copyright'], {
    trigger: '.footer',
    stagger: 0.1,
    start: 'top 95%',
  });
}
