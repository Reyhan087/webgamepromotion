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
