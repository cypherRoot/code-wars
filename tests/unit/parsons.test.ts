import { describe, expect, it } from 'vitest';
import { seededShuffle } from '../../src/components/lesson/parsons';

describe('seededShuffle', () => {
  const lines = ['a', 'b', 'c', 'd', 'e'];

  it('is deterministic for a seed', () => {
    expect(seededShuffle(lines, 'x')).toEqual(seededShuffle(lines, 'x'));
  });

  it('never returns the solved order', () => {
    for (const seed of ['a', 'b', 'c', 'lesson:p1', 'sql.s1:clause-order']) {
      expect(seededShuffle(lines, seed)).not.toEqual(lines);
      expect(seededShuffle(['x', 'y'], seed)).toEqual(['y', 'x']);
    }
  });

  it('keeps every item', () => {
    expect([...seededShuffle(lines, 'q')].sort()).toEqual(lines);
  });
});
