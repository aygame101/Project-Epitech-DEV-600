import type { Card } from '../Card';

describe('Card Type', () => {
  it('should have required properties', () => {
    const card: Card = {
      id: '1',
      name: 'Test Card'
    };

    expect(card).toHaveProperty('id');
    expect(card).toHaveProperty('name');
    expect(typeof card.id).toBe('string');
    expect(typeof card.name).toBe('string');
  });

  it('should allow optional desc property', () => {
    const card: Card = {
      id: '1',
      name: 'Test Card',
      desc: 'Description'
    };

    expect(card.desc).toBeDefined();
    expect(typeof card.desc).toBe('string');
  });
});
