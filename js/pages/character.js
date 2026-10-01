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

  // Badge "(ikon elemen) · (ikon path) Nama Path" - format sama dengan
  // Character Spotlight di Home. Ikon: assets/images/Path/Type_<Elemen>.webp
  // & Icon_<Path>.webp (dari data-element / data-path di .cp-thumb).
  function setBadge(badge, d) {
    const icon = (src, alt) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.className = 'char-badge-icon';
      img.width = 64;
      img.height = 64;
      return img;
    };
    const sep = document.createElement('span');
    sep.className = 'char-badge-sep';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '·';
    const path = document.createElement('span');
    path.className = 'char-badge-path';
    path.textContent = d.path;
    badge.replaceChildren(
      icon(`assets/images/Path/Type_${d.element}.webp`, d.element),
      sep,
      icon(`assets/images/Path/Icon_${d.path}.webp`, ''),
      path,
    );
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
    setBadge(el.badge, d);
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
      setBadge(probe.querySelector('.char-badge'), t.dataset);
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
