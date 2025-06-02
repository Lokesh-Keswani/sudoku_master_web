# Sudoku Master Web

A feature-rich web-based Sudoku game built with Python (FastAPI) backend and vanilla JavaScript frontend.

## Features

- Multiple difficulty levels (Easy, Medium, Hard, Expert)
- Note-taking functionality
- Hint system (3 hints per game)
- Undo/Redo support
- Timer
- Keyboard input support
- Mobile-responsive design
- Real-time move validation
- Conflict detection
- Modern Material Design UI

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   python run.py
   ```

The backend server will start at `http://localhost:8000`

### Frontend Setup

The frontend is built with vanilla JavaScript and doesn't require any build steps. Simply serve the frontend directory using any static file server. For development, you can use Python's built-in HTTP server:

```bash
cd frontend
python -m http.server 3000
```

The frontend will be available at `http://localhost:3000`

## How to Play

1. Open `http://localhost:3000` in your web browser
2. Select a difficulty level from the dropdown menu
3. Click "New Game" to start a new puzzle
4. Click a cell to select it
5. Enter numbers using the number pad or keyboard (1-9)
6. Use the "Notes" mode to take notes in cells
7. Use "Hint" when stuck (3 hints available per game)
8. Click "Check" to verify your solution

## Development

### Project Structure

```
sudoku_master_web/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── sudoku.py
│   │   ├── routers/
│   │   │   └── sudoku.py
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
└── frontend/
    ├── index.html
    ├── styles.css
    └── js/
        ├── sudoku.js
        ├── ui.js
        └── app.js
```

## License

MIT License 