import { describe, expect, it } from 'vitest';
import { checkReadOnly, stripSqlNoise } from '../../src/engines/sql/guard';

describe('checkReadOnly', () => {
  it.each([
    'SELECT * FROM customers',
    'select * from customers;',
    'WITH x AS (SELECT 1) SELECT * FROM x',
    'FROM customers',
    "SELECT 'drop table customers; delete' AS joke",
    '-- update everything\nSELECT 1',
    'SELECT name AS "update" FROM customers',
  ])('allows %s', (sql) => {
    expect(checkReadOnly(sql)).toBeNull();
  });

  it.each([
    ['', /empty/],
    ['DROP TABLE customers', /read query/],
    ['SELECT 1; SELECT 2', /2 statements/],
    ['SELECT 1; DELETE FROM orders', /statements/],
    ['INSERT INTO orders VALUES (1)', /read query/],
    ["COPY customers TO 'x.csv'", /read query/],
  ])('blocks %s', (sql, msg) => {
    expect(checkReadOnly(sql)?.message).toMatch(msg);
  });

  it('strips comments and literals', () => {
    expect(stripSqlNoise("SELECT 'a;b' /* ; */ -- ;\n")).not.toContain(';');
  });
});
