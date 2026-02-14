/**
 * Single JS file for all pages.
 * Set <body data-page="home|date|quotes|final">
 */

const page = document.body.dataset.page || "home";

const music = {
  audioEl: null,
  ensure() {
    if (this.audioEl) return this.audioEl;
    const a = document.createElement("audio");
    a.src = "assets/audio/until-i-found-you.mp3";
    a.loop = true;
    a.preload = "auto";
    a.volume = 0.85;
    document.body.appendChild(a);
    this.audioEl = a;
    return a;
  },
  async play() {
    const a = this.ensure();
    try { await a.play(); } catch (e) { /* autoplay blocked until user gesture */ }
  },
  pause() { const a = this.ensure(); a.pause(); },
  toggle() {
    const a = this.ensure();
    if (a.paused) this.play(); else this.pause();
    return !a.paused;
  }
};

function setupPlayer() {
  const wrap = document.getElementById("player");
  if (!wrap) return;
  const btn = document.getElementById("musicBtn");
  const label = document.getElementById("musicLabel");
  const a = music.ensure();

  const refresh = () => {
    const on = !a.paused;
    btn.textContent = on ? "Pause" : "Play";
    label.textContent = on ? "Playing: Until I Found You" : "Tap Play for music";
  };
  btn.addEventListener("click", async () => {
    await music.toggle();
    refresh();
  });

  // try to start once the user interacts anywhere
  const kick = async () => {
    await music.play();
    refresh();
    window.removeEventListener("pointerdown", kick);
    window.removeEventListener("keydown", kick);
  };
  window.addEventListener("pointerdown", kick, { once: true });
  window.addEventListener("keydown", kick, { once: true });

  refresh();
}

/* ---------- CONFETTI ---------- */
const confettiCanvas = document.getElementById("confettiCanvas");
let confettiInstance = null;

function initConfetti() {
  if (!confettiCanvas || confettiInstance) return;
  confettiInstance = confetti.create(confettiCanvas, { resize: true, useWorker: true });
}
function fullScreenConfetti() {
  initConfetti();
  if (!confettiInstance) return;
  const end = Date.now() + 1500;
  (function frame() {
    confettiInstance({
      particleCount: 10,
      spread: 90,
      startVelocity: 44,
      ticks: 170,
      origin: { x: Math.random(), y: Math.random() * 0.35 }
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  setTimeout(() => {
    confettiInstance({
      particleCount: 240,
      spread: 140,
      startVelocity: 60,
      ticks: 220,
      origin: { x: 0.5, y: 0.58 }
    });
  }, 260);
}

/* ---------- HOME: runaway NO ---------- */
function setupHome() {
  const zone = document.getElementById("zone");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const result = document.getElementById("result");
  const hint = document.getElementById("hint");

  if (!zone || !yesBtn || !noBtn) return;

  let yesScale = 1;
  const growYes = () => {
    yesScale = Math.min(2.2, yesScale + 0.10);
    yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function moveNo(px, py) {
    const z = zone.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();

    let dx = (b.left + b.width / 2) - px;
    let dy = (b.top + b.height / 2) - py;
    let mag = Math.hypot(dx, dy) || 1;
    dx /= mag; dy /= mag;

    let newLeft = (b.left - z.left) + dx * 160;
    let newTop  = (b.top - z.top) + dy * 160;

    newLeft = clamp(newLeft, 0, z.width - b.width);
    newTop  = clamp(newTop, 0, z.height - b.height);

    noBtn.style.left = newLeft + "px";
    noBtn.style.top  = newTop + "px";
    noBtn.style.transform = "none";
    growYes();
  }

  zone.addEventListener("pointermove", (e) => {
    const b = noBtn.getBoundingClientRect();
    const d = Math.hypot((b.left + b.width/2) - e.clientX, (b.top + b.height/2) - e.clientY);
    if (d < 150) moveNo(e.clientX, e.clientY);
  });

  noBtn.addEventListener("click", (e) => { e.preventDefault(); growYes(); });

  yesBtn.addEventListener("click", async () => {
    zone.style.display = "none";
    hint && (hint.style.display = "none");
    if (result) result.style.display = "block";
    fullScreenConfetti();
    await music.play();
  });
}

/* ---------- DATE: shrinking NO with 4 tries ---------- */
function setupDate() {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn  = document.getElementById("noBtn");
  const msg    = document.getElementById("noMsg");
  const result = document.getElementById("result");
  if (!yesBtn || !noBtn) return;

  const messages = ["Try again 😏", "How dare you 😤", "Are you sure? 🥺", "Say YES 😈"];
  let count = 0;

  const applyShrink = () => {
    const scale = Math.max(0.28, 1 - (count * 0.18));
    noBtn.style.transform = `translateY(-50%) scale(${scale})`;
    noBtn.style.filter = `brightness(${Math.max(0.85, 1 - count*0.06)})`;
  };

  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    count = Math.min(4, count + 1);
    if (msg) msg.textContent = messages[count - 1] || "Say YES 😈";
    applyShrink();

    if (count >= 4) {
      // make "No" basically impossible
      noBtn.disabled = true;
      noBtn.style.opacity = 0.35;
      noBtn.style.cursor = "not-allowed";
      // nudge it away
      noBtn.style.left = "80%";
      noBtn.style.top = "70%";
      noBtn.style.position = "absolute";
      noBtn.style.transform = "scale(.25)";
    }
  });

  yesBtn.addEventListener("click", async () => {
    if (result) result.style.display = "block";
    fullScreenConfetti();
    await music.play();
  });

  applyShrink();
}

/* ---------- QUOTES: render cards ---------- */
function setupQuotes() {
  const wrap = document.getElementById("quotes");
  if (!wrap) return;

  const quotes = [
    { q: "I didn’t know what home felt like until I found it in you.", a: "— always" },
    { q: "You’re my favorite kind of magic — the quiet kind that makes everything better.", a: "— forever" },
    { q: "If I had one wish, it would be more moments with you.", a: "— us" },
    { q: "In every crowd, my eyes still look for you first.", a: "— me" },
    { q: "You make ordinary days feel like something worth remembering.", a: "— always" },
    { q: "I choose you. Today, tomorrow, and every day after.", a: "— my heart" }
  ];

  wrap.innerHTML = quotes.map(x => `
    <div class="quoteCard">
      <div class="q">“${x.q}”</div>
      <div class="a">${x.a}</div>
    </div>
  `).join("");
}

/* ---------- FINAL: big love ---------- */
function setupFinal() {
  const btn = document.getElementById("confettiBtn");
  if (btn) btn.addEventListener("click", async () => {
    fullScreenConfetti();
    await music.play();
  });
}

setupPlayer();
if (page === "home") setupHome();
if (page === "date") setupDate();
if (page === "quotes") setupQuotes();
if (page === "final") setupFinal();
