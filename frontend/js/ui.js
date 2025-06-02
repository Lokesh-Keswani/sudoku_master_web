class SudokuUI {
    constructor(game) {
        this.game = game;
        this.gridElement = document.getElementById('sudoku-grid');
        this.timeElement = document.getElementById('time');
        this.messageElement = document.getElementById('message');

        this.setupEventListeners();
        this.setupTimerUpdate();
        this.render();
    }

    setupEventListeners() {
        // Game control buttons
        this.setupNewGameButton();
        this.setupHintButton();
        this.setupCheckSolutionButton();
        this.setupNotesButton();
        this.setupEraseButton();
        this.setupUndoRedoButtons();
        this.setupNumberPad();
    }

    setupNewGameButton() {
        document.getElementById('new-game').addEventListener('click', () => {
            const difficulty = document.getElementById('difficulty').value;
            this.game.newGame(difficulty).then(() => {
                this.render();
                this.showMessage(`New ${difficulty} game started!`);
            });
        });
    }

    setupHintButton() {
        document.getElementById('hint').addEventListener('click', async () => {
            if (this.game.hintsRemaining > 0) {
                const hint = await this.game.getHint();
                if (hint) {
                    this.render();
                    this.showMessage(`Hints remaining: ${this.game.hintsRemaining}`);
                }
            } else {
                this.showMessage('No hints remaining!');
            }
        });
    }

    setupCheckSolutionButton() {
        document.getElementById('check').addEventListener('click', async () => {
            const result = await this.game.checkSolution();
            if (result.solved) {
                this.showMessage('Congratulations! Puzzle solved!');
            } else if (result.showedSolution) {
                this.showMessage('Here is the correct solution!');
                this.render();
            } else {
                this.showMessage('Not quite right yet. Click check again to see solution.');
            }
        });
    }

    setupNotesButton() {
        const notesButton = document.getElementById('notes-mode');
        notesButton.addEventListener('click', (e) => {
            this.game.isNotesMode = !this.game.isNotesMode;
            e.target.classList.toggle('active');
            this.showMessage(this.game.isNotesMode ? 'Notes mode ON' : 'Notes mode OFF');
        });
    }

    setupEraseButton() {
        document.getElementById('erase').addEventListener('click', () => {
            if (this.game.selectedCell) {
                if (this.game.erase()) {
                    this.render();
                } else {
                    this.showMessage('Cannot erase this cell!');
                }
            } else {
                this.showMessage('Please select a cell first!');
            }
        });
    }

    setupUndoRedoButtons() {
        document.getElementById('undo').addEventListener('click', () => {
            if (this.game.undo()) {
                this.render();
            }
        });

        document.getElementById('redo').addEventListener('click', () => {
            if (this.game.redo()) {
                this.render();
            }
        });
    }

    setupNumberPad() {
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => {
                const value = parseInt(button.dataset.number);
                if (this.game.selectedCell) {
                    this.game.makeMove(value).then(valid => {
                        if (valid) {
                            this.render();
                        } else {
                            this.showMessage('Invalid move!');
                        }
                    });
                }
            });
        });
    }

    setupTimerUpdate() {
        setInterval(() => {
            this.timeElement.textContent = this.game.getFormattedTime();
        }, 1000);
    }

    render() {
        this.gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.createCell(row, col);
                this.gridElement.appendChild(cell);
            }
        }

        this.updateHintButton();
    }

    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'cell';

        this.applyCellBorders(cell, row, col);
        this.populateCellContent(cell, row, col);
        this.setupCellClickHandler(cell, row, col);

        return cell;
    }

    applyCellBorders(cell, row, col) {
        if (row % 3 === 0) cell.style.borderTop = '2px solid var(--grid-line-color)';
        if (col % 3 === 0) cell.style.borderLeft = '2px solid var(--grid-line-color)';
    }

    populateCellContent(cell, row, col) {
        const cellData = this.game.grid[row][col];

        if (cellData) {
            if (cellData.isFixed) {
                cell.classList.add('fixed');
            }
            if (cellData.value !== 0) {
                cell.textContent = cellData.value;
            }

            if (cellData.notes && cellData.notes.size > 0) {
                const notesElement = this.createNotesElement(cellData.notes);
                cell.appendChild(notesElement);
            }
        }
    }

    createNotesElement(notes) {
        const notesElement = document.createElement('div');
        notesElement.className = 'notes';

        for (let i = 1; i <= 9; i++) {
            const noteCell = document.createElement('div');
            noteCell.textContent = notes.has(i) ? i : '';
            notesElement.appendChild(noteCell);
        }

        return notesElement;
    }

    setupCellClickHandler(cell, row, col) {
        cell.addEventListener('click', () => {
            this.clearSelection();
            this.game.selectCell(row, col);
            cell.classList.add('selected');
            this.highlightRelatedCells(row, col);
        });
    }

    clearSelection() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });
    }

    highlightRelatedCells(row, col) {
        const cells = document.querySelectorAll('.cell');
        const boxStartRow = Math.floor(row / 3) * 3;
        const boxStartCol = Math.floor(col / 3) * 3;

        // Highlight same row and column
        for (let i = 0; i < 9; i++) {
            cells[row * 9 + i].classList.add('highlighted');
            cells[i * 9 + col].classList.add('highlighted');
        }

        // Highlight same 3x3 box
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cells[(boxStartRow + i) * 9 + (boxStartCol + j)].classList.add('highlighted');
            }
        }
    }

    updateHintButton() {
        const hintButton = document.getElementById('hint');
        if (hintButton) {
            hintButton.textContent = `Hint (${this.game.hintsRemaining})`;
        }
    }

    showMessage(text, duration = 3000) {
        this.messageElement.textContent = text;
        this.messageElement.classList.add('show');
        setTimeout(() => {
            this.messageElement.classList.remove('show');
        }, duration);
    }
}