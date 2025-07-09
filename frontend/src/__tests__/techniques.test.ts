import { 
  techniques, 
  getTechniquesByDifficulty, 
  getTechniquesByCategory, 
  getTechniqueById,
  categories,
  categoryColors 
} from '../data/techniques';

describe('Techniques Data', () => {
  test('should have techniques array', () => {
    expect(techniques).toBeDefined();
    expect(Array.isArray(techniques)).toBe(true);
    expect(techniques.length).toBeGreaterThan(0);
  });

  test('each technique should have required properties', () => {
    techniques.forEach(technique => {
      expect(technique).toHaveProperty('id');
      expect(technique).toHaveProperty('name');
      expect(technique).toHaveProperty('description');
      expect(technique).toHaveProperty('category');
      expect(technique).toHaveProperty('difficulty');
      
      expect(typeof technique.id).toBe('string');
      expect(typeof technique.name).toBe('string');
      expect(typeof technique.description).toBe('string');
      expect(typeof technique.category).toBe('string');
      expect(['Beginner', 'Intermediate', 'Advanced', 'Expert']).toContain(technique.difficulty);
    });
  });

  test('technique IDs should be unique', () => {
    const ids = techniques.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all techniques should have valid categories', () => {
    techniques.forEach(technique => {
      expect(categories).toContain(technique.category);
    });
  });

  test('all categories should have color definitions', () => {
    categories.forEach(category => {
      expect(categoryColors).toHaveProperty(category);
    });
  });
});

describe('Techniques Utility Functions', () => {
  test('getTechniquesByDifficulty should filter correctly', () => {
    const beginnerTechniques = getTechniquesByDifficulty('Beginner');
    const intermediateTechniques = getTechniquesByDifficulty('Intermediate');
    const advancedTechniques = getTechniquesByDifficulty('Advanced');
    const expertTechniques = getTechniquesByDifficulty('Expert');

    expect(beginnerTechniques.every(t => t.difficulty === 'Beginner')).toBe(true);
    expect(intermediateTechniques.every(t => t.difficulty === 'Intermediate')).toBe(true);
    expect(advancedTechniques.every(t => t.difficulty === 'Advanced')).toBe(true);
    expect(expertTechniques.every(t => t.difficulty === 'Expert')).toBe(true);

    // Should have techniques in each difficulty level
    expect(beginnerTechniques.length).toBeGreaterThan(0);
    expect(intermediateTechniques.length).toBeGreaterThan(0);
    expect(advancedTechniques.length).toBeGreaterThan(0);
    expect(expertTechniques.length).toBeGreaterThan(0);
  });

  test('getTechniquesByCategory should filter correctly', () => {
    const singlesTechniques = getTechniquesByCategory('Singles');
    const fishTechniques = getTechniquesByCategory('Fish');

    expect(singlesTechniques.every(t => t.category === 'Singles')).toBe(true);
    expect(fishTechniques.every(t => t.category === 'Fish')).toBe(true);
  });

  test('getTechniqueById should find correct technique', () => {
    const nakedSingle = getTechniqueById('naked-single');
    const xWing = getTechniqueById('x-wing');

    expect(nakedSingle).toBeDefined();
    expect(nakedSingle?.name).toBe('Naked Single');
    expect(nakedSingle?.difficulty).toBe('Beginner');

    expect(xWing).toBeDefined();
    expect(xWing?.name).toBe('X-Wing');
    expect(xWing?.difficulty).toBe('Intermediate');
  });

  test('getTechniqueById should return undefined for non-existent ID', () => {
    const nonExistent = getTechniqueById('non-existent-technique');
    expect(nonExistent).toBeUndefined();
  });
});

describe('Techniques Content', () => {
  test('should have techniques from all major categories', () => {
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = getTechniquesByCategory(category).length;
      return acc;
    }, {} as Record<string, number>);

    // Should have at least some techniques in major categories
    expect(categoryCounts['Singles']).toBeGreaterThan(0);
    expect(categoryCounts['Subsets']).toBeGreaterThan(0);
    expect(categoryCounts['Fish']).toBeGreaterThan(0);
    expect(categoryCounts['Wings']).toBeGreaterThan(0);
  });

  test('should have progressive difficulty distribution', () => {
    const beginnerCount = getTechniquesByDifficulty('Beginner').length;
    const intermediateCount = getTechniquesByDifficulty('Intermediate').length;
    const advancedCount = getTechniquesByDifficulty('Advanced').length;
    const expertCount = getTechniquesByDifficulty('Expert').length;

    // Should have more beginner techniques than expert techniques
    expect(beginnerCount).toBeGreaterThan(0);
    expect(expertCount).toBeGreaterThan(0);
    
    // Total should equal all techniques
    expect(beginnerCount + intermediateCount + advancedCount + expertCount).toBe(techniques.length);
  });

  test('technique descriptions should be reasonable length', () => {
    techniques.forEach(technique => {
      expect(technique.description.length).toBeGreaterThan(10);
      expect(technique.description.length).toBeLessThan(200);
    });
  });

  test('technique names should be descriptive', () => {
    techniques.forEach(technique => {
      expect(technique.name.length).toBeGreaterThan(0);
      expect(technique.name.length).toBeLessThan(50);
    });
  });
}); 