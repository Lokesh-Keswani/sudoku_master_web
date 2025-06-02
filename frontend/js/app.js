document.addEventListener('DOMContentLoaded', () => {
    const game = new SudokuGame();
    const ui = new SudokuUI(game);
    
    // Start a new game when the page loads
    game.newGame().then(() => {
        ui.render();
    });

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (game.selectedCell) {
            const key = e.key;
            if (/^[1-9]$/.test(key)) {
                game.makeMove(parseInt(key)).then(valid => {
                    if (valid) {
                        ui.render();
                    }
                });
            } else if (key === 'Backspace' || key === 'Delete') {
                if (game.isValidMove(game.selectedCell.row, game.selectedCell.col)) {
                    game.makeMove(0).then(() => ui.render());
                }
            }
        }
    });

    // Handle window focus events
    window.addEventListener('focus', () => {
        game.resumeTimer();
    });

    window.addEventListener('blur', () => {
        game.pauseTimer();
    });
}); 