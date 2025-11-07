// --- DATOS Y CONFIGURACIÓN DEL JUEGO ---
const EMOJIS_ANIMALES = [
    '🐱', '🐶', '🦁', '🐵', '🦒', '🦓', 
    '🦆', '🐘', '🐠', '🐸', '🐧', '🐻',
    '🦊', '🐼', '🐨', '🐰', '🐸', '🦉'
];

// Define la dificultad para los 10 niveles: (pares, columnas)
const NIVELES_CONFIG = [
    { pares: 4, columnas: 4 },
    { pares: 5, columnas: 4 },
    { pares: 6, columnas: 4 },
    { pares: 7, columnas: 5 },
    { pares: 8, columnas: 4 },
    { pares: 9, columnas: 6 },
    { pares: 10, columnas: 5 },
    { pares: 11, columnas: 6 },
    { pares: 12, columnas: 6 },
    { pares: 13, columnas: 6 },
];


// --- VARIABLES DEL JUEGO ---
let tablero = document.getElementById('tablero-juego');
let cartasVolteadas = [];
let bloqueado = false; 
let nivelActual = 1;

// Variables para 2 Jugadores
let jugadorActual = 1;
let puntuacionJugador1 = 0;
let puntuacionJugador2 = 0;
let paresRestantes = 0;

// Elementos del DOM
const elFalloX = document.getElementById('fallo-x');
const elTurno = document.getElementById('mensaje-turno');
const elMarcadorP1 = document.getElementById('marcador-p1');
const elMarcadorP2 = document.getElementById('marcador-p2');
const elNivelInfo = document.getElementById('nivel-info');


// --- LÓGICA DE NIVELES Y TURNO ---

function iniciarNivel(nivel) {
    if (nivel > 10) {
        alert(`¡Juego Completo! El ganador es: ${puntuacionJugador1 > puntuacionJugador2 ? 'Jugador 1' : puntuacionJugador2 > puntuacionJugador1 ? 'Jugador 2' : '¡Empate!'}`);
        return;
    }

    // 1. Obtener config. del nivel
    const config = NIVELES_CONFIG[nivel - 1];
    const totalPares = config.pares;
    const numColumnas = config.columnas;
    paresRestantes = totalPares;

    // 2. Limpiar tablero y actualizar UI
    tablero.innerHTML = '';
    cartasVolteadas = [];
    bloqueado = false;
    
    // Aplicar Tema y Layout
    document.body.className = `nivel-${nivel}`;
    tablero.style.gridTemplateColumns = `repeat(${numColumnas}, 1fr)`;

    elNivelInfo.innerHTML = `Nivel: ${nivel}/10 | Pares: <span id="total-pares">${totalPares}</span>`;

    // 3. Generar y mezclar cartas
    let simbolos = EMOJIS_ANIMALES.slice(0, totalPares);
    let cartas = [...simbolos, ...simbolos];
    cartas = mezclarArreglo(cartas);

    // 4. Dibujar cartas en el HTML
    cartas.forEach((simbolo, indice) => {
        const cartaHTML = crearCarta(simbolo, indice);
        tablero.appendChild(cartaHTML);
    });

    actualizarTurnoUI(true);
}

function crearCarta(simbolo, indice) {
    const cartaDiv = document.createElement('div');
    cartaDiv.classList.add('carta');
    cartaDiv.dataset.simbolo = simbolo;
    cartaDiv.dataset.id = indice;
    cartaDiv.addEventListener('click', manejarClickCarta);

    cartaDiv.innerHTML = `
        <div class="contenido-carta">
            <div class="cara">${simbolo}</div>
            <div class="reverso">?</div>
        </div>
    `;
    return cartaDiv;
}

function mezclarArreglo(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function actualizarTurnoUI(mantenerTurno = false) {
    // Si no acierta, cambia de jugador
    if (!mantenerTurno) {
        jugadorActual = (jugadorActual === 1) ? 2 : 1;
    }
    
    elTurno.textContent = `Turno: Jugador ${jugadorActual}`;

    // Actualiza los estilos de los marcadores
    elMarcadorP1.classList.toggle('activo', jugadorActual === 1);
    elMarcadorP2.classList.toggle('activo', jugadorActual === 2);
}

// --- LÓGICA PRINCIPAL DEL JUEGO ---

function manejarClickCarta(evento) {
    const carta = evento.currentTarget;
    
    // Guardias:
    if (bloqueado || carta.classList.contains('volteada') || carta.classList.contains('acertada') || cartasVolteadas.length >= 2) {
        return;
    }

    // 1. Voltear
    carta.classList.add('volteada');
    cartasVolteadas.push(carta);

    // 2. Comprobar par
    if (cartasVolteadas.length === 2) {
        bloqueado = true;
        setTimeout(comprobarPar, 1000); 
    }
}

function comprobarPar() {
    const [carta1, carta2] = cartasVolteadas;
    
    if (carta1.dataset.simbolo === carta2.dataset.simbolo) {
        // --- ¡ACIERTO! ---
        
        // Marcar como acertadas
        carta1.classList.add('acertada');
        carta2.classList.add('acertada');
        carta1.classList.remove('volteada');
        carta2.classList.remove('volteada');
        
        // Confeti 🎉
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

        // Actualizar puntaje y mantener turno
        if (jugadorActual === 1) {
            puntuacionJugador1++;
            elMarcadorP1.textContent = `Jugador 1: ${puntuacionJugador1}`;
        } else {
            puntuacionJugador2++;
            elMarcadorP2.textContent = `Jugador 2: ${puntuacionJugador2}`;
        }
        actualizarTurnoUI(true); // Mantiene el turno

        paresRestantes--;
        
        // Comprobar si se ganó el nivel
        if (paresRestantes === 0) {
            setTimeout(ganarNivel, 1500);
        }
        
    } else {
        // --- ¡FALLO! ---
        
        // Mostrar la 'X' de fallo
        mostrarFalloX();
        
        // Volver a girar las cartas
        setTimeout(() => {
            carta1.classList.remove('volteada');
            carta2.classList.remove('volteada');
            actualizarTurnoUI(false); // Cambia el turno
        }, 1200); // Dar más tiempo para ver la 'X'
    }
    
    // Resetear para el siguiente intento
    cartasVolteadas = [];
    // Desbloquear después de un retraso
    setTimeout(() => { bloqueado = false; }, 1200);
}

function mostrarFalloX() {
    elFalloX.style.display = 'block';
    // Reiniciar la animación (necesario para que se repita)
    elFalloX.style.animation = 'none';
    elFalloX.offsetHeight; /* trigger reflow */
    elFalloX.style.animation = 'scaleAndFade 1.2s forwards';

    // Ocultar al final de la animación 
    setTimeout(() => {
        elFalloX.style.display = 'none';
    }, 1200);
}

function ganarNivel() {
    alert(`¡Nivel ${nivelActual} completado! Puntuación J1: ${puntuacionJugador1}, J2: ${puntuacionJugador2}.`);
    nivelActual++;
    iniciarNivel(nivelActual);
}

// --- INICIO DEL JUEGO ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicia el juego en el nivel 1
    iniciarNivel(nivelActual);
});