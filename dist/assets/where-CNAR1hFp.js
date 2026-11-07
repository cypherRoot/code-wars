import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,em:`em`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Worked:l}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsxs)(r.p,{children:[`Almost every query a data engineer writes has a `,(0,n.jsx)(r.code,{children:`WHERE`}),`. You use it to process only yesterday's data, drop test accounts, or skip cancelled orders. Getting a filter subtly wrong is also how most "the numbers don't match" bugs start, so this lesson includes the classic traps.`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`customers.filter(c => c.country === "India")
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-sql`,children:`SELECT *
FROM customers
WHERE country = 'India';
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[`JavaScript's `,(0,n.jsx)(r.code,{children:`===`}),` returns `,(0,n.jsx)(r.code,{children:`true`}),` or `,(0,n.jsx)(r.code,{children:`false`}),`. SQL logic has `,(0,n.jsx)(r.strong,{children:`three`}),` values: true, false and `,(0,n.jsx)(r.em,{children:`unknown`}),`. Unknown is what you get whenever NULL is involved, and `,(0,n.jsx)(r.code,{children:`WHERE`}),` only keeps rows where the condition is `,(0,n.jsx)(r.strong,{children:`true`}),`. Also: SQL uses a single `,(0,n.jsx)(r.code,{children:`=`}),` for comparison, and `,(0,n.jsx)(r.code,{children:`AND`}),` / `,(0,n.jsx)(r.code,{children:`OR`}),` / `,(0,n.jsx)(r.code,{children:`NOT`}),` instead of `,(0,n.jsx)(r.code,{children:`&&`}),` / `,(0,n.jsx)(r.code,{children:`||`}),` / `,(0,n.jsx)(r.code,{children:`!`}),`.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`The basics`}),`
`,(0,n.jsx)(l,{id:`india`}),`
`,(0,n.jsxs)(r.p,{children:[`Comparisons: `,(0,n.jsx)(r.code,{children:`=`}),`, `,(0,n.jsx)(r.code,{children:`<>`}),` (or `,(0,n.jsx)(r.code,{children:`!=`}),`), `,(0,n.jsx)(r.code,{children:`<`}),`, `,(0,n.jsx)(r.code,{children:`<=`}),`, `,(0,n.jsx)(r.code,{children:`>`}),`, `,(0,n.jsx)(r.code,{children:`>=`}),`. Combine them with `,(0,n.jsx)(r.code,{children:`AND`}),`, `,(0,n.jsx)(r.code,{children:`OR`}),` and `,(0,n.jsx)(r.code,{children:`NOT`}),`:`]}),`
`,(0,n.jsx)(l,{id:`combined`}),`
`,(0,n.jsx)(o,{kind:`warn`,children:(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`AND`}),` is evaluated `,(0,n.jsx)(r.strong,{children:`before`}),` `,(0,n.jsx)(r.code,{children:`OR`}),`, just like `,(0,n.jsx)(r.code,{children:`*`}),` before `,(0,n.jsx)(r.code,{children:`+`}),`. `,(0,n.jsx)(r.code,{children:`a OR b AND c`}),` means `,(0,n.jsx)(r.code,{children:`a OR (b AND c)`}),`. When you mix them, add parentheses even if they aren't needed. Your future self will thank you.`]})}),`
`,(0,n.jsx)(r.h2,{children:`Shorthands: IN, BETWEEN, LIKE`}),`
`,(0,n.jsx)(l,{id:`shorthands`}),`
`,(0,n.jsx)(r.h2,{children:`The NULL trap`}),`
`,(0,n.jsxs)(r.p,{children:[`NULL isn't zero or an empty string. It means `,(0,n.jsx)(r.strong,{children:`unknown / missing`}),`. Make a prediction:`]}),`
`,(0,n.jsx)(l,{id:`null-trap`}),`
`,(0,n.jsxs)(r.p,{children:[`| Expression | Result |
|---|---|
| `,(0,n.jsx)(r.code,{children:`NULL = NULL`}),` | unknown |
| `,(0,n.jsx)(r.code,{children:`NULL <> 'London'`}),` | unknown |
| `,(0,n.jsx)(r.code,{children:`city IS NULL`}),` | true / false: `,(0,n.jsx)(r.strong,{children:`use this`}),` |
| `,(0,n.jsx)(r.code,{children:`city IS NOT NULL`}),` | true / false |`]}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsx)(s,{id:`two-countries`}),`
`,(0,n.jsx)(s,{id:`big-open-orders`}),`
`,(0,n.jsx)(o,{kind:`tip`,children:(0,n.jsxs)(r.p,{children:[`Your answers are also checked against a `,(0,n.jsx)(r.strong,{children:`hidden dataset`}),` with awkward cases: exact boundary values, NULLs, odd casing. Getting the right result by luck on the visible data isn't enough, just as in production.`]})}),`
`,(0,n.jsx)(s,{id:`no-city`}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[`Incremental pipelines are built on `,(0,n.jsx)(r.code,{children:`WHERE`}),`. Instead of reprocessing everything nightly, a job loads only the new rows, using `,(0,n.jsx)(r.code,{children:`WHERE order_date >= DATE '2025-03-01'`}),` or "everything since the last run". An off-by-one between `,(0,n.jsx)(r.code,{children:`>`}),` and `,(0,n.jsx)(r.code,{children:`>=`}),` here means a day of data is missing or loaded twice.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};