# Sudoku Master

A feature-rich, web-based Sudoku game with a powerful PDF generation feature, built with vanilla JavaScript and a Python backend.

## Features

- **Multiple Difficulty Levels**: Choose from Easy, Medium, Hard, and Expert.
- **Interactive Gameplay**: Smooth and intuitive interface for playing Sudoku.
- **Note-Taking**: In-game capability to jot down notes in cells.
- **Hint System**: Get hints when you're stuck (3 per game).
- **Undo/Redo**: Easily undo and redo your moves.
- **Timer**: Keep track of your solving time.
- **Cross-Platform**: Full support for both keyboard and mouse/touch inputs.
- **Custom Puzzle Creation**: Create and play your own Sudoku puzzles.
- **PDF Generation**: Generate a detailed, step-by-step PDF of your solution, including strategies used and move-by-move analysis powered by Google's Gemini AI.
- **Responsive Design**: Play on any device, with a fully responsive layout.

## Project Structure

```
.
├── backend
│   ├── app
│   │   ├── core
│   │   ├── routers
│   │   └── main.py
│   ├── requirements.txt
│   └── ...
└── frontend
    ├── css
    │   └── styles.css
    ├── js
    │   ├── app.js
    │   ├── document-generator.js
    │   ├── sudoku-ui.js
    │   └── sudoku.js
    └── index.html
```

## Local Development

To run the game and backend server locally:

1.  **Backend Setup**:
    - Navigate to the `backend` directory: `cd backend`
    - Install dependencies: `pip install -r requirements.txt`
    - Run the server: `python run.py`
    - The backend will be available at `http://localhost:8000`.

2.  **Frontend Setup**:
    - Open the `frontend/index.html` file directly in your browser or use a simple static file server.

## Deployment

This project is ready for deployment on platforms like Vercel, Netlify, or Heroku.

1.  **Backend**: Deploy the `backend` directory as a Python web service.
2.  **Frontend**: Deploy the `frontend` directory as a static site.
3.  Ensure the frontend's API requests in `sudoku.js` and `document-generator.js` point to your deployed backend URL.

## License

This project is licensed under the MIT License. 