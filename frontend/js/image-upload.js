class SudokuImageUploader {
    constructor(game) {
        this.game = game;
        this.setupUploadUI();
    }

    setupUploadUI() {
        // Get modal elements
        const modal = document.getElementById('create-puzzle-modal');
        const createButton = document.getElementById('create-puzzle');
        const uploadButton = document.getElementById('upload-sudoku');
        const uploadInput = document.getElementById('sudoku-image');
        const manualButton = document.getElementById('manual-create');
        const startGameButton = document.getElementById('start-game');

        // Show modal when clicking Create Puzzle
        createButton.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
        });

        // Handle manual creation
        manualButton.addEventListener('click', () => {
            // Hide modal
            modal.style.display = 'none';
            
            // Start puzzle creation mode
            this.game.startPuzzleCreation();
            
            // Update UI
            createButton.style.display = 'none';
            startGameButton.style.display = 'block';
            
            // Show guidance message
            this.showMessage('Enter numbers manually. Click Start Game when ready.');
        });

        // Handle image upload
        uploadButton.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Handle Start Game button
        startGameButton.addEventListener('click', () => {
            if (this.game.validateCustomPuzzle()) {
                if (this.game.finalizeCustomPuzzle()) {
                    startGameButton.style.display = 'none';
                    createButton.style.display = 'block';
                    this.showMessage('Custom puzzle started! Good luck!');
                } else {
                    this.showMessage('Error: Failed to create puzzle. Please try again.');
                }
            } else {
                this.showMessage('Invalid puzzle! Need at least 17 numbers and a unique solution.');
            }
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Show loading spinner
        const spinner = document.querySelector('.loading-spinner');
        spinner.style.display = 'block';

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Send to backend
            const response = await fetch('http://localhost:8000/api/sudoku/process-sudoku-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to process image');
            }

            const data = await response.json();

            // Hide the modal
            document.getElementById('create-puzzle-modal').style.display = 'none';

            // Start puzzle creation with the detected grid
            this.game.startPuzzleCreation();
            
            // Fill in the detected numbers
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    const value = data.grid[row][col];
                    if (value !== 0) {
                        this.game.setCreationCell(row, col, value);
                    }
                }
            }

            // Update the UI
            document.getElementById('start-game').style.display = 'block';
            document.getElementById('create-puzzle').style.display = 'none';
            
            // Show success message
            this.showMessage('Sudoku puzzle detected! Review the numbers and click Start Game when ready.');

        } catch (error) {
            console.error('Error processing image:', error);
            this.showMessage(error.message || 'Failed to process image. Please try again with a clearer photo.');
        } finally {
            // Hide loading spinner
            spinner.style.display = 'none';
            // Reset file input
            event.target.value = '';
        }
    }

    showMessage(text, duration = 3000) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.classList.add('show');
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, duration);
    }
} 