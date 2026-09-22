/* =========================================================================
   HONKAI: STAR RAIL - FAN LANDING PAGE
   main.js - starfield background, navbar behavior, mobile menu,
   GSAP scroll-reveal animations, smooth scroll, image fallback.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initLoader();
  initStarfield(prefersReducedMotion);
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initCharacterImageFallback();

  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    initHeroAnimation(prefersReducedMotion);
    initScrollReveals();
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
   STARFIELD BACKGROUND
   Partikel bintang sederhana pakai canvas 2D, gerak halus & subtle.
   Jumlah partikel disesuaikan dengan luas layar biar tetap ringan.
   ------------------------------------------------------------------------- */
function initStarfield(prefersReducedMotion) {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, stars;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    const density = Math.min(160, Math.floor((width * height) / 9000));
    stars = Array.from({ length: density }, createStar);
  }

  function createStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      driftSpeed: Math.random() * 0.05 + 0.01,
    };
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';

    for (const star of stars) {
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.5;
      const alpha = star.baseAlpha * (0.5 + twinkle * 0.5);

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // drift halus ke bawah, wrap-around kalau keluar layar
      star.y += star.driftSpeed;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
    }

    ctx.globalAlpha = 1;
  }

  resize();
  window.addEventListener('resize', resize);

  if (prefersReducedMotion) {
    // Render sekali saja, tanpa animasi berjalan terus
    draw(0);
    return;
  }

  function loop(time) {
    draw(time * 0.06);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* -------------------------------------------------------------------------
   NAVBAR: berubah solid saat scroll melewati hero section
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
}

/* -------------------------------------------------------------------------
   SMOOTH SCROLL dengan offset navbar
   CSS scroll-behavior sudah menangani sebagian besar, ini hanya memastikan
   posisi berhenti tidak ketutup navbar sticky.
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
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* -------------------------------------------------------------------------
   FALLBACK GAMBAR KARAKTER
   Selama assets/images/heroes/*.png belum diisi manual, tampilkan placeholder
   bergradasi warna elemen dengan inisial nama karakter.
   ------------------------------------------------------------------------- */
function initCharacterImageFallback() {
  document.querySelectorAll('.char-card-img').forEach((img) => {
    img.addEventListener('error', () => {
      const wrap = img.closest('.char-card-img-wrap');
      if (!wrap) return;
      wrap.classList.add('img-fallback');
      wrap.setAttribute('data-initial', (img.alt || '?').trim().charAt(0));
    }, { once: true });
  });
}

/* -------------------------------------------------------------------------
   HERO ENTRANCE ANIMATION (GSAP)
   Text reveal judul + fade-in tagline & CTA saat halaman pertama dibuka.
   ------------------------------------------------------------------------- */
function initHeroAnimation(prefersReducedMotion) {
  const lines = gsap.utils.toArray('[data-line]');
  const tagline = document.getElementById('heroTagline');
  const cta = document.getElementById('heroCta');

  if (prefersReducedMotion) {
    gsap.set([...lines, tagline, cta], { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({ delay: 0.9 });

  tl.from(lines, {
    yPercent: 120,
    opacity: 0,
    duration: 1,
    ease: 'power4.out',
    stagger: 0.15,
  })
    .from(tagline, {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.4')
    .from(cta.children, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.12,
    }, '-=0.4');
}

/* -------------------------------------------------------------------------
   SCROLL-TRIGGERED REVEALS
   - .reveal-up  : fade + slide up sederhana (About, judul section, dll)
   - .char-card  : stagger entrance bergantian
   - .gameplay-card : stagger entrance satu-satu
   ------------------------------------------------------------------------- */
function initScrollReveals() {
  // Generic reveal-up elements
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Character cards - stagger dari bawah/samping bergantian
  const cards = gsap.utils.toArray('.char-card');
  if (cards.length) {
    gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '#characterGrid',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Gameplay highlight cards - muncul satu-satu
  const gameplayCards = gsap.utils.toArray('.gameplay-card');
  if (gameplayCards.length) {
    gsap.to(gameplayCards, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '#gameplayGrid',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    });
  }
}
