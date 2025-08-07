# Speed Scanning Quiz

## Overview

The Speed Scanning Quiz is an interactive training module that helps users improve their ability to quickly identify Sudoku solving techniques and determine correct cell values. It functions as a quiz-style game where users are presented with Sudoku puzzles and must identify both the technique and the correct number for highlighted cells.

## Features

### 🎯 Interactive Quiz Interface
- **Sudoku Grid Display**: Shows a 9x9 Sudoku puzzle with a highlighted target cell
- **Technique Selection**: Multiple choice questions for identifying solving techniques
- **Number Input**: Keypad for selecting the correct number (1-9)
- **Instant Feedback**: Immediate validation of answers with visual indicators

### 📊 Progress Tracking
- **Question Counter**: Shows current question number and total questions
- **Score Display**: Real-time percentage score based on correct answers
- **Statistics**: Tracks correct/incorrect answers throughout the session

### 🎨 Visual Feedback
- **Color-coded Results**: Green for correct, red for incorrect answers
- **Animated Transitions**: Smooth animations using Framer Motion
- **Highlighted Target Cell**: Yellow highlighting for the cell to be solved
- **Technique Tooltips**: Hover descriptions for technique explanations

### 📚 Educational Features
- **Collapsible Explanations**: Detailed explanations for each question
- **Technique Descriptions**: Brief descriptions available on hover
- **Performance Messages**: Encouraging feedback based on final score

## Game Flow

1. **Setup Screen**: Choose difficulty level and number of questions
2. **Question Display**: View puzzle with highlighted target cell
3. **Answer Selection**: Choose technique and number
4. **Feedback**: See immediate results and explanations
5. **Progress**: Continue to next question or finish quiz
6. **Results**: View final score and performance summary

## Difficulty Levels

- **Easy**: Basic techniques (Hidden Single, Naked Single, Full House)
- **Medium**: Intermediate techniques with more complex patterns
- **Hard**: Advanced techniques requiring deeper analysis

## Question Types

The quiz includes various Sudoku solving techniques:

- **Hidden Single**: A number that can only go in one cell within a unit
- **Naked Single**: A cell that contains only one possible candidate
- **Full House**: A unit with only one empty cell remaining
- **Pointing Pair**: Two candidates in a box that point to a row or column
- **Claiming Pair**: Two candidates in a row/column that claim a box

## Technical Implementation

### State Management
- Uses Zustand for state management (`speedScannerStore.ts`)
- Tracks current question, user selections, progress, and game state
- Manages question loading, answer validation, and score calculation

### Components
- **SpeedScanner**: Main quiz interface component
- **SpeedScanningPage**: Page wrapper with setup and results screens
- **Store**: Zustand store for state management

### Data Structure
```typescript
type SpeedScannerQuestion = {
  id: string;
  puzzle: number[][];
  targetCell: { row: number; col: number };
  correctTechnique: string;
  correctValue: number;
  explanation: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
};
```

## Usage

1. Navigate to `/training/speed-scanning`
2. Select difficulty level and number of questions
3. Click "Start Quiz" to begin
4. For each question:
   - Identify the technique that can solve the highlighted cell
   - Select the correct number (1-9)
   - Click "Submit Answer"
   - Review feedback and explanation
   - Click "Next Question" to continue
5. View final results and performance summary

## Future Enhancements

- **More Questions**: Expand question database with more techniques
- **Timer Mode**: Add time limits for speed training
- **Difficulty Progression**: Adaptive difficulty based on performance
- **Statistics Tracking**: Save and track performance over time
- **Custom Puzzles**: Allow users to create their own quiz questions
- **Multiplayer**: Competitive mode with other players

## File Structure

```
frontend/src/
├── components/
│   └── SpeedScanner.tsx          # Main quiz component
├── pages/training/
│   └── speed-scanning.tsx        # Quiz page
├── store/
│   └── speedScannerStore.ts      # State management
└── data/
    └── techniques.ts             # Technique definitions
```

## Dependencies

- **React**: UI framework
- **Next.js**: Full-stack framework
- **Zustand**: State management
- **Framer Motion**: Animations
- **Lucide React**: Icons
- **Tailwind CSS**: Styling 