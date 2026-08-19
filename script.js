const canvas = document.getElementById('canvasCorazon');
const ctx = canvas.getContext('2d');

// Ajustar el tamaño del lienzo al celular
function ajustarTamaño() {
    const minDimension = Math.min(window.innerWidth, window.innerHeight * 0.6);
    canvas.width = minDimension * 0.9;
    canvas.height = minDimension * 0.9;
}

ajustarTamaño();
window.addEventListener('resize', ajustarTamaño);

// Ecuación matemática de la forma de corazón
function puntoEnCorazon(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x, y };
}

let tiempo = 0;

class Particula {
    constructor(tipo) {
        this.tipo = tipo; // 'contorno' (borde del corazón) o 'relleno' (interior)

        const t = Math.random() * Math.PI * 2;
        const pos = puntoEnCorazon(t);

        // Las de "relleno" se acercan al centro con un factor aleatorio (0.25 a 0.9)
        this.factor = tipo === 'relleno' ? (0.25 + Math.random() * 0.65) : 1;
        this.baseX = pos.x * this.factor;
        this.baseY = pos.y * this.factor;

        this.offset = Math.random() * Math.PI * 2;
        this.size = tipo === 'relleno' ? Math.random() * 1.3 + 0.5 : Math.random() * 2 + 1;
        this.blur = tipo === 'relleno' ? 4 : 8;

        // Variedad de color: azul, celeste claro, y un toque de blanco brillante
        const r = Math.random();
        this.color = r < 0.12 ? '#a00404' : (r < 0.55 ? '#8f250e' : '#730808');

        this.velRuido = Math.random() * 0.5 + 0.3;

        this.reset(true);
    }

    reset(inicial = false) {
        this.llegado = false;
        this.alpha = 0;
        this.velocidad = Math.random() * 0.03 + 0.015;

        const escalaInicial = canvas.width / 38;
        const targetXInicial = canvas.width / 2 + this.baseX * escalaInicial;

        // Nace desde abajo, con dispersión horizontal (como humo/chispas subiendo)
        this.x = targetXInicial + (Math.random() - 0.5) * canvas.width * 0.5;
        this.y = inicial
            ? canvas.height + Math.random() * canvas.height
            : canvas.height + Math.random() * 120;
    }

    update(escala) {
        const targetX = canvas.width / 2 + this.baseX * escala;
        const targetY = canvas.height / 2 + this.baseY * escala;

        if (!this.llegado) {
            this.x += (targetX - this.x) * this.velocidad;
            this.y += (targetY - this.y) * this.velocidad;
            this.alpha = Math.min(this.alpha + 0.015, 1);

            const dist = Math.hypot(targetX - this.x, targetY - this.y);
            if (dist < 1.5) this.llegado = true;
        } else {
            this.x = targetX + Math.sin(tiempo * this.velRuido + this.offset) * 1.2;
            this.y = targetY + Math.cos(tiempo * this.velRuido + this.offset) * 1.2;
            this.alpha = 0.5 + Math.sin(tiempo * 1.5 + this.offset) * 0.5;

            if (Math.random() < 0.0015) this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.blur;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Chispas ambientales en la base, como una "fuente" de donde nace el humo
class ChispaBase {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.9;
        this.y = canvas.height * (0.88 + Math.random() * 0.12);
        this.vy = -(Math.random() * 0.3 + 0.1);
        this.vx = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 1.5 + 0.5;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '#c04b4b' : '#940f0f';
    }

    update() {
        this.y += this.vy;
        this.x += this.vx;
        this.alpha -= 0.004;
        if (this.alpha <= 0) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const particulas = [];
const cantidadContorno = 260;
const cantidadRelleno = 200;

for (let i = 0; i < cantidadContorno; i++) particulas.push(new Particula('contorno'));
for (let i = 0; i < cantidadRelleno; i++) particulas.push(new Particula('relleno'));

const chispas = [];
for (let i = 0; i < 70; i++) chispas.push(new ChispaBase());

// Latido doble tipo "lub-dub" (más realista que un solo pulso)
function latidoDoble(t) {
    const ciclo = t % 2.2;
    let p = 0;
    if (ciclo < 0.15) {
        p = Math.sin((ciclo / 0.15) * Math.PI);
    } else if (ciclo > 0.3 && ciclo < 0.45) {
        p = Math.sin(((ciclo - 0.3) / 0.15) * Math.PI) * 0.6;
    }
    return p;
}

function animar() {
    tiempo += 0.02;

    const latido = 1 + latidoDoble(tiempo) * 0.05;
    const escala = (canvas.width / 38) * latido;

    ctx.fillStyle = 'rgba(2, 2, 8, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    chispas.forEach(c => {
        c.update();
        c.draw();
    });

    particulas.forEach(p => {
        p.update(escala);
        p.draw();
    });

    requestAnimationFrame(animar);
}

animar();