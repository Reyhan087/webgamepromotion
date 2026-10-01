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
