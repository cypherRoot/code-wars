import { describe, expect, it } from 'vitest';
import { normalizeCell } from '../../src/engines/sql/engine';

const field = (typeId: number, scale?: number) => ({ name: 'x', type: { typeId, scale, toString: () => 'T' } });
const DECIMAL = 7;
const TIMESTAMP = 10;

describe('normalizeCell', () => {
  it('keeps small decimals as numbers', () => {
    expect(normalizeCell(12345n, field(DECIMAL, 2))).toBe(123.45);
  });

  it('keeps decimals beyond 2^53 exact instead of collapsing them', () => {
    const a = normalizeCell(9007199254740992n, field(DECIMAL, 0));
    const b = normalizeCell(9007199254740993n, field(DECIMAL, 0));
    expect(a).not.toEqual(b);
    expect(b).toBe('9007199254740993');
    expect(normalizeCell(-123456789012345678n, field(DECIMAL, 2))).toBe('-1234567890123456.78');
  });

  it('maps equal decimal values to the same cell regardless of scale', () => {
    expect(normalizeCell(1n, field(DECIMAL, 0))).toBe(1);
    expect(normalizeCell(1_000_000_000_000_000_000n, field(DECIMAL, 18))).toBe(1);
    expect(normalizeCell(1n, field(DECIMAL, 7))).toBe(0.0000001);
    expect(normalizeCell(10n ** 23n, field(DECIMAL, 0))).toBe(1e23);
  });

  it('keeps fractional seconds on timestamps', () => {
    const base = Date.UTC(2026, 0, 2, 12, 0, 0);
    expect(normalizeCell(base, field(TIMESTAMP))).toBe('2026-01-02 12:00:00');
    expect(normalizeCell(base + 100, field(TIMESTAMP))).toBe('2026-01-02 12:00:00.1');
    expect(normalizeCell(base + 900, field(TIMESTAMP))).toBe('2026-01-02 12:00:00.9');
  });
});
