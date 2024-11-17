let initialBoard = [];
let solutionBoard = [];
let counts = Array(10).fill(9);
let mistakeCount = 0;
let timerInterval;
let secondsElapsed = 0;
let timerPaused = false;

function generateCompleteBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(board);
    return board;
}

function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of numbers) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createPuzzle(board, clues = 30) {
    const puzzle = board.map(row => row.slice());
    let cellsToRemove = 81 - clues;
    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            cellsToRemove--;
        }
    }
    return puzzle;
}

function initializeCounter(board) {
    counts = Array(10).fill(9);
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const value = board[i][j];
            if (value >= 1 && value <= 9) {
                counts[value]--;
            }
        }
    }
}

function initializeGame() {
    solutionBoard = generateCompleteBoard();
    initialBoard = createPuzzle(solutionBoard, 30);
    initializeCounter(initialBoard);
    displaySudoku(initialBoard);
    updateCounter();
    updateMistakeCounter();
    resetTimer();
    startTimer();
}

function displaySudoku(matrix) {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('td');
            const value = matrix[i][j];
            if (value !== 0) {
                cell.textContent = value;
                cell.classList.add('filled');
                cell.dataset.value = value;
                addHoverEvents(cell, value);
            } else {
                const input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('maxlength', '1');

                input.addEventListener('focus', () => {
                    if (timerPaused) {
                        timerPaused = false;
                        startTimer();
                    }
                });
                input.addEventListener('input', function () {
                    if (mistakeCount >= 3) return;

                    const enteredValue = parseInt(input.value);
                    input.classList.remove('correct', 'incorrect');
                    if (enteredValue >= 1 && enteredValue <= 9) {
                        if (enteredValue === solutionBoard[i][j]) {
                            input.disabled = true;
                            cell.textContent = enteredValue;
                            matrix[i][j] = enteredValue;
                            cell.classList.add('player-entered');
                            cell.dataset.value = enteredValue;
                            addHoverEvents(cell, enteredValue);
                        } else {
                            input.classList.add('incorrect');
                            mistakeCount++;
                            updateMistakeCounter();
                            checkMistakes();
                        }
                    } else {
                        matrix[i][j] = 0;
                        input.value = '';
                    }
                });
                cell.appendChild(input);
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}


function addHoverEvents(cell, value) {
    cell.addEventListener('mouseenter', () => highlightSameNumbers(value));
    cell.addEventListener('mouseleave', clearHighlights);
}

function highlightSameNumbers(number) {
    clearHighlights();
    if (!number) return;
    const cells = document.querySelectorAll('#sudoku-grid td');
    cells.forEach(cell => {
        if (cell.dataset.value == number) {
            cell.classList.add('highlight');
        }
    });
}

function clearHighlights() {
    const highlightedCells = document.querySelectorAll('#sudoku-grid .highlight');
    highlightedCells.forEach(cell => cell.classList.remove('highlight'));
}

function updateCounter() {
    const counterDivs = document.querySelectorAll('#missing-counter .counter-card .count');
    for (let i = 0; i < counterDivs.length; i++) {
        counterDivs[i].textContent = counts[i + 1];
    }
}

function updateMistakeCounter() {
    const mistakeCountDiv = document.getElementById('mistakes-counter');
    mistakeCountDiv.textContent = `${mistakeCount}/3`;
}

function checkMistakes() {
    if (mistakeCount >= 3) {
        showLossPopup();
    }
}

function disableGame() {
    const inputs = document.querySelectorAll('#sudoku-grid input');
    inputs.forEach(input => input.disabled = true);
}

function showLossPopup() {
    alert("Game over! You've made 3 mistakes.");
    disableGame();
    stopTimer();
}

function isBoardComplete(matrix) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (matrix[i][j] !== solutionBoard[i][j]) return false;
        }
    }
    return true;
}

function showWinPopup() {
    alert("Congratulations! You've completed the Sudoku puzzle!");
    stopTimer();
}

function startNewGame() {
    mistakeCount = 0;
    counts = Array(10).fill(9);
    updateMistakeCounter();
    updateCounter();
    initializeGame();
}

function startTimer() {
    if (timerPaused) return;
    timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const seconds = String(secondsElapsed % 60).padStart(2, '0');
        document.getElementById('timer').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    secondsElapsed = 0;
    timerPaused = false;
    document.getElementById('timer').textContent = "00:00";
}

document.getElementById('timer').addEventListener('click', () => {
    if (timerPaused) {
        timerPaused = false;
        startTimer();
    } else {
        timerPaused = true;
        stopTimer();
        document.getElementById('timer').textContent = "Paused";
    }
});

initializeGame();
