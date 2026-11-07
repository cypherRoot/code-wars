import { describe, expect, it } from 'vitest';
import { compareResults } from '../../src/engines/sql/compare';
import type { CellValue, Column, QueryResult } from '../../src/engines/result';

const col = (name: string, family: Column['family'] = 'text'): Column => ({ name, type: family, family });
const res = (columns: Column[], rows: CellValue[][]): QueryResult => ({ columns, rows, rowCount: rows.length, truncated: false, elapsedMs: 0 });

describe('compareResults', () => {
  const cols = [col('name'), col('amount', 'float')];

  it('passes identical results regardless of row order by default', () => {
    const a = res(cols, [['a', 1], ['b', 2]]);
    const b = res(cols, [['b', 2], ['a', 1]]);
    expect(compareResults(a, b).pass).toBe(true);
  });

  it('fails on order when orderMatters, with an ORDER BY hint', () => {
    const a = res(cols, [['a', 1], ['b', 2]]);
    const b = res(cols, [['b', 2], ['a', 1]]);
    const out = compareResults(a, b, { orderMatters: true });
    expect(out.pass).toBe(false);
    expect(out.reasons[0]).toMatch(/wrong order/);
  });

  it('treats rows as a multiset: duplicate counts matter', () => {
    const a = res(cols, [['a', 1], ['a', 1]]);
    const b = res(cols, [['a', 1]]);
    const out = compareResults(a, b);
    expect(out.pass).toBe(false);
    expect(out.missing).toEqual([['a', 1]]);
  });

  it('treats NULL as equal to NULL for comparison', () => {
    const a = res(cols, [[null, 1]]);
    expect(compareResults(a, res(cols, [[null, 1]])).pass).toBe(true);
  });

  it('tolerates float noise but not real differences', () => {
    const a = res(cols, [['a', 0.3]]);
    expect(compareResults(a, res(cols, [['a', 0.1 + 0.2]])).pass).toBe(true);
    expect(compareResults(a, res(cols, [['a', 0.31]])).pass).toBe(false);
  });

  it('treats int and float families as compatible (DECIMAL vs DOUBLE)', () => {
    const a = res([col('n', 'int')], [[3]]);
    const b = res([col('n', 'float')], [[3.0]]);
    expect(compareResults(a, b).pass).toBe(true);
  });

  it('reports a column-count mismatch first', () => {
    const out = compareResults(res(cols, [['a', 1]]), res([col('name')], [['a']]));
    expect(out.pass).toBe(false);
    expect(out.reasons[0]).toMatch(/Expected 2 column/);
  });

  it('checks names only when strict', () => {
    const a = res([col('amount_cents', 'float')], [[100]]);
    const b = res([col('x', 'float')], [[100]]);
    expect(compareResults(a, b).pass).toBe(true);
    const strict = compareResults(a, b, { columnNames: 'strict' });
    expect(strict.pass).toBe(false);
    expect(strict.reasons[0]).toMatch(/AS/);
  });

  it('rejects text where numbers were expected', () => {
    const out = compareResults(res([col('n', 'int')], [[1]]), res([col('n', 'text')], [['1']]));
    expect(out.pass).toBe(false);
  });

  it('refuses to compare truncated results', () => {
    const big = { ...res(cols, [['a', 1]]), truncated: true };
    expect(compareResults(big, big).pass).toBe(false);
  });

  it('does not let a separator inside text make different rows equal', () => {
    const two = [col('a'), col('b')];
    expect(compareResults(res(two, [['a␟s:b', 'c']]), res(two, [['a', 'b␟s:c']])).pass).toBe(false);
  });

  it('treats values within tolerance as equal even across a rounding boundary', () => {
    const n = [col('x', 'float')];
    expect(compareResults(res(n, [[0.00000049]]), res(n, [[0.00000051]])).pass).toBe(true);
    expect(compareResults(res(n, [[0.00000049]]), res(n, [[0.00000051]]), { orderMatters: true }).pass).toBe(true);
    expect(compareResults(res(n, [[1], [1]]), res(n, [[1], [1.1]])).pass).toBe(false);
    expect(compareResults(res(n, [[1e15]]), res(n, [[1e15 + 0.5]]), { orderMatters: true }).pass).toBe(false);
  });
});
