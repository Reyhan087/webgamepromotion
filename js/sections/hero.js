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
   PARALLAX HERO
   Saat discroll, gambar banner & partikel bergerak lebih lambat dari teks
   (foreground) -> kesan kedalaman. Progress scroll dikirim ke CSS variable
   --hero-parallax (0..1) yang dipakai properti `translate` di css/sections/hero.css,
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
