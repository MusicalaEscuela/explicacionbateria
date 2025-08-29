/* =========================================================
   script.js — Musicala · "Cómo Pensar la Batería"
   Pads con click/teclado, volumen global y (no) solapamiento
   ========================================================= */

/* Rutas de tus audios locales (misma carpeta que index.html) */
const FILES = {
  kick:  "kick.wav",
  snare: "snare.wav",
  hihat: "hihat.wav",
};

/* Estado global */
const sounds = {};            // Instancias base <audio> por sonido
let globalVolume = 0.9;       // 0.0 – 1.0
let noOverlap = true;         // true = no permite capas por sonido
const LS = { vol: "drum.vol", nolayer: "drum.noOverlap" };

/* Helpers corticos */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const statusEl = () => $("#status");
function announce(msg){ const el = statusEl(); if (el) el.textContent = msg; }

/* ------------------ Carga/Preload de audio ------------------ */
function preload() {
  Object.entries(FILES).forEach(([id, path]) => {
    const a = document.createElement("audio");
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    a.src = path;            // WAV local
    a.volume = globalVolume; // volumen inicial
    sounds[id] = a;

    a.addEventListener("canplaythrough", () => {
      // Puedes mostrar algún ready state si quieres
    }, { once:true });

    a.addEventListener("error", () => {
      console.warn(`No se pudo cargar el audio: ${path}`);
    });
  });
}

/* ------------------ Reproducción de sonidos ------------------ */
function playSound(id) {
  const base = sounds[id];
  if (!base) { console.warn("Sonido no encontrado:", id); return; }

  // Feedback visual
  const btn = document.querySelector(`.play-btn[data-sound="${id}"]`);
  if (btn) {
    btn.classList.add("is-playing");
    setTimeout(() => btn.classList.remove("is-playing"), 90);
  }

  if (noOverlap) {
    // Reinicia el mismo objeto: no se superpone
    try {
      base.currentTime = 0;
      base.volume = globalVolume;
      base.play();
      announce(`Reproduciendo ${id}`);
    } catch (e) {
      console.error("Error al reproducir:", e);
    }
  } else {
    // Clona el audio: permite capas superpuestas
    const clone = base.cloneNode(true);
    clone.volume = globalVolume;
    clone.play().catch(err => console.error("Error al reproducir (clone):", err));
    // Limpieza: el clon se remueve al finalizar
    clone.addEventListener("ended", () => clone.remove());
    announce(`Capa añadida de ${id}`);
  }
}

/* ------------------ UI y Controles ------------------ */
function wireUI() {
  // Botones/pads
  $$(".play-btn").forEach(btn => {
    btn.addEventListener("click", () => playSound(btn.dataset.sound));
  });

  // Volumen global (con persistencia)
  const vol = $("#volume");
  if (vol) {
    const savedVol = localStorage.getItem(LS.vol);
    if (savedVol !== null && !Number.isNaN(Number(savedVol))) {
      globalVolume = Number(savedVol);
      vol.value = globalVolume;
      Object.values(sounds).forEach(a => a.volume = globalVolume);
    }
    vol.addEventListener("input", e => {
      globalVolume = Number(e.target.value);
      Object.values(sounds).forEach(a => a.volume = globalVolume);
      localStorage.setItem(LS.vol, String(globalVolume));
      announce(`Volumen ${Math.round(globalVolume*100)}%`);
    });
  }

  // Evitar solapamiento (checkbox con persistencia)
  const chk = $("#noOverlap");
  if (chk) {
    const saved = localStorage.getItem(LS.nolayer);
    if (saved !== null) {
      noOverlap = saved === "1";
      chk.checked = noOverlap;
    }
    chk.addEventListener("change", e => {
      noOverlap = e.target.checked;
      localStorage.setItem(LS.nolayer, noOverlap ? "1" : "0");
      announce(noOverlap ? "Solapamiento desactivado" : "Solapamiento permitido");
    });
  }

  // Teclado: A/S/D → kick/snare/hihat
  const KEY_MAP = { KeyA: "kick", KeyS: "snare", KeyD: "hihat" };

  document.addEventListener("keydown", e => {
    // Evita interferir si estás en un input/textarea
    const tag = (document.activeElement && document.activeElement.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    const id = KEY_MAP[e.code];
    if (id) {
      e.preventDefault(); // evita scroll con espacio, etc.
      playSound(id);
    }
  });
}

/* ------------------ Inicio ------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // Carga preferencia antes de crear audios
  const savedVol = localStorage.getItem(LS.vol);
  if (savedVol !== null && !Number.isNaN(Number(savedVol))) globalVolume = Number(savedVol);

  const savedNo = localStorage.getItem(LS.nolayer);
  if (savedNo !== null) noOverlap = savedNo === "1";

  preload();
  wireUI();
});
