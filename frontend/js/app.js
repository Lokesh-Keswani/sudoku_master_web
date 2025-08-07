// Global variables to store game and UI instances
let game = null;
let ui = null;

// Wait for window to be fully loaded
window.addEventListener('load', () => {
    // Debug: Check if required classes are defined
    console.log('SudokuGame defined:', typeof window.SudokuGame !== 'undefined');
    console.log('SudokuUI defined:', typeof window.SudokuUI !== 'undefined');
    
    if (typeof window.SudokuGame === 'undefined' || typeof window.SudokuUI === 'undefined') {
        console.error('Required classes not found. Make sure all script files are loaded correctly.');
        return;
    }
    
    try {
        // Initialize game and UI
        game = new window.SudokuGame();
        ui = new window.SudokuUI(game);
        
        // Make them globally available for debugging
        window.sudokuGame = game;
        window.sudokuUI = ui;
        
        // Start a new game when the page loads
        game.newGame().then(() => {
            ui.render();
        }).catch(error => {
            console.error('Error starting new game:', error);
        });
    } catch (error) {
        console.error('Error initializing game:', error);
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (game.selectedCell) {
            const key = e.key;
            if (/^[1-9]$/.test(key)) {
                const { row, col } = game.selectedCell;
                // Only allow input if the cell is not fixed
                if (game.grid[row][col].isFixed) {
                    return;
                }
                // Check for invalid move BEFORE calling makeMove
                if (!game.isValidPlacement(game.grid, row, col, parseInt(key))) {
                    // Mark the cell as invalid and trigger a re-render for animation
                    game.lastInvalidCell = { row, col };
                    if (ui && typeof ui.showMessage === 'function') {
                        ui.showMessage('Invalid move! This number conflicts with Sudoku rules.', 2000);
                    }
                    ui.render();
                    return; // Do NOT call makeMove or render
                }
                // Only call makeMove if valid
                game.makeMove(parseInt(key)).then(valid => {
                    if (valid) {
                        ui.render();
                        // Audio explanation for the move
                        const cell = game.selectedCell;
                        const value = parseInt(key);
                        if (cell && value) {
                            const msg = new SpeechSynthesisUtterance(`Placed ${value} at row ${cell.row + 1}, column ${cell.col + 1}`);
                            window.speechSynthesis.speak(msg);
                        }
                        // Check if puzzle is solved after each valid move
                        game.checkSolution().then(result => {
                            if (result.solved) {
                                ui.showMessage('Congratulations! Puzzle solved!');
                                ui.showDownloadButton();
                            }
                        });
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

    // Check Solution button event handler
    const checkButton = document.getElementById('check');
    if (checkButton) {
        checkButton.addEventListener('click', async () => {
            if (!game || !ui) {
                console.error('Game or UI not initialized');
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    messageElement.textContent = 'Game not properly initialized. Please refresh the page.';
                }
                return;
            }

            try {
                checkButton.disabled = true;
                checkButton.textContent = 'Checking...';
                
                const result = await game.checkSolution();
                console.log('Check solution result:', result);
                
                if (result.solved) {
                    ui.showMessage(result.message || 'Puzzle solved correctly!');
                    if (result.solutionPath) {
                        ui.fillBoardWithSolution(result.solutionPath);
                        ui.showSolutionPanel(result.solutionPath);
                    }
                } else if (result.valid) {
                    ui.showMessage(result.message || 'The current board is valid so far.');
                    
                    // If there's a solution path, offer to show it
                    if (result.solutionPath && result.solutionPath.length > 0) {
                        const shouldShowSolution = confirm(`Found ${result.solutionPath.length} steps to complete the puzzle. Would you like to see the solution?`);
                        if (shouldShowSolution) {
                            ui.fillBoardWithSolution(result.solutionPath);
                            ui.showSolutionPanel(result.solutionPath);
                            ui.showMessage('Solution applied!');
                        }
                    }
                    // If there's a single step to show, highlight it
                    else if (result.step) {
                        if (
                            typeof result.step.row === 'number' && result.step.row >= 0 && result.step.row < 9 &&
                            typeof result.step.col === 'number' && result.step.col >= 0 && result.step.col < 9 &&
                            typeof result.step.value === 'number' && result.step.value > 0 && result.step.value <= 9
                        ) {
                            // Place the value in the game grid and update UI
                            game.grid[result.step.row][result.step.col].value = result.step.value;
                            // Record the step for PDF generation
                            game.allSolutionSteps.push({
                                ...result.step,
                                timestamp: Date.now()
                            });
                            ui.render();
                            ui.showStep(result.step);
                        } else {
                            ui.showMessage('No logical step found. Try again or use a hint.');
                        }
                    }
                } else {
                    ui.showMessage(result.message || result.error || 'There is an issue with the current board.');
                    // Show conflicts if they exist
                    if (result.conflicts && result.conflicts.length > 0) {
                        console.log('Conflicts found:', result.conflicts);
                        // Highlight conflicting cells
                        result.conflicts.forEach(conflict => {
                            if (conflict.row !== undefined && conflict.col !== undefined) {
                                const cell = document.querySelector(`[data-row="${conflict.row}"][data-col="${conflict.col}"]`);
                                if (cell) {
                                    cell.style.backgroundColor = '#ffcccc';
                                    setTimeout(() => {
                                        cell.style.backgroundColor = '';
                                    }, 3000);
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking solution:', error);
                const messageElement = document.getElementById('message');
                if (messageElement) {
                    messageElement.textContent = 'Error checking solution: ' + (error.message || 'Unknown error');
                }
            } finally {
                if (checkButton) {
                    checkButton.disabled = false;
                    checkButton.textContent = 'Check Solution';
                }
            }
        });
    } else {
        console.error('Check solution button not found');
    }

    // Fill the board with the solution steps using the SudokuGame instance
    function fillBoardWithSolution(solutionPath) {
        if (!game) {
            console.log('Game instance not found');
            return;
        }
        
        if (!solutionPath || !Array.isArray(solutionPath)) {
            console.error('Invalid solution path');
            return;
        }
        
        solutionPath.forEach(step => {
            if (step && typeof step.row === 'number' && typeof step.col === 'number' && typeof step.value === 'number') {
                game.grid[step.row][step.col].value = step.value;
                console.log(`Filled cell [${step.row},${step.col}] with value ${step.value}`);
            }
        });
        
        // Update the UI
        if (ui && typeof ui.render === 'function') {
            console.log('Updating UI with solution');
            ui.render();
        } else {
            console.log('UI update function not found');
        }
    }
});

function setupUniversalSidebar() {
    if (window._sidebarSetup) return;
    window._sidebarSetup = true;
    const sidebar = document.getElementById('auth-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const historyList = document.getElementById('history-list');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('active');
        if (toggleBtn) toggleBtn.classList.add('hide');
    }
    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        if (toggleBtn) toggleBtn.classList.remove('hide');
    }
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', openSidebar);
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', closeSidebar);
    }
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    // Login/signup logic
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Login submitted!');
        });
    }
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pw = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            if (pw !== confirm) {
                alert('Passwords do not match!');
                return;
            }
            alert('Signup submitted!');
        });
    }
    // History logic
    function renderHistory() {
        if (!historyList) return;
        const history = JSON.parse(localStorage.getItem('sudokuHistory') || '[]');
        historyList.innerHTML = '';
        if (history.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No history yet.';
            li.style.color = '#888';
            li.style.padding = '10px';
            historyList.appendChild(li);
            return;
        }
        history.slice().reverse().forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;
            li.style.padding = '8px 12px';
            li.style.borderBottom = '1px solid #e0e0e0';
            historyList.appendChild(li);
        });
    }
    function addHistoryEntry(entry) {
        const history = JSON.parse(localStorage.getItem('sudokuHistory') || '[]');
        history.push(entry);
        localStorage.setItem('sudokuHistory', JSON.stringify(history));
        renderHistory();
    }
    window.addHistoryEntry = addHistoryEntry;
    window.renderHistory = renderHistory;
    renderHistory();
}

window.addEventListener('DOMContentLoaded', setupUniversalSidebar);

// Example: Add to history when new game or check solution is clicked
window.addEventListener('load', () => {
    const newGameBtn = document.getElementById('new-game');
    const checkBtn = document.getElementById('check');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            addHistoryEntry('Started a new game at ' + new Date().toLocaleString());
        });
    }
    if (checkBtn) {
        checkBtn.addEventListener('click', () => {
            addHistoryEntry('Checked solution at ' + new Date().toLocaleString());
        });
    }
});

// --- AUTH & PROFILE LOGIC ---
async function loginUser(email, password) {
    const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
        localStorage.setItem('token', data.access_token);
        showUserUI();
        fetchProfile();
        fetchHistory();
        alert('Login successful!');
    } else {
        alert(data.detail || 'Login failed');
    }
}

async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/user/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
        const data = await res.json();
        renderProfile(data);
    }
}

function renderProfile(data) {
    let profileDiv = document.getElementById('profile-info');
    if (!profileDiv) {
        profileDiv = document.createElement('div');
        profileDiv.id = 'profile-info';
        document.getElementById('auth-forms').appendChild(profileDiv);
    }
    profileDiv.innerHTML = `<h4>Profile</h4><div>Email: ${data.email}</div><div>Joined: ${new Date(data.created_at).toLocaleString()}</div><button id='logout-btn'>Logout</button>`;
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
    document.getElementById('logout-btn').onclick = logoutUser;
}

async function updateProfile(email, password) {
    const token = localStorage.getItem('token');
    const body = {};
    if (email) body.email = email;
    if (password) body.password = password;
    const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        alert('Profile updated!');
        fetchProfile();
    } else {
        const data = await res.json();
        alert(data.detail || 'Update failed');
    }
}

function logoutUser() {
    localStorage.removeItem('token');
    document.getElementById('profile-info').remove();
    document.getElementById('login-form').style.display = '';
    document.getElementById('signup-link').style.display = '';
    renderHistory([]);
}

function showUserUI() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';
}

// --- HISTORY LOGIC ---
async function fetchHistory() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/user/history', {
        headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
        const data = await res.json();
        renderHistory(data.history);
    }
}

function renderHistory(history) {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    if (!history || history.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No history yet.';
        li.style.color = '#888';
        li.style.padding = '10px';
        historyList.appendChild(li);
        return;
    }
    history.slice().reverse().forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `Puzzle: ${entry.puzzle}, Solved: ${entry.solution ? 'Yes' : 'No'}, Time: ${new Date(entry.timestamp).toLocaleString()}`;
        li.style.padding = '8px 12px';
        li.style.borderBottom = '1px solid #e0e0e0';
        historyList.appendChild(li);
    });
}

async function saveHistory(puzzle, solution) {
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch('/api/user/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ puzzle, solution })
    });
    fetchHistory();
}

// --- LOGIN FORM HANDLER ---
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    loginUser(email, password);
});

// --- ON LOAD: CHECK IF LOGGED IN ---
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        showUserUI();
        fetchProfile();
        fetchHistory();
    }
});