/* =========================================================================
   HONKAI: STAR RAIL - FAN LANDING PAGE
   main.js - titik masuk: menjalankan semua modul setelah DOM siap.

   Struktur (script biasa, berbagi scope global; urutan <script> di HTML:
   lib -> data -> core -> components -> sections -> pages -> main.js):
     lib/particles.js        class ParticleField (debu bintang canvas)
     data/events-data.js     data event & berita (event.html)
     core/utils.js           prefersReducedMotion, hasGsap
     components/             loader, navbar & menu, partikel per section,
                             Carousel, video klik-untuk-play, scroll reveal
     sections/               hero, character spotlight, special program
     pages/                  events.html, event.html, character.html
   Tiap init* aman dipanggil di halaman mana pun: langsung return kalau
   elemennya tidak ada.
   ========================================================================= */

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
