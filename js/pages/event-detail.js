/* -------------------------------------------------------------------------
   EVENT DETAIL (event.html?id=<id>)
   Artikel + "Berita Lainnya" dibangun dari window.HSR_EVENTS
   (js/data/events-data.js). id tidak dikenal -> pesan "tidak ditemukan".
   ------------------------------------------------------------------------- */
function initEventDetail() {
  const article = document.getElementById('edArticle');
  const events = window.HSR_EVENTS;
  if (!article || !Array.isArray(events)) return;

  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(window.location.search).get('id');
  const ev = events.find((e) => e.id === id);
  const detailUrl = (e) => `event.html?id=${encodeURIComponent(e.id)}`;

  const body = $('edBody');
  body.replaceChildren();

  if (!ev) {
    $('edTitle').textContent = 'Event tidak ditemukan';
    const p = document.createElement('p');
    p.textContent = 'Event yang kamu cari tidak tersedia atau sudah dipindahkan. Lihat event lain di bawah ini atau kembali ke daftar Event & Berita.';
    body.append(p);
    document.title = 'Event tidak ditemukan | Honkai: Star Rail';
  } else {
    $('edLabel').textContent = ev.label;
    $('edLabel').hidden = false;
    $('edTitle').textContent = ev.title;
    $('edDate').textContent = ev.date;
    $('edDate').dateTime = ev.datetime;

    const img = $('edImg');
    img.src = ev.img;
    img.alt = ev.alt || ev.title;
    if (ev.imgPos) img.style.objectPosition = ev.imgPos;
    $('edHero').hidden = false;

    if (ev.info && ev.info.length) {
      const dl = $('edInfo');
      ev.info.forEach(([term, value]) => {
        const row = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = term;
        dd.textContent = value;
        row.append(dt, dd);
        dl.append(row);
      });
      dl.hidden = false;
    }

    ev.body.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      body.append(p);
    });

    document.title = `${ev.title} | Honkai: Star Rail`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = ev.body[0];
  }

  // Berita Lainnya: semua event lain, urutan sama dengan daftar
  const list = $('edNews');
  events.filter((e) => e !== ev).forEach((e) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'ed-news-item';
    a.href = detailUrl(e);

    const thumb = document.createElement('span');
    thumb.className = 'ed-news-thumb';
    const img = document.createElement('img');
    img.src = e.img;
    img.alt = '';
    img.loading = 'lazy';
    if (e.imgPos) img.style.objectPosition = e.imgPos;
    thumb.append(img);

    const text = document.createElement('span');
    text.className = 'ed-news-text';
    const title = document.createElement('span');
    title.className = 'ed-news-title';
    title.textContent = e.title;
    const date = document.createElement('time');
    date.className = 'ed-news-date';
    date.dateTime = e.datetime;
    date.textContent = e.date;
    text.append(title, date);

    a.append(thumb, text);
    li.append(a);
    list.append(li);
  });
}
