# Sudoku Master Web

A feature-rich web-based Sudoku game built with vanilla JavaScript.

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

## Live Demo

You can play the game directly at: https://[your-github-username].github.io/sudoku_master_web/

## How to Play

1. Visit the game website
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
├── index.html
├── frontend/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── sudoku.js
│       ├── sudoku-ui.js
│       ├── document-generator.js
│       └── app.js
```

### Local Development

To run the game locally, you can use any static file server. For development, you can use Python's built-in HTTP server:

```bash
python -m http.server 3000
```

Then open `http://localhost:3000` in your web browser.

## Deployment

This project is hosted using GitHub Pages. To deploy your own version:

1. Fork this repository
2. Go to your fork's Settings > Pages
3. Set the source branch to `main` (or `master`)
4. Your site will be published at `https://[your-github-username].github.io/sudoku_master_web/`

## License

MIT License 