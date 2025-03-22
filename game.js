// Tic Tac Toe Game Logic

// DOM Elements
const cells = document.querySelectorAll('.cell');
const playerTurn = document.getElementById('player-turn');
const gameStatus = document.getElementById('game-status');
const restartButton = document.getElementById('restart-button');
const xScoreDisplay = document.getElementById('x-score');
const oScoreDisplay = document.getElementById('o-score');
const twoPlayerBtn = document.getElementById('two-player-btn');
const computerBtn = document.getElementById('computer-btn');
const difficultySelect = document.getElementById('difficulty-select');
const computerDifficultyDiv = document.querySelector('.computer-difficulty');
const playerOLabel = document.getElementById('player-o-label');

// Game variables
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = {
    X: 0,
    O: 0,
    Computer: 0
};
let isComputerMode = false;
let computerDifficulty = 'easy';
let isComputerThinking = false;

// Winning combinations
const winningCombinations = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
];

// Initialize the game
function initGame() {
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', restartGame);
    twoPlayerBtn.addEventListener('click', setTwoPlayerMode);
    computerBtn.addEventListener('click', setComputerMode);
    difficultySelect.addEventListener('change', changeDifficulty);
    updateScoreDisplay();
}

// Set two player mode
function setTwoPlayerMode() {
    if (isComputerMode) {
        isComputerMode = false;
        twoPlayerBtn.classList.add('active');
        computerBtn.classList.remove('active');
        computerDifficultyDiv.style.display = 'none';
        playerOLabel.textContent = 'Player O: ';
        restartGame();
    }
}

// Set computer mode
function setComputerMode() {
    if (!isComputerMode) {
        isComputerMode = true;
        computerBtn.classList.add('active');
        twoPlayerBtn.classList.remove('active');
        computerDifficultyDiv.style.display = 'block';
        playerOLabel.textContent = 'Computer: ';
        restartGame();
    }
}

// Change difficulty
function changeDifficulty() {
    computerDifficulty = difficultySelect.value;
    if (isComputerMode) {
        restartGame();
    }
}

// Handle cell click
function handleCellClick(event) {
    // Prevent clicks if the computer is "thinking"
    if (isComputerThinking) return;
    
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    // Check if cell is already filled or game is not active
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }
    
    // If it's computer's turn, don't allow player to click
    if (isComputerMode && currentPlayer === 'O') {
        return;
    }
    
    makeMove(cellIndex);
    
    // If game is active and it's computer's turn, make computer move
    if (gameActive && isComputerMode && currentPlayer === 'O') {
        makeComputerMove();
    }
}

// Make a move
function makeMove(cellIndex) {
    // Update game board
    gameBoard[cellIndex] = currentPlayer;
    
    // Update UI
    cells[cellIndex].textContent = currentPlayer;
    cells[cellIndex].classList.add(currentPlayer.toLowerCase());
    
    // Check for win or draw
    if (checkWin()) {
        endGame(false);
    } else if (checkDraw()) {
        endGame(true);
    } else {
        // Switch players
        switchPlayer();
    }
}

// Computer move
function makeComputerMove() {
    if (!gameActive) return;
    
    // Simulate "thinking" time with a slight delay
    isComputerThinking = true;
    playerTurn.textContent = "Computer is thinking...";
    
    setTimeout(() => {
        let cellIndex;
        
        switch (computerDifficulty) {
            case 'easy':
                cellIndex = makeEasyMove();
                break;
            case 'medium':
                cellIndex = makeMediumMove();
                break;
            case 'hard':
                cellIndex = makeHardMove();
                break;
            default:
                cellIndex = makeEasyMove();
        }
        
        makeMove(cellIndex);
        isComputerThinking = false;
    }, 700); // 700ms delay to simulate thinking
}

// Easy difficulty - random moves
function makeEasyMove() {
    const emptyCells = gameBoard.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);
    
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Medium difficulty - mix of random and strategic moves
function makeMediumMove() {
    // 50% chance to make a strategic move
    if (Math.random() > 0.5) {
        return makeHardMove();
    } else {
        return makeEasyMove();
    }
}

// Hard difficulty - strategic moves
function makeHardMove() {
    // Try to win
    const winningMove = findWinningMove('O');
    if (winningMove !== -1) return winningMove;
    
    // Block opponent from winning
    const blockingMove = findWinningMove('X');
    if (blockingMove !== -1) return blockingMove;
    
    // Take center if available
    if (gameBoard[4] === '') return 4;
    
    // Take corners if available
    const corners = [0, 2, 6, 8].filter(index => gameBoard[index] === '');
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }
    
    // Take any available edge
    const edges = [1, 3, 5, 7].filter(index => gameBoard[index] === '');
    if (edges.length > 0) {
        return edges[Math.floor(Math.random() * edges.length)];
    }
    
    // Fallback to any random empty cell
    return makeEasyMove();
}

// Find a winning move for the given player
function findWinningMove(player) {
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            // Try this move
            gameBoard[i] = player;
            
            // Check if this move would win
            const wouldWin = winningCombinations.some(combo => {
                const [a, b, c] = combo;
                return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
            });
            
            // Undo the move
            gameBoard[i] = '';
            
            if (wouldWin) {
                return i;
            }
        }
    }
    
    return -1;
}

// Check for win
function checkWin() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            // Highlight winning cells
            cells[a].classList.add('won');
            cells[b].classList.add('won');
            cells[c].classList.add('won');
            return true;
        }
    }
    
    return false;
}

// Check for draw
function checkDraw() {
    return !gameBoard.includes('');
}

// Switch player
function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    // Update turn display
    if (isComputerMode && currentPlayer === 'O') {
        playerTurn.textContent = "Computer's Turn";
    } else {
        playerTurn.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

// End game
function endGame(isDraw) {
    gameActive = false;
    
    if (isDraw) {
        gameStatus.textContent = "Game ended in a draw!";
    } else {
        if (isComputerMode && currentPlayer === 'O') {
            gameStatus.textContent = "Computer wins!";
            scores.Computer++;
        } else {
            gameStatus.textContent = `Player ${currentPlayer} wins!`;
            scores[currentPlayer]++;
        }
        updateScoreDisplay();
    }
}

// Update score display
function updateScoreDisplay() {
    xScoreDisplay.textContent = scores.X;
    
    if (isComputerMode) {
        oScoreDisplay.textContent = scores.Computer;
    } else {
        oScoreDisplay.textContent = scores.O;
    }
}

// Restart game
function restartGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    isComputerThinking = false;
    
    // Clear the board
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'won');
    });
    
    // Reset status messages
    playerTurn.textContent = `Player X's Turn`;
    gameStatus.textContent = '';
    
    // If computer mode is on and first turn is computer's, make a move
    if (gameActive && isComputerMode && currentPlayer === 'O') {
        makeComputerMove();
    }
}

// Save scores to local storage
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

// Load scores from local storage
function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        const loadedScores = JSON.parse(savedScores);
        scores = {
            X: loadedScores.X || 0,
            O: loadedScores.O || 0,
            Computer: loadedScores.Computer || 0
        };
        updateScoreDisplay();
    }
}

// Event listener for when page is about to be unloaded
window.addEventListener('beforeunload', saveScores);

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadScores();
    initGame();
});