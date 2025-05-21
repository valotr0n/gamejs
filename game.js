const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const SHAPES = {
    I: { shape: [[1, 1, 1, 1]], color: 'I' },
    O: { shape: [[1, 1], [1, 1]], color: 'O' },
    T: { shape: [[1, 1, 1], [0, 1, 0]], color: 'T' },
    L: { shape: [[1, 1, 1], [1, 0, 0]], color: 'L' },
    J: { shape: [[1, 1, 1], [0, 0, 1]], color: 'J' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'Z' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'S' }
};

let board = [];             
let currentPiece = null;   
let currentPieceColor = null; 
let currentPosition = {x: 0, y: 0};
let score = 0;            
let isGameOver = false;     
let isGameStarted = false; 

const gameBoard = document.getElementById('gameBoard');
const scoreElement = document.getElementById('score');
const newGameButton = document.getElementById('newGame');
const highScoresButton = document.getElementById('highScores');
const highScoresModal = document.getElementById('highScoresModal');
const closeModalButton = document.getElementById('closeModal');

function createBoard() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    gameBoard.innerHTML = '';
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            gameBoard.appendChild(cell);
        }
    }
}

function createPiece() {
    const types = Object.keys(SHAPES);
    const type = types[Math.floor(Math.random() * types.length)];
    currentPiece = SHAPES[type].shape;
    currentPieceColor = SHAPES[type].color;
    currentPosition = {
        x: Math.floor((BOARD_WIDTH - currentPiece[0].length) / 2),
        y: 0
    };
}

function canMove(piece, pos) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                const boardX = pos.x + x;
                const boardY = pos.y + y;
                if (boardX < 0 || boardX >= BOARD_WIDTH || 
                    boardY >= BOARD_HEIGHT ||
                    (boardY >= 0 && board[boardY][boardX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function draw() {
    const cells = gameBoard.getElementsByClassName('cell');
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const index = y * BOARD_WIDTH + x;
            cells[index].className = 'cell';
            if (board[y][x]) {
                cells[index].classList.add('filled', board[y][x].color);
            }
        }
    }
    
    if (currentPiece) {
        for (let y = 0; y < currentPiece.length; y++) {
            for (let x = 0; x < currentPiece[y].length; x++) {
                if (currentPiece[y][x]) {
                    const boardY = currentPosition.y + y;
                    if (boardY >= 0) {
                        const index = boardY * BOARD_WIDTH + currentPosition.x + x;
                        cells[index].classList.add('filled', currentPieceColor);
                    }
                }
            }
        }
    }
}

function moveDown() {
    currentPosition.y++;
    if (!canMove(currentPiece, currentPosition)) {
        currentPosition.y--;
        placePiece();
        return false;
    }
    draw();
    return true;
}

function placePiece() {
    for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
            if (currentPiece[y][x]) {
                const boardY = currentPosition.y + y;
                const boardX = currentPosition.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = { color: currentPieceColor };
                }
            }
        }
    }
    checkLines();
    createPiece();
    if (!canMove(currentPiece, currentPosition)) {
        gameOver();
    }
}

function checkLines() {
    let lines = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            lines++;
            y++;
        }
    }
    if (lines > 0) {
        score += lines * 100;
        scoreElement.textContent = score;
    }
}

function moveLeft() {
    currentPosition.x--;
    if (!canMove(currentPiece, currentPosition)) {
        currentPosition.x++;
    }
    draw();
}

function moveRight() {
    currentPosition.x++;
    if (!canMove(currentPiece, currentPosition)) {
        currentPosition.x--;
    }
    draw();
}

function rotate() {
    const rotated = currentPiece[0].map((_, i) =>
        currentPiece.map(row => row[i]).reverse()
    );
    const oldPiece = currentPiece;
    currentPiece = rotated;
    if (!canMove(currentPiece, currentPosition)) {
        currentPiece = oldPiece;
    }
    draw();
}

function getHighScores() {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('tetrisHighScores='));
    if (!cookie) return [];
    try {
        return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch {
        return [];
    }
}

function saveHighScore(name, score) {
    const scores = getHighScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); 
    
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `tetrisHighScores=${encodeURIComponent(JSON.stringify(scores))}; expires=${date.toUTCString()}; path=/`;
}

function showHighScores() {
    const scores = getHighScores();
    const scoresList = document.getElementById('highScoresList');
    if (scores.length === 0) {
        scoresList.innerHTML = '<div>Пока нет рекордов</div>';
    } else {
        scoresList.innerHTML = scores.map((score, index) => 
            `<div>${index + 1}. ${score.name}: ${score.score}</div>`
        ).join('');
    }
    highScoresModal.style.display = 'block';
}


function gameOver() {
    isGameOver = true;
    alert(`Игра окончена! Ваш счет: ${score}`);
    
    const scores = getHighScores();
    if (scores.length < 10 || score > scores[scores.length - 1].score) {
        const name = prompt('Новый рекорд! Введите ваше имя:') || 'Игрок';
        saveHighScore(name, score);
        showHighScores();
    }
}

function startGame() {
    isGameStarted = true;
    isGameOver = false;
    score = 0;
    scoreElement.textContent = score;
    createBoard();
    createPiece();
    draw();
    setInterval(() => {
        if (!isGameOver) moveDown();
    }, 1000);
}

document.addEventListener('keydown', (e) => {
    if (!isGameStarted || isGameOver) return;
    
    switch(e.key) {
        case 'ArrowLeft': moveLeft(); break;
        case 'ArrowRight': moveRight(); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
    }
});

newGameButton.addEventListener('click', startGame);
highScoresButton.addEventListener('click', showHighScores);
closeModalButton.addEventListener('click', () => {
    highScoresModal.style.display = 'none';
});

function initTestHighScores() {
    const testScores = [
        { name: 'Алексей', score: 2500 },
        { name: 'Мария', score: 2100 },
        { name: 'Дмитрий', score: 1900 },
        { name: 'Анна', score: 1700 },
        { name: 'Иван', score: 1500 },
        { name: 'Елена', score: 1300 },
        { name: 'Сергей', score: 1100 },
        { name: 'Ольга', score: 900 },
        { name: 'Николай', score: 700 },
        { name: 'Татьяна', score: 500 }
    ];
    
    if (getHighScores().length === 0) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        document.cookie = `tetrisHighScores=${encodeURIComponent(JSON.stringify(testScores))}; expires=${date.toUTCString()}; path=/`;
    }
}

createBoard();
initTestHighScores(); 