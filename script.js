// Archivos de sonido corregidos
const sounds = {
    kick: new Audio("https://www.myinstants.com/media/sounds/bass-drum.mp3"),
    snare: new Audio("https://www.myinstants.com/media/sounds/snare.mp3"),
    hihat: new Audio("https://cdn.freesound.org/previews/3/3054_4931-lq.mp3") // Reemplazado
};

// Función para reproducir sonidos sin que se solapen
function playSound(sound) {
    if (sounds[sound]) {
        sounds[sound].currentTime = 0;
        sounds[sound].play().catch(error => console.error("Error al reproducir sonido:", error));
    } else {
        console.error("Sonido no encontrado:", sound);
    }
}

// Asignar evento a los botones
document.querySelectorAll(".play-btn").forEach(button => {
    button.addEventListener("click", () => playSound(button.dataset.sound));
});
