/* -------------------------------------------------------------------------
   EVENT FEED (events.html): tampilkan EVENT_FEED_INITIAL event dulu, sisanya
   muncul setelah tombol "Lihat Selengkapnya" diklik (lalu tombol hilang).
   Dipanggil sebelum initScrollReveals; setelah baris tersembunyi ditampilkan,
   ScrollTrigger.refresh() menghitung ulang posisi reveal-nya.
   ------------------------------------------------------------------------- */
const EVENT_FEED_INITIAL = 5;

function initEventFeed() {
  const feed = document.getElementById('eventFeed');
  const button = document.getElementById('eventFeedMore');
  if (!feed || !button) return;

  const extra = Array.from(feed.children).slice(EVENT_FEED_INITIAL);
  if (!extra.length) return;

  extra.forEach((item) => { item.hidden = true; });
  button.hidden = false;

  button.addEventListener('click', () => {
    extra.forEach((item) => { item.hidden = false; });
    button.parentElement.remove();
    if (window.ScrollTrigger) ScrollTrigger.refresh();

    // Fokus pindah ke link event pertama yang baru muncul (tombolnya sudah hilang)
    const first = extra[0].querySelector('.event-row-link');
    if (first) first.focus({ preventScroll: true });
  });
}
