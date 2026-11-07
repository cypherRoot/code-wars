import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Parsons:l,Worked:u}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Parsons`,!0),u||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsxs)(r.p,{children:[`"Top 10 products", "latest 100 events" and "which statuses exist?" come up in almost every analysis. They're also where queries quietly become `,(0,n.jsx)(r.strong,{children:`non-deterministic`}),`: two runs of the same query return different rows. In a pipeline that's a real bug, because reruns should give the same answer.`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`[...products]
  .sort((a, b) => b.price - a.price)
  .slice(0, 3);

[...new Set(customers.map(c => c.country))];
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-sql`,children:`SELECT name, price FROM products
ORDER BY price DESC
LIMIT 3;

SELECT DISTINCT country FROM customers;
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[`JavaScript's `,(0,n.jsx)(r.code,{children:`sort`}),` is stable: equal items keep their original order. SQL makes `,(0,n.jsx)(r.strong,{children:`no such promise`}),`, because a table has no "original order". If two rows tie, either can come first, so add a tie-breaker column whenever the exact order matters.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`ORDER BY and LIMIT`}),`
`,(0,n.jsx)(u,{id:`top3`}),`
`,(0,n.jsx)(u,{id:`multi-sort`}),`
`,(0,n.jsx)(r.h2,{children:`DISTINCT`}),`
`,(0,n.jsx)(u,{id:`distinct`}),`
`,(0,n.jsx)(r.h2,{children:`The order you write vs. the order it runs`}),`
`,(0,n.jsxs)(r.p,{children:[`You `,(0,n.jsx)(r.strong,{children:`write`}),` clauses in a fixed order, but the database `,(0,n.jsx)(r.strong,{children:`evaluates`}),` them in a different one:`]}),`
`,(0,n.jsx)(r.p,{children:`| Written | Evaluated |
|---|---|
| 1. SELECT | 1. FROM: pick the table |
| 2. FROM | 2. WHERE: filter rows |
| 3. WHERE | 3. SELECT: compute output columns |
| 4. ORDER BY | 4. ORDER BY: sort |
| 5. LIMIT | 5. LIMIT: cut |`}),`
`,(0,n.jsxs)(r.p,{children:[`This explains two puzzles: an alias from `,(0,n.jsx)(r.code,{children:`SELECT`}),` `,(0,n.jsx)(r.strong,{children:`works in ORDER BY`}),` but `,(0,n.jsx)(r.strong,{children:`fails in WHERE`}),`, and `,(0,n.jsx)(r.code,{children:`LIMIT`}),` always applies to the already-sorted result.`]}),`
`,(0,n.jsx)(l,{id:`clause-order`}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsx)(s,{id:`top5-products`}),`
`,(0,n.jsx)(s,{id:`statuses`}),`
`,(0,n.jsx)(s,{id:`latest-orders`}),`
`,(0,n.jsx)(o,{kind:`dialect`,children:(0,n.jsxs)(r.p,{children:[`NULLs sort `,(0,n.jsx)(r.strong,{children:`last`}),` in DuckDB by default, but PostgreSQL puts them `,(0,n.jsx)(r.strong,{children:`first`}),` when sorting `,(0,n.jsx)(r.code,{children:`DESC`}),`. If it matters, say so explicitly: `,(0,n.jsx)(r.code,{children:`ORDER BY price DESC NULLS LAST`}),`.`]})}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[`"Latest row per key" is one of the most common pipeline tasks. Examples: the newest address per customer, or the last status per order. `,(0,n.jsx)(r.code,{children:`ORDER BY ... LIMIT 1`}),` handles a single key. Doing it for `,(0,n.jsx)(r.strong,{children:`every`}),` key at once needs window functions, which are module S6.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};