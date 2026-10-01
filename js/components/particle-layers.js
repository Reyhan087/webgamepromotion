/* -------------------------------------------------------------------------
   PARTICLE LAYERS (lihat js/lib/particles.js)
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
    { key: 'characters', selector: '#character-spotlight .char-spotlight', count: 70, colors: ELEMENT_PARTICLE_COLORS.fire, sparkRatio: 0.1 },
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
