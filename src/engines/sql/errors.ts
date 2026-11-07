import type { EngineError } from '../result';

interface Rule {
  test: RegExp;
  hint: (m: RegExpMatchArray) => string;
  kind?: EngineError['kind'];
}

/** Turns DuckDB error text into a hint a beginner can act on. First match wins. */
const RULES: Rule[] = [
  {
    test: /Referenced column "([^"]+)" not found/i,
    hint: (m) =>
      `There's no column called "${m[1]}" in the tables you're reading from. Check the spelling, or look at the table's columns in the schema panel.`,
  },
  {
    test: /Table with name ([\w.]+) does not exist/i,
    hint: (m) => `There's no table named "${m[1]}". Table names are case-insensitive but must be spelled exactly — check the schema panel.`,
  },
  {
    test: /syntax error at or near "(\w+)"/i,
    hint: (m) =>
      `The parser got confused at "${m[1]}". Common causes: a missing or extra comma between columns, or clauses in the wrong order — the order is SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.`,
    kind: 'syntax',
  },
  {
    test: /syntax error at end of input/i,
    hint: () => 'The query ends too early. Is a clause unfinished — for example WHERE with no condition, or a trailing comma?',
    kind: 'syntax',
  },
  {
    test: /unterminated quoted string/i,
    hint: () => "A text value is missing its closing quote. Text values use single quotes: 'India'.",
    kind: 'syntax',
  },
  {
    test: /must appear in the GROUP BY clause|must be part of an aggregate/i,
    hint: () =>
      'When you use GROUP BY, every selected column must either be in the GROUP BY list or be wrapped in an aggregate like COUNT() or SUM().',
  },
  {
    test: /WHERE clause cannot contain aggregates/i,
    hint: () => 'WHERE filters rows *before* grouping, so it can’t use COUNT/SUM/etc. Filter on aggregates with HAVING instead.',
  },
  {
    test: /Could not convert string '([^']*)' to (\w+)/i,
    hint: (m) => `The text '${m[1]}' was compared to a ${m[2]} column. Remove the quotes for numbers, or check the column type.`,
  },
  {
    test: /Cannot compare values of type (\w+) and type (\w+)|No function matches/i,
    hint: () => 'Two values of different types are being compared. Numbers have no quotes; text and dates use single quotes.',
  },
  {
    test: /column "([^"]+)" (?:is )?ambiguous|Ambiguous reference to column name "([^"]+)"/i,
    hint: (m) => `"${m[1] ?? m[2]}" exists in more than one table. Prefix it with the table name or alias, like c.${m[1] ?? m[2]}.`,
  },
  {
    test: /Values list "([^"]+)" does not have a column named/i,
    hint: () =>
      'Double quotes mean a column name in SQL. For text values, use single quotes: WHERE country = \'India\'.',
  },
];

export function translateSqlError(raw: string): EngineError {
  const message = raw.replace(/^(Binder|Parser|Catalog|Conversion|Invalid Input|Not implemented) Error:\s*/i, '').trim();
  // DuckDB sometimes reports "Referenced column "india" not found" when the learner used "India" (double quotes)
  if (/Referenced column "([^"]+)" not found/i.test(message) && /"\w*[A-Z]/.test(raw)) {
    return {
      kind: 'runtime',
      message,
      hint: "In SQL, double quotes mean a column name. For text values use single quotes: 'India'. (If you meant a column, check the spelling.)",
    };
  }
  for (const r of RULES) {
    const m = message.match(r.test) ?? raw.match(r.test);
    if (m) return { kind: r.kind ?? 'runtime', message, hint: r.hint(m) };
  }
  return { kind: /parser/i.test(raw) ? 'syntax' : 'runtime', message };
}
