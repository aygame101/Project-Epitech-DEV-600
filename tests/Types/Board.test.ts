import type { Board } from '../Board';

describe('Board Type', () => {
  it('should have required properties', () => {
    const board: Board = {
      id: '1',
      name: 'Test Board',
      url: 'https://example.com'
    };

    expect(board).toHaveProperty('id');
    expect(board).toHaveProperty('name');
    expect(board).toHaveProperty('url');
    expect(typeof board.id).toBe('string');
    expect(typeof board.name).toBe('string');
    expect(typeof board.url).toBe('string');
  });

  it('should allow optional properties', () => {
    const board: Board = {
      id: '1',
      name: 'Test Board',
      url: 'https://example.com',
      desc: 'Description',
      prefs: {
        backgroundImage: 'image.png'
      }
    };

    expect(board.desc).toBeDefined();
    expect(board.prefs).toBeDefined();
    expect(board.prefs?.backgroundImage).toBeDefined();
  });
});
