// ================= EDIT DI SINI =================

// Lagu: file MP3 di folder musik (diputar penuh, lalu mengulang).
const LAGU = { file: "musik/lagu.mp3" };

// tipe: "teks" | "daftar" | "slide" | "rahasia"
// Pakai \n untuk baris baru.
const pesan = [
  { judul: "Untukmu", tipe: "teks",
    isi: "Selamat ulang tahun, sayang.\n\nTulis ucapan utamamu di sini." },

  { judul: "Alasan aku sayang kamu", tipe: "daftar",
    isi: ["Alasan pertama.", "Alasan kedua.", "Alasan ketiga.", "Alasan keempat."] },

  { judul: "Hal kecil yang kuingat", tipe: "daftar",
    isi: ["Makanan favoritmu.", "Kebiasaan lucumu.", "Kata-kata yang sering kamu ucapkan."] },

  { judul: "Doaku untukmu", tipe: "teks",
    isi: "Semoga kamu sehat, bahagia, dan semua impianmu terwujud." },

  { judul: "Voucher untukmu", tipe: "daftar",
    isi: ["Makan di tempat favoritmu, aku yang traktir.", "Nonton film pilihanmu.", "Satu hari bebas minta apa saja (yang masuk akal)."] },

  { judul: "Janjiku", tipe: "teks",
    isi: "Tulis janji kecil yang tulus untuk tahun depan." },

  // Kalau ekstensi foto bukan .jpeg, ganti di sini (mis. foto3.jpg)
  { judul: "Kenangan kita", tipe: "slide",
    slide: [
      { foto: "foto/foto1.jpeg", caption: "Tulis cerita foto pertama." },
      { foto: "foto/foto2.jpeg", caption: "Tulis cerita foto kedua." },
      { foto: "foto/foto3.jpeg", caption: "Tulis cerita foto ketiga." },
      { foto: "foto/foto4.jpeg", caption: "Tulis cerita foto keempat." },
      { foto: "foto/foto5.jpeg", caption: "Tulis cerita foto kelima." },
      { foto: "foto/foto6.jpeg", caption: "Tulis cerita foto keenam." },
      { foto: "foto/foto7.jpeg", caption: "Tulis cerita foto ketujuh." }
    ] },

  { judul: "Pesan rahasia", tipe: "rahasia",
    isi: "Aku sayang kamu, hari ini dan seterusnya.\n\nNAMA_KAMU" }
];

// =================================================

const cover = document.getElementById('cover');
const amplop = document.getElementById('amplop');
const beranda = document.getElementById('beranda');
const list = document.getElementById('kotak-list');
const popup = document.getElementById('popup');
const isiEl = document.getElementById('popup-isi');
const judulEl = document.getElementById('popup-judul');
const dibuka = new Set();

// ---------- Lagu ----------
const audio = new Audio();
audio.loop = true; // habis -> ulang dari awal. Hapus baris ini kalau tidak mau diulang.

function mainkanLagu() {
  audio.src = LAGU.file;
  audio.currentTime = 0;
  audio.volume = 1;
  audio.play().catch(() => {});
}

// ---------- Bantuan ----------
function el(tag, teks, kelas) {
  const e = document.createElement(tag);
  if (teks) e.textContent = teks;
  if (kelas) e.className = kelas;
  return e;
}

// ---------- Slide foto ----------
function buatSlide(daftar) {
  const wrap = el('div');
  const slider = el('div', '', 'slider');
  const track = el('div', '', 'track');
  daftar.forEach((s) => {
    const d = el('div', '', 'slide');
    const img = el('img');
    img.src = s.foto;
    img.alt = s.caption;
    d.append(img, el('p', s.caption));
    track.appendChild(d);
  });
  slider.appendChild(track);

  const kontrol = el('div', '', 'kontrol');
  const kiri = el('button', '‹', 'panah');
  kiri.setAttribute('aria-label', 'Sebelumnya');
  const kanan = el('button', '›', 'panah');
  kanan.setAttribute('aria-label', 'Berikutnya');
  const titikWrap = el('div', '', 'titik-wrap');
  const titik = daftar.map(() => {
    const t = el('span', '', 'titik');
    titikWrap.appendChild(t);
    return t;
  });
  kontrol.append(kiri, titikWrap, kanan);

  let i = 0;
  function pergi(n) {
    i = (n + daftar.length) % daftar.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    titik.forEach((t, k) => t.classList.toggle('aktif', k === i));
  }
  kiri.onclick = () => pergi(i - 1);
  kanan.onclick = () => pergi(i + 1);

  let x0 = 0;
  slider.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) pergi(dx < 0 ? i + 1 : i - 1);
  });
  pergi(0);

  wrap.append(slider, kontrol);
  return wrap;
}

// ---------- Pop up ----------
function tampilkan(p, tombol) {
  isiEl.replaceChildren();
  judulEl.textContent = p.judul;

  if (p.tipe === 'rahasia' && dibuka.size < pesan.length - 1) {
    isiEl.appendChild(el('p', 'Buka semua kotak lainnya dulu ya, baru pesan ini bisa dibuka.'));
  } else {
    if (p.tipe === 'daftar') {
      const ul = el('ul');
      p.isi.forEach((t) => ul.appendChild(el('li', t)));
      isiEl.appendChild(ul);
    } else if (p.tipe === 'slide') {
      isiEl.appendChild(buatSlide(p.slide));
    } else {
      isiEl.appendChild(el('p', p.isi));
    }
    dibuka.add(p.judul);
    tombol.classList.add('dibuka');
  }
  popup.showModal();
}

pesan.forEach((p) => {
  const b = el('button', p.judul, 'kotak');
  b.onclick = () => tampilkan(p, b);
  list.appendChild(b);
});

// Tutup: tombol, klik area luar, atau Esc. Lagu tetap jalan.
document.getElementById('popup-tutup').onclick = () => popup.close();
popup.addEventListener('click', (e) => { if (e.target === popup) popup.close(); });
popup.addEventListener('close', () => { isiEl.replaceChildren(); });

// ---------- Layar amplop ----------
function buatTombolMusik() {
  const b = el('button', 'Jeda musik', 'tombol-musik');
  b.onclick = () => {
    if (audio.paused) { audio.play().catch(() => {}); b.textContent = 'Jeda musik'; }
    else { audio.pause(); b.textContent = 'Putar musik'; }
  };
  document.body.appendChild(b);
}

document.getElementById('btn-buka').onclick = () => {
  mainkanLagu(); // lagu mulai tepat saat tombol ditekan
  amplop.classList.add('buka');
  setTimeout(() => cover.classList.add('hilang'), 1300);
  setTimeout(() => {
    cover.hidden = true;
    beranda.hidden = false;
    buatTombolMusik();
    hujanHati();
  }, 2000);
};

function hujanHati() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 18; i++) {
    const h = el('span', '♥', 'hati');
    h.style.left = Math.random() * 100 + 'vw';
    h.style.fontSize = 9 + Math.random() * 8 + 'px';
    h.style.animationDuration = 8 + Math.random() * 7 + 's';
    h.style.animationDelay = Math.random() * 4 + 's';
    document.body.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
}