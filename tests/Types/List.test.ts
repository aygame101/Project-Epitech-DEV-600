import type { List } from '../List';

describe('List Type', () => {
  it('should have required properties', () => {
    const list: List = {
      id: '1',
      name: 'Test List',
      idBoard: 'board1',
      pos: 1,
      closed: false
    };

    expect(list).toHaveProperty('id');
    expect(list).toHaveProperty('name');
    expect(list).toHaveProperty('idBoard');
    expect(list).toHaveProperty('pos');
    expect(list).toHaveProperty('closed');
    expect(typeof list.id).toBe('string');
    expect(typeof list.name).toBe('string');
    expect(typeof list.idBoard).toBe('string');
    expect(typeof list.pos).toBe('number');
    expect(typeof list.closed).toBe('boolean');
  });

  it('should allow optional subscribed property', () => {
    const list: List = {
      id: '1',
      name: 'Test List',
      idBoard: 'board1',
      pos: 1,
      closed: false,
      subscribed: true
    };

    expect(list.subscribed).toBeDefined();
    expect(typeof list.subscribed).toBe('boolean');
  });
});
