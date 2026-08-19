const canvasR = document.getElementById('canvasRayos');
const ctxR = canvasR.getContext('2d');

function ajustarRayos() {
    canvasR.width = window.innerWidth;
    canvasR.height = window.innerHeight;
}
ajustarRayos();
window.addEventListener('resize', ajustarRayos);

// Cada rayo es una línea larga que gira lentamente alrededor de un punto
const rayos = [];
const cantidadRayos = 7;

for (let i = 0; i < cantidadRayos; i++) {
    rayos.push({
        anguloBase: Math.random() * Math.PI * 2,
        velocidad: (Math.random() * 0.06 + 0.02) * (Math.random() < 0.5 ? 1 : -1),
        grosor: Math.random() * 2 + 1,
        largo: Math.max(window.innerWidth, window.innerHeight) * 1.6,
        color: Math.random() > 0.5 ? '0, 160, 255' : '0, 210, 255'
    });
}

let t = 0;

function dibujarRayos() {
    t += 0.01;

    ctxR.clearRect(0, 0, canvasR.width, canvasR.height);
    ctxR.globalCompositeOperation = 'lighter'; // hace que se vean como luz, no como líneas sólidas

    // Punto de origen de los rayos (cerca de la parte superior, como en el video de referencia)
    const cx = canvasR.width / 2;
    const cy = canvasR.height * 0.18;

    rayos.forEach(r => {
        const angulo = r.anguloBase + t * r.velocidad;
        const x1 = cx - Math.cos(angulo) * r.largo / 2;
        const y1 = cy - Math.sin(angulo) * r.largo / 2;
        const x2 = cx + Math.cos(angulo) * r.largo / 2;
        const y2 = cy + Math.sin(angulo) * r.largo / 2;

        // Degradado a lo largo del rayo: transparente -> visible -> transparente
        const grad = ctxR.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${r.color}, 0)`);
        grad.addColorStop(0.5, `rgba(${r.color}, 0.12)`);
        grad.addColorStop(1, `rgba(${r.color}, 0)`);

        ctxR.strokeStyle = grad;
        ctxR.lineWidth = r.grosor;
        ctxR.beginPath();
        ctxR.moveTo(x1, y1);
        ctxR.lineTo(x2, y2);
        ctxR.stroke();
    });

    ctxR.globalCompositeOperation = 'source-over';
    requestAnimationFrame(dibujarRayos);
}

dibujarRayos();