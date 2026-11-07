import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,em:`em`,h2:`h2`,li:`li`,ol:`ol`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Schema:l,Worked:u}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Schema`,!0),u||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsxs)(r.p,{children:[`You've probably worked with data as JSON from an API: an array of objects. A relational database stores the same idea as a `,(0,n.jsx)(r.strong,{children:`table`}),`. Each object is a `,(0,n.jsx)(r.strong,{children:`row`}),`, each key is a `,(0,n.jsx)(r.strong,{children:`column`}),`, and every value in a column has the same type. Data engineering is mostly moving tables like these from where they're `,(0,n.jsx)(r.em,{children:`created`}),` to where they're `,(0,n.jsx)(r.em,{children:`analysed`}),`, and cleaning them on the way.`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`// What a front-end sees
const customers = [
  { customer_id: 1, name: "Aarav Sharma", country: "India" },
  { customer_id: 2, name: "Priya Patel", country: "India" },
];
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-sql`,children:`-- The same data as a table
SELECT customer_id, name, country
FROM customers;
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[`An array has an order and can hold objects of any shape. A table is a `,(0,n.jsx)(r.strong,{children:`set of rows with no built-in order`}),`, and every row has exactly the same columns and types. If you want an order, you have to ask for it, which comes in a later lesson.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`Two kinds of database`}),`
`,(0,n.jsx)(r.p,{children:`| | OLTP (app database) | OLAP (warehouse) |
|---|---|---|
| Typical work | Insert one order, update one address | Total revenue by country for 3 years |
| Rows touched per query | A handful | Millions |
| Examples | PostgreSQL, MySQL | BigQuery, Snowflake, DuckDB |
| Who uses it | The app | Analysts, dashboards, ML |`}),`
`,(0,n.jsx)(r.p,{children:`A data pipeline copies data from OLTP systems (plus files and APIs) into an OLAP warehouse in layers:`}),`
`,(0,n.jsxs)(r.ol,{children:[`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`raw`}),`: an untouched copy of the source, so you can always start again.`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`staged`}),`: cleaned. Types are fixed, duplicates removed, names consistent.`]}),`
`,(0,n.jsxs)(r.li,{children:[(0,n.jsx)(r.strong,{children:`mart`}),`: shaped to answer one business question, such as "daily revenue by country".`]}),`
`]}),`
`,(0,n.jsx)(r.p,{children:`SQL is the language for every step after the data lands, which is why it's the first thing to learn.`}),`
`,(0,n.jsxs)(r.h2,{children:[`Meet the `,(0,n.jsx)(r.code,{children:`shop`}),` database`]}),`
`,(0,n.jsx)(r.p,{children:`Every SQL lesson uses the same small online store. It's an OLTP-style database with three tables:`}),`
`,(0,n.jsx)(l,{}),`
`,(0,n.jsx)(o,{kind:`tip`,children:(0,n.jsxs)(r.p,{children:[`You can open these tables from any exercise with `,(0,n.jsx)(r.strong,{children:`Show tables`}),`. You never need to memorise column names.`]})}),`
`,(0,n.jsx)(r.h2,{children:`Your first query`}),`
`,(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`SELECT`}),` chooses the columns, `,(0,n.jsx)(r.code,{children:`FROM`}),` chooses the table, and `,(0,n.jsx)(r.code,{children:`*`}),` means "all columns". Make a prediction first, then run it.`]}),`
`,(0,n.jsx)(u,{id:`first`}),`
`,(0,n.jsxs)(r.p,{children:[`Notice the result has `,(0,n.jsx)(r.strong,{children:`column types`}),` under each header: `,(0,n.jsx)(r.code,{children:`int`}),`, `,(0,n.jsx)(r.code,{children:`text`}),`, `,(0,n.jsx)(r.code,{children:`date`}),`, `,(0,n.jsx)(r.code,{children:`bool`}),`. Types matter: you'll compare dates with dates and do arithmetic on numbers, never on text.`]}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsx)(s,{id:`all-products`}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[`In real pipelines, `,(0,n.jsx)(r.code,{children:`SELECT *`}),` is fine for exploring but risky in production code. If someone adds a column to the source table, a `,(0,n.jsx)(r.code,{children:`SELECT *`}),` pipeline silently changes shape. Production queries name their columns.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};