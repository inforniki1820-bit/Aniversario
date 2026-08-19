/* ====================================================
   0. BOTÓN DE MÚSICA
   ==================================================== */

// ⚠️ Coloca tu archivo de canción en la misma carpeta que index.html
// y llámalo "cancion.mp3" (o cambia el nombre en el <audio> del HTML).
const musica = document.getElementById('musica');
const btnMusica = document.getElementById('btnMusica');
let sonando = false;

btnMusica.addEventListener('click', () => {
    if (sonando) {
        musica.pause();
        btnMusica.textContent = '🔇';
    } else {
        musica.play().catch(() => {
            // Algunos celulares bloquean el audio hasta que el usuario toca la pantalla;
            // como esto ya es un click del usuario, normalmente sí funciona.
        });
        btnMusica.textContent = '🎵';
    }
    sonando = !sonando;
});


/* ====================================================
   1. CONTADOR EN VIVO (años, meses, días, horas, min, seg)
   ==================================================== */

// ⚠️ Revisa el año: si su "3 meses" empezó el 23 de mayo de 2026,
// esto ya está bien. Si fue en otro año, cámbialo aquí:
const fechaInicio = new Date('2026-05-23T00:00:00');

function actualizarContador() {
    const ahora = new Date();

    let anios = ahora.getFullYear() - fechaInicio.getFullYear();
    let meses = ahora.getMonth() - fechaInicio.getMonth();
    let dias = ahora.getDate() - fechaInicio.getDate();
    let horas = ahora.getHours() - fechaInicio.getHours();
    let minutos = ahora.getMinutes() - fechaInicio.getMinutes();
    let segundos = ahora.getSeconds() - fechaInicio.getSeconds();

    // Ajustes tipo "calculadora de edad" para que cada unidad quede correcta
    if (segundos < 0) { segundos += 60; minutos--; }
    if (minutos < 0) { minutos += 60; horas--; }
    if (horas < 0) { horas += 24; dias--; }
    if (dias < 0) {
        // Toma los días del mes anterior a "ahora"
        const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
        dias += mesAnterior.getDate();
        meses--;
    }
    if (meses < 0) { meses += 12; anios--; }

    if (anios < 0) { anios = 0; meses = 0; dias = 0; horas = 0; minutos = 0; segundos = 0; }

    const mesesTotales = anios * 12 + meses; // por si en el futuro ya pasó más de un año

    document.getElementById('meses').textContent = mesesTotales;
    document.getElementById('dias').textContent = dias;
    document.getElementById('horas').textContent = String(horas).padStart(2, '0');
    document.getElementById('minutos').textContent = String(minutos).padStart(2, '0');
    document.getElementById('segundos').textContent = String(segundos).padStart(2, '0');
}

actualizarContador();
setInterval(actualizarContador, 1000);


/* ====================================================
   2. CARTA DE AMOR DESPLEGABLE
   ==================================================== */

const btnCarta = document.getElementById('btnCarta');
const cartaAmor = document.getElementById('cartaAmor');
const cerrarCarta = document.getElementById('cerrarCarta');

btnCarta.addEventListener('click', () => {
    cartaAmor.classList.add('visible');
});

cerrarCarta.addEventListener('click', () => {
    cartaAmor.classList.remove('visible');
});

// También se cierra si toca fuera de la carta (en el fondo oscuro)
cartaAmor.addEventListener('click', (e) => {
    if (e.target === cartaAmor) {
        cartaAmor.classList.remove('visible');
    }
});


/* ====================================================
   3. CHISPAS / CORAZONCITOS AL TOCAR LA PANTALLA
   ==================================================== */

const canvasToques = document.getElementById('canvasToques');
const ctxToques = canvasToques.getContext('2d');

function ajustarToques() {
    canvasToques.width = window.innerWidth;
    canvasToques.height = window.innerHeight;
}
ajustarToques();
window.addEventListener('resize', ajustarToques);

class ChispaToque {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = -(Math.random() * 3 + 1.5);
        this.gravedad = 0.06;
        this.alpha = 1;
        this.size = Math.random() * 10 + 12;
        this.rotacion = (Math.random() - 0.5) * 0.6;
        this.emoji = Math.random() > 0.45 ? '❤️' : '✨';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravedad;
        this.alpha -= 0.018;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotacion);
        ctx.font = `${this.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

let particulasToque = [];

function crearExplosion(x, y) {
    const cantidad = 10;
    for (let i = 0; i < cantidad; i++) {
        particulasToque.push(new ChispaToque(x, y));
    }
}

// Funciona en celular (touch) y en computadora (click)
document.addEventListener('touchstart', (e) => {
    for (let i = 0; i < e.touches.length; i++) {
        crearExplosion(e.touches[i].clientX, e.touches[i].clientY);
    }
}, { passive: true });

document.addEventListener('click', (e) => {
    crearExplosion(e.clientX, e.clientY);
});

function animarToques() {
    ctxToques.clearRect(0, 0, canvasToques.width, canvasToques.height);

    particulasToque.forEach(p => p.update());
    particulasToque = particulasToque.filter(p => p.alpha > 0);
    particulasToque.forEach(p => p.draw(ctxToques));

    requestAnimationFrame(animarToques);
}

animarToques();