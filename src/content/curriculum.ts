import type { TrackId } from './schema';

export interface Track {
  id: TrackId;
  name: string;
  short: string;
  /** CSS variable holding the track colour (research §3.2). */
  color: string;
}

export const TRACKS: Record<TrackId, Track> = {
  found: { id: 'found', name: 'Foundations', short: 'F', color: 'var(--found)' },
  sql: { id: 'sql', name: 'SQL', short: 'S', color: 'var(--sql-text)' },
  py: { id: 'py', name: 'Python', short: 'P', color: 'var(--py)' },
  de: { id: 'de', name: 'Data Engineering', short: 'D', color: 'var(--de)' },
};

export interface ModuleInfo {
  code: string;
  track: TrackId;
  title: string;
  blurb: string;
  /** Optional extension modules don't block the core path (plan R1). */
  optional?: boolean;
}

/** Full curriculum (research §1 + plan R1). Modules without lesson files show as "coming soon". */
export const MODULES: ModuleInfo[] = [
  { code: 'F0', track: 'found', title: 'Dev foundations', blurb: 'Terminal, Git, VS Code, Python with uv, DuckDB on your machine.' },
  { code: 'S0', track: 'sql', title: 'Databases & the DE big picture', blurb: 'Tables, rows, columns. OLTP vs OLAP. Where SQL sits in a pipeline.' },
  { code: 'S1', track: 'sql', title: 'Reading data', blurb: 'SELECT, WHERE, ORDER BY, LIMIT, DISTINCT, aliases.' },
  { code: 'S2', track: 'sql', title: 'Expressions & NULL', blurb: 'CASE, string and date functions, NULL logic, COALESCE, CAST.' },
  { code: 'S3', track: 'sql', title: 'Aggregation', blurb: 'GROUP BY, HAVING, COUNT/SUM/AVG/MIN/MAX.' },
  { code: 'S3.5', track: 'sql', title: 'Keys, cardinality & grain', blurb: 'Primary/foreign keys, 1:1 · 1:N · N:M, and what one row means.' },
  { code: 'S4', track: 'sql', title: 'Joins', blurb: 'INNER, LEFT, FULL, self and anti-joins. Fan-out pitfalls.' },
  { code: 'S5', track: 'sql', title: 'Subqueries & CTEs', blurb: 'Scalar, IN and EXISTS subqueries. WITH clauses.' },
  { code: 'S6', track: 'sql', title: 'Window functions', blurb: 'ROW_NUMBER, RANK, LAG/LEAD, running totals, dedup.' },
  { code: 'S7', track: 'sql', title: 'Writing data', blurb: 'DDL, constraints, INSERT/UPDATE/DELETE, upserts, transactions.' },
  { code: 'S8', track: 'sql', title: 'Data modeling', blurb: 'Star schemas, facts and dimensions, SCD Type 2.' },
  { code: 'S9', track: 'sql', title: 'Performance', blurb: 'Indexes, EXPLAIN, columnar storage, partitioning.' },
  { code: 'S10', track: 'sql', title: 'DE SQL patterns', blurb: 'Sessionization, funnels, pivots, incremental loads.', optional: true },
  { code: 'P0', track: 'py', title: 'Python for JS devs', blurb: 'The syntax map from JavaScript, types, collections, truthiness.' },
  { code: 'P1', track: 'py', title: 'Control flow & functions', blurb: 'Loops, comprehensions, args/kwargs, scope, assert.' },
  { code: 'P2', track: 'py', title: 'Files & formats', blurb: 'pathlib, CSV, JSON, Parquet basics, modules.' },
  { code: 'P3', track: 'py', title: 'Robust code', blurb: 'Exceptions, logging, type hints, dataclasses.' },
  { code: 'P4', track: 'py', title: 'Pythonic power tools', blurb: 'Iterators, generators, context managers, decorators.' },
  { code: 'P5', track: 'py', title: 'Talking to APIs', blurb: 'requests, pagination, retries and backoff.' },
  { code: 'P6', track: 'py', title: 'DataFrames', blurb: 'pandas core, then Polars and DuckDB from Python.' },
  { code: 'P7', track: 'py', title: 'Python + databases', blurb: 'DB-API, parameterised queries, SQLAlchemy Core, bulk loads.' },
  { code: 'P8', track: 'py', title: 'Quality', blurb: 'pytest, Pydantic validation, data contracts.' },
  { code: 'D1', track: 'de', title: 'Pipelines', blurb: 'ETL vs ELT, batch vs streaming, idempotency, backfills.' },
  { code: 'D2', track: 'de', title: 'Storage layouts', blurb: 'Parquet in depth, partitioned layouts.' },
  { code: 'D3', track: 'de', title: 'Data quality', blurb: 'Tests, contracts, freshness.' },
  { code: 'D4', track: 'de', title: 'dbt concepts', blurb: 'Models, refs, tests, materializations.' },
  { code: 'D5', track: 'de', title: 'Orchestration', blurb: 'DAGs, scheduling, retries (Airflow concepts).' },
  { code: 'D0', track: 'de', title: 'Cloud basics', blurb: 'Object storage, IAM, warehouses, cost awareness.' },
  { code: 'D6', track: 'de', title: 'Capstone pipeline', blurb: 'API → raw → staged → mart, with tests, in your browser.' },
];

/** One recommended daily path that interleaves tracks (plan R1). */
export const PATH: string[] = [
  'F0', 'S0', 'P0', 'S1', 'P1', 'S2', 'P2', 'S3', 'S3.5', 'P3', 'S4', 'P4', 'S5', 'P5', 'S6', 'P6',
  'S7', 'P7', 'S8', 'D1', 'D2', 'P8', 'S9', 'D3', 'D4', 'S10', 'D5', 'D0', 'D6',
];

export const moduleByCode = new Map(MODULES.map((m) => [m.code, m]));
