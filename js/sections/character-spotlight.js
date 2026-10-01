/* -------------------------------------------------------------------------
   CHARACTER SPOTLIGHT CAROUSEL
   Tiap ganti slide: tema section (warna label) + warna partikel ikut
   elemen karakter yang aktif. Saat section di luar layar, semua animasi
   CSS-nya di-pause (.is-offscreen) supaya tidak membebani GPU.
   ------------------------------------------------------------------------- */
function initCharacterCarousel() {
  const root = document.querySelector('[data-carousel="characters"]');
  if (!root) return;

  if ('IntersectionObserver' in window) {
    root.classList.add('is-offscreen');
    new IntersectionObserver(([entry]) => {
      root.classList.toggle('is-offscreen', !entry.isIntersecting);
    }, { rootMargin: '100px 0px' }).observe(root);
  }

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
