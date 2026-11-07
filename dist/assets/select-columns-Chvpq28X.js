import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Worked:l}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsxs)(r.p,{children:[`Real tables are wide. An `,(0,n.jsx)(r.code,{children:`orders`}),` table in production might have 80 columns, and a report needs four of them. Picking columns is the most basic thing SQL does, and naming the results well is what makes a query readable to the next person.`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`// map: same number of items, new shape
customers.map(c => ({
  name: c.name,
  country: c.country,
}));
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-sql`,children:`-- SELECT: same number of rows, new shape
SELECT name, country
FROM customers;
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`map`}),` runs your function in order, one element at a time. SQL has no "one at a time" you can see: it describes the output for `,(0,n.jsx)(r.strong,{children:`every row at once`}),`, and the engine is free to process rows in any order, or in parallel.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`Columns, not rows`}),`
`,(0,n.jsx)(l,{id:`rows`}),`
`,(0,n.jsx)(r.h2,{children:`Computing new columns`}),`
`,(0,n.jsxs)(r.p,{children:[`You can put an expression in the `,(0,n.jsx)(r.code,{children:`SELECT`}),` list, and SQL evaluates it for every row. `,(0,n.jsx)(r.code,{children:`AS`}),` gives the result a name.`]}),`
`,(0,n.jsx)(l,{id:`computed`}),`
`,(0,n.jsx)(o,{kind:`dialect`,children:(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`AS`}),` is optional: `,(0,n.jsx)(r.code,{children:`price * 1.18 price_with_vat`}),` also works. Write it anyway. It makes the query easier to read, and a missing comma can't quietly turn into an alias.`]})}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsx)(s,{id:`name-price`}),`
`,(0,n.jsx)(s,{id:`cents`}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[`Renaming columns is a big part of the `,(0,n.jsx)(r.strong,{children:`staged`}),` layer in a pipeline. Sources call the same thing `,(0,n.jsx)(r.code,{children:`cust_id`}),`, `,(0,n.jsx)(r.code,{children:`CustomerID`}),` and `,(0,n.jsx)(r.code,{children:`customer`}),`. Staging models give everything one consistent snake_case name, so every later query can rely on it.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};