# Sudoku Solving Techniques Documentation

This document provides an overview of the advanced Sudoku solving techniques implemented in the `sudoku-techniques.js` module.

## Module Structure

The `SudokuTechniques` class is organized into logical groups of solving techniques, from basic to advanced:

1. Singles
2. Intersections
3. Hidden Subsets
4. Naked Subsets
5. Fish Patterns
6. Single Digit Patterns
7. Uniqueness
8. Wings
9. Miscellaneous
10. Chains and Loops
11. ALS (Almost Locked Sets)
12. Methods of Last Resort

## Implementation Guide

### Basic Structure

Each technique is implemented as a method that:
- Takes a grid parameter (the current Sudoku grid state)
- Returns either:
  - A solution object containing the technique's findings
  - `null` if the technique doesn't apply

### Solution Object Format

When a technique is found, return an object with this structure:

```javascript
{
    type: 'technique_name',
    cells: [
        { row: 0, col: 0, value: 5 },
        // ... other cells involved
    ],
    eliminations: [
        { row: 1, col: 1, value: 3 },
        // ... other eliminations
    ],
    explanation: 'Detailed explanation of the technique'
}
```

### Implementation Order

1. Start with basic techniques (Singles, Intersections)
2. Move to intermediate techniques (Subsets, Basic Fish)
3. Implement advanced techniques (Complex Fish, Chains)
4. Add last resort methods

## Technique Categories

### Singles
- Full House / Last Digit
- Hidden Single
- Naked Single

### Intersections
- Locked Candidates Type 1 (Pointing)
- Locked Candidates Type 2 (Claiming)

### Hidden Subsets
- Hidden Pair
- Hidden Triple
- Hidden Quadruple

### Naked Subsets
- Naked Pair / Locked Pair
- Naked Triple / Locked Triple
- Naked Quadruple

### Fish Patterns
- Basic Fish (X-Wing, Swordfish, Jellyfish)
- Finned / Sashimi Fish
- Complex Fish (Franken, Mutant, Siamese)

### Single Digit Patterns
- Skyscraper
- 2-String Kite
- Turbot Fish
- Empty Rectangle

### Uniqueness
- Unique Rectangle Types 1-6
- BUG+1
- Hidden Rectangle
- Avoidable Rectangle

### Wings
- XY-Wing
- XYZ-Wing
- W-Wing

### Miscellaneous
- Sue de Coq
- Coloring (Simple Colors, Multi Colors)

### Chains and Loops
- Remote Pair
- X-Chain
- XY-Chain
- Nice Loop / AIC

### ALS (Almost Locked Sets)
- ALS-XZ
- ALS-XY-Wing
- ALS Chain
- Death Blossom

### Methods of Last Resort
- Templates
- Forcing Chain
- Forcing Net
- Kraken Fish
- Brute Force

## Integration with Main Sudoku Class

To use these techniques in the main Sudoku class:

1. Import the SudokuTechniques class:
```javascript
import SudokuTechniques from './sudoku-techniques.js';
```

2. Initialize in the constructor:
```javascript
this.techniques = new SudokuTechniques();
```

3. Use in solving methods:
```javascript
const solution = this.techniques.findXYWing(this.grid);
if (solution) {
    // Apply the solution
}
```

## Testing

Each technique should be tested with:
1. Valid puzzles where the technique applies
2. Valid puzzles where the technique doesn't apply
3. Invalid puzzles
4. Edge cases (empty grid, full grid, etc.)

## Performance Considerations

- Implement techniques in order of complexity
- Cache results where possible
- Use efficient data structures for candidate tracking
- Consider early termination when a solution is found

## Contributing

When adding new techniques:
1. Follow the existing method naming convention
2. Add comprehensive documentation
3. Include test cases
4. Update this documentation

## References

- Sudoku Solving Techniques: [External Resources]
- Algorithm References: [External Resources]
- Pattern Recognition: [External Resources] 