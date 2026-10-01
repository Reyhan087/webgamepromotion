/* =========================================================================
   DATA EVENT & BERITA
   Dipakai halaman detail event.html (lihat initEventDetail di js/pages/event-detail.js):
   isi artikel + daftar "Berita Lainnya" dibangun dari array ini.
   Kartu di events.html menautkan ke event.html?id=<id>.

   Tambah event: tambahkan satu objek di sini (id unik, huruf kecil-strip),
   lalu tambahkan kartunya di events.html dengan href="event.html?id=<id>".
     id       -> dipakai di URL
     label    -> kategori (chip emas)
     title    -> judul
     datetime -> tanggal ISO (untuk <time>), date -> tanggal tampil
     img/alt  -> banner (sama dengan thumbnail kartu)
     summary  -> deskripsi singkat (sama dengan teks kartu)
     imgPos   -> opsional, object-position banner (gambar non-16:9)
     info     -> opsional, ringkasan [label, nilai] di atas artikel
     body     -> paragraf artikel
   Entri 4, 6, 7, 8, 10: judul/teks masih tebakan dari visual banner (belum
   ada keterangan resmi).
   ========================================================================= */
window.HSR_EVENTS = [
  {
    id: 'fase-2-event-warp',
    label: 'Event Warp',
    title: 'Fase II Event Warp: "In Ravages Does the Whistle Sound"',
    datetime: '2026-09-24',
    date: '24 Sep 2026',
    img: 'assets/images/events/event1.webp',
    alt: 'Banner Fase II Event Warp "In Ravages Does the Whistle Sound"',
    summary: 'Banner warp edisi terbatas Fase II resmi dibuka, menghadirkan tiga karakter unggulan dengan drop-rate yang ditingkatkan selama periode Warp Terbatas.',
    info: [['Periode', 'Fase II · Warp Terbatas'], ['Drop-rate ditingkatkan', '3 karakter unggulan']],
    body: [
      'Fase II Event Warp "In Ravages Does the Whistle Sound" resmi dibuka! Banner edisi terbatas ini menghadirkan tiga karakter unggulan dengan drop-rate yang ditingkatkan, jadi peluangmu membawa pulang karakter incaran jauh lebih besar selama periode Warp Terbatas.',
      'Setiap Warp tetap dihitung ke sistem pity Event Warp yang sama. Kalau kamu sudah menabung Star Rail Special Pass sejak fase sebelumnya, progres pity-mu terbawa sepenuhnya ke fase ini.',
      'Banner hanya tersedia selama Fase II berlangsung. Atur Stellar Jade-mu dengan bijak — dan sampai jumpa di peron keberangkatan, Trailblazer!',
    ],
  },
  {
    id: 'limited-time-bonus',
    label: 'Bonus Kolaborasi',
    title: 'Limited-Time Bonus!',
    datetime: '2026-09-24',
    date: '24 Sep 2026',
    img: 'assets/images/events/event2.webp',
    alt: 'Banner Limited-Time Bonus: Light Cone kolaborasi bintang 5',
    summary: 'Selama periode Warp Version 4.4, gunakan hingga 200 Star Rail Special Pass untuk klaim 1 Light Cone kolaborasi bintang 5 pilihan: "I Am As You Behold" atau "The Hell Where Ideals Burn".',
    info: [['Hadiah', '1 Light Cone kolaborasi 5★ pilihan'], ['Syarat', 'Gunakan total 200 Star Rail Special Pass selama Warp Versi 4.4']],
    body: [
      'Kolaborasi dengan Fate/stay night [Unlimited Blade Works] membawa bonus spesial selama Versi 4.4. Setiap Star Rail Special Pass yang kamu gunakan di Event Warp mana pun akan dihitung ke progres bonus ini.',
      'Setelah total pemakaian mencapai 200 Star Rail Special Pass, kamu bisa memilih satu Light Cone kolaborasi bintang 5: "I Am As You Behold" atau "The Hell Where Ideals Burn". Pilih yang paling cocok dengan karakter kolaborasi yang kamu mainkan.',
      'Bonus berlangsung sepanjang Versi 4.4, dan Light Cone baru bisa diklaim setelah event kolaborasi dimulai. Pantau terus pengumuman resmi untuk detail lengkapnya.',
    ],
  },
  {
    id: 'log-in-to-claim',
    label: 'Event Login',
    title: 'Log in to Claim!',
    datetime: '2026-09-24',
    date: '24 Sep 2026',
    img: 'assets/images/events/event3.webp',
    alt: 'Banner Log in to Claim: pilih Gilgamesh atau Archer',
    summary: 'Login selama periode kolaborasi dan pilih gratis satu karakter kolaborasi bintang 5: Gilgamesh (Destruction · Lightning) atau Archer (The Hunt · Quantum).',
    info: [['Hadiah', 'Pilih 1 karakter kolaborasi 5★ gratis'], ['Pilihan', 'Gilgamesh (Destruction · Lightning) / Archer (The Hunt · Quantum)']],
    body: [
      'Hadiah terbesar kolaborasi ini datang dengan syarat paling sederhana: cukup login! Selama periode kolaborasi, setiap Trailblazer bisa memilih satu karakter kolaborasi bintang 5 secara gratis.',
      'Pilihannya: Gilgamesh, sang Raja para Pahlawan dengan Path Destruction dan elemen Lightning, atau Archer, pemanah berjubah merah dengan Path The Hunt dan elemen Quantum. Pertimbangkan tim yang sudah kamu miliki sebelum memutuskan.',
      'Hadiah bisa diklaim sejak awal event kolaborasi hingga akhir Versi 4.6, jadi tidak perlu terburu-buru — tapi jangan sampai terlewat!',
    ],
  },
  {
    id: 'sorotan-cerita-sang-navigator',
    label: 'Cerita',
    title: 'Sorotan Cerita: Sang Navigator',
    datetime: '2026-09-20',
    date: '20 Sep 2026',
    img: 'assets/images/events/event4.webp',
    alt: 'Key visual Sorotan Cerita: Sang Navigator',
    summary: 'Sebuah momen sunyi di tengah perjalanan Astral Express — telusuri kembali kisah karakter melalui potongan cerita baru yang penuh emosi.',
    info: [['Jenis', 'Sorotan cerita']],
    body: [
      'Di antara lompatan dari satu dunia ke dunia lain, ada momen-momen sunyi di dalam gerbong Astral Express yang jarang terlihat. Sorotan cerita kali ini mengajakmu berhenti sejenak dan menengok ke dalam salah satu momen itu.',
      'Telusuri kembali kisah sang navigator melalui potongan cerita baru — tentang alasan memulai perjalanan, tentang orang-orang yang ditinggalkan, dan tentang tujuan yang masih menunggu di ujung rel bintang.',
    ],
  },
  {
    id: 'charmony-festival-invitation',
    label: 'Event Web',
    title: 'Charmony Festival: Festival Invitation Kembali!',
    datetime: '2026-09-22',
    date: '22 Sep 2026',
    img: 'assets/images/events/event5.webp',
    alt: 'Banner Charmony Festival: Festival Invitation',
    summary: 'Event web "Festival Invitation" resmi kembali digelar di Penacony! Ikuti rangkaian misi festival dan raih hingga 540 Stellar Jade secara gratis.',
    info: [['Hadiah', 'Hingga 540 Stellar Jade'], ['Lokasi', 'Penacony · event web']],
    body: [
      'Charmony Festival di Penacony kembali meriah! Event web "Festival Invitation" dibuka lagi, dan undangannya sudah menunggumu.',
      'Ikuti rangkaian misi festival langsung dari browser — tanpa perlu membuka game — dan kumpulkan hadiah di setiap tahapnya. Total hadiah yang bisa kamu raih mencapai 540 Stellar Jade secara gratis.',
      'Jangan lupa mampir setiap hari selama periode event agar tidak ada misi dan hadiah yang terlewat.',
    ],
  },
  {
    id: 'bayang-di-tengah-hujan',
    label: 'Cerita',
    title: 'Bayang di Tengah Hujan',
    datetime: '2026-09-12',
    date: '12 Sep 2026',
    img: 'assets/images/events/event6.webp',
    alt: 'Key visual Bayang di Tengah Hujan',
    summary: 'Sebuah babak cerita baru yang lebih kelam menanti — ikuti alur kisah penuh emosi ini saat rahasia lama mulai terungkap.',
    info: [['Jenis', 'Babak cerita']],
    body: [
      'Hujan turun tanpa henti, dan bersama setiap tetesnya, kenangan lama perlahan kembali ke permukaan. Babak cerita baru ini membawa nuansa yang lebih kelam dari biasanya.',
      'Ikuti alur kisah penuh emosi saat rahasia yang lama terpendam mulai terungkap satu per satu — dan bersiaplah menghadapi kebenaran yang mungkin tidak ingin didengar siapa pun.',
    ],
  },
  {
    id: 'sinyal-yang-terputus',
    label: 'Misteri',
    title: 'Sinyal yang Terputus',
    datetime: '2026-09-08',
    date: '8 Sep 2026',
    img: 'assets/images/events/event7.webp',
    alt: 'Key visual Sinyal yang Terputus',
    summary: 'Sesuatu yang tak beres tersembunyi di balik data yang rusak — investigasi babak misteri terbaru dan ungkap kebenarannya.',
    info: [['Jenis', 'Babak misteri']],
    body: [
      'Sebuah sinyal aneh terputus di tengah transmisi, meninggalkan potongan data yang rusak dan lebih banyak pertanyaan daripada jawaban.',
      'Dalam babak misteri terbaru ini, kumpulkan petunjuk dari setiap fragmen data, telusuri jejak yang sengaja disembunyikan, dan ungkap siapa — atau apa — yang berada di balik gangguan tersebut.',
    ],
  },
  {
    id: 'sorotan-karakter-baru',
    label: 'Karakter',
    title: 'Sorotan Karakter Baru',
    datetime: '2026-09-01',
    date: '1 Sep 2026',
    img: 'assets/images/events/event8.webp',
    alt: 'Key visual Sorotan Karakter Baru',
    summary: 'Kenali karakter terbaru yang akan segera bergabung dengan Astral Express — intip gaya bertarung dan kepribadiannya sebelum banner-nya dibuka.',
    info: [['Jenis', 'Sorotan karakter']],
    body: [
      'Wajah baru akan segera bergabung dengan perjalanan Astral Express! Sebelum banner-nya dibuka, mari berkenalan lebih dulu.',
      'Intip gaya bertarung, kepribadian, dan sepotong kisah di balik karakter terbaru ini. Detail lengkap skill dan rekomendasi tim akan diumumkan menjelang pembukaan banner — nantikan!',
    ],
  },
  {
    id: 'boys-dorm-merch',
    label: 'Merchandise',
    title: 'Official Merch Release: Boys\' Dorm Series Sudah Tersedia!',
    datetime: '2026-09-15',
    date: '15 Sep 2026',
    img: 'assets/images/events/event9.webp',
    alt: 'Banner Official Merch Release seri Boys\' Dorm',
    summary: 'Chibi blind box dan plush merch seri Boys\' Dorm resmi rilis di Amazon, menampilkan Jing Yuan, Dan Heng, Blade, Sunday, Argenti, Dr. Ratio, Aventurine, dan Boothill — plus edisi spesial "Secret Dan Heng · Imbibitor Lunae" dan "Secret Aventurine".',
    info: [['Produk', 'Chibi blind box & plush'], ['Tersedia di', 'Amazon']],
    body: [
      'Merchandise resmi seri Boys\' Dorm kini sudah tersedia di Amazon! Koleksi ini hadir dalam bentuk chibi blind box dan plush yang menggemaskan.',
      'Seri ini menampilkan Jing Yuan, Dan Heng, Blade, Sunday, Argenti, Dr. Ratio, Aventurine, dan Boothill. Beruntung? Kamu juga bisa mendapatkan edisi spesial "Secret Dan Heng · Imbibitor Lunae" dan "Secret Aventurine".',
      'Kunjungi toko resmi untuk melihat koleksi lengkapnya, termasuk aksesori dan figur lainnya.',
    ],
  },
  {
    id: 'sang-ksatria-api',
    label: 'Karakter',
    title: 'Sang Ksatria Api',
    datetime: '2026-08-20',
    date: '20 Agu 2026',
    img: 'assets/images/events/event10.webp',
    alt: 'Key visual Sang Ksatria Api',
    summary: 'Sosok baru dengan kekuatan api yang membara mulai menampakkan diri — nantikan detail lengkap kemampuan dan cerita di baliknya.',
    info: [['Jenis', 'Sorotan karakter']],
    body: [
      'Di tengah bara yang belum padam, sesosok ksatria bangkit dengan kekuatan api yang membara. Siapa dia, dan dari mana asalnya?',
      'Detail lengkap kemampuan dan kisah di balik sosok misterius ini akan segera diungkap. Pantau terus halaman Event & Berita untuk kabar terbarunya.',
    ],
  },
];
