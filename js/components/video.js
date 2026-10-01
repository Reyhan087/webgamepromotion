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
