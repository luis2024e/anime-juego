document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a los elementos del DOM
    const gameBoard = document.getElementById('game-board');
    const movesCountSpan = document.getElementById('moves-count');
    const timerSpan = document.getElementById('timer');
    const restartButton = document.getElementById('restart-button');
    const modalOverlay = document.getElementById('win-modal-overlay');
    const winStatsText = document.getElementById('win-stats-text');
    const modalRestartButton = document.getElementById('modal-restart-button');

    // Variables del estado del juego
    const emojis = ['🎃', '👻', '💀', '👽', '🤖', '👾', '🧛', '🧙'];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timerInterval;
    let seconds = 0;
    let lockBoard = false;
    let gameStarted = false;

    // Función para barajar un array (algoritmo Fisher-Yates)
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Función para iniciar o reiniciar el juego
    function startGame() {
        modalOverlay.classList.add('hidden'); // Ocultar modal si estuviera visible
        lockBoard = false;
        gameStarted = false;
        moves = 0;
        matchedPairs = 0;
        seconds = 0;
        movesCountSpan.textContent = 0;
        timerSpan.textContent = '0s';
        clearInterval(timerInterval);
        
        const cardValues = shuffle([...emojis, ...emojis]);
        
        gameBoard.innerHTML = ''; // Limpiar el tablero
        
        // Crear y añadir cada carta al tablero
        cardValues.forEach(value => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = value;
            card.innerHTML = `
                <div class="card-face card-face--front">?</div>
                <div class="card-face card-face--back">${value}</div>
            `;
            gameBoard.appendChild(card);
            card.addEventListener('click', flipCard);
        });
    }

    // Función para iniciar el cronómetro
    function startTimer() {
        gameStarted = true;
        timerInterval = setInterval(() => {
            seconds++;
            timerSpan.textContent = `${seconds}s`;
        }, 1000);
    }

    // Función que se ejecuta al hacer clic en una carta
    function flipCard() {
        if (lockBoard) return; // No hacer nada si el tablero está bloqueado
        if (this === flippedCards[0]) return; // No permitir hacer clic en la misma carta dos veces
        
        if (!gameStarted) {
            startTimer();
        }

        this.classList.add('is-flipped');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            incrementMoves();
            checkForMatch();
        }
    }

    // Incrementar el contador de movimientos
    function incrementMoves() {
        moves++;
        movesCountSpan.textContent = moves;
    }

    // Comprobar si las dos cartas volteadas son iguales
    function checkForMatch() {
        lockBoard = true;
        const [cardOne, cardTwo] = flippedCards;
        const isMatch = cardOne.dataset.value === cardTwo.dataset.value;
        
        isMatch ? disableCards() : unflipCards();
    }

    // Si son pareja, deshabilitarlas
    function disableCards() {
        const [cardOne, cardTwo] = flippedCards;
        cardOne.removeEventListener('click', flipCard);
        cardTwo.removeEventListener('click', flipCard);
        cardOne.classList.add('is-matched');
        cardTwo.classList.add('is-matched');
        
        matchedPairs++;
        resetBoard();

        // Comprobar si se ha ganado el juego
        if (matchedPairs === emojis.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                winStatsText.textContent = `Completaste el juego en ${moves} movimientos y ${seconds} segundos.`;
                modalOverlay.classList.remove('hidden');
            }, 800);
        }
    }

    // Si no son pareja, voltearlas de nuevo
    function unflipCards() {
        setTimeout(() => {
            const [cardOne, cardTwo] = flippedCards;
            cardOne.classList.remove('is-flipped');
            cardTwo.classList.remove('is-flipped');
            resetBoard();
        }, 1200);
    }

    // Limpiar el array de cartas volteadas y desbloquear el tablero
    function resetBoard() {
        [flippedCards, lockBoard] = [[], false];
    }

    // Añadir eventos a los botones de reinicio
    modalRestartButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    // Iniciar el juego por primera vez al cargar la página
    startGame();
});