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
