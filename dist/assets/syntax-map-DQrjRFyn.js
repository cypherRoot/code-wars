import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Worked:l}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsxs)(r.p,{children:[`Pipelines, Airflow DAGs, data-quality checks and most glue code in data engineering are written in Python. You already know how to program, so you don't need to learn programming again. You need a `,(0,n.jsx)(r.strong,{children:`translation table`}),` and a list of the traps where a JS reflex gives the wrong answer.`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`const city = "Mumbai";
let orders = 3;
console.log(\`\${city}: \${orders} orders\`);
if (orders > 2) {
  console.log("busy");
}
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-python`,children:`city = "Mumbai"
orders = 3
print(f"{city}: {orders} orders")
if orders > 2:
    print("busy")
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[`Python has no `,(0,n.jsx)(r.code,{children:`const`}),`: every name can be reassigned, and by convention `,(0,n.jsx)(r.code,{children:`UPPER_CASE`}),` names are treated as constants. `,(0,n.jsx)(r.strong,{children:`Indentation is syntax`}),`, not style. A block starts with a line ending in `,(0,n.jsx)(r.code,{children:`:`}),` and continues for as long as lines are indented under it.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`Values and printing`}),`
`,(0,n.jsx)(l,{id:`basics`}),`
`,(0,n.jsxs)(r.p,{children:[`| JavaScript | Python |
|---|---|
| `,(0,n.jsx)(r.code,{children:`null`}),`, `,(0,n.jsx)(r.code,{children:`undefined`}),` | `,(0,n.jsx)(r.code,{children:`None`}),` |
| `,(0,n.jsx)(r.code,{children:`true`}),`, `,(0,n.jsx)(r.code,{children:`false`}),` | `,(0,n.jsx)(r.code,{children:`True`}),`, `,(0,n.jsx)(r.code,{children:`False`}),` |
| `,(0,n.jsx)(r.code,{children:`&&`}),`, `,(0,n.jsx)(r.code,{children:`\\|\\|`}),`, `,(0,n.jsx)(r.code,{children:`!`}),` | `,(0,n.jsx)(r.code,{children:`and`}),`, `,(0,n.jsx)(r.code,{children:`or`}),`, `,(0,n.jsx)(r.code,{children:`not`}),` |
| `,(0,n.jsx)(r.code,{children:`===`}),`, `,(0,n.jsx)(r.code,{children:`!==`}),` | `,(0,n.jsx)(r.code,{children:`==`}),`, `,(0,n.jsx)(r.code,{children:`!=`}),` |
| `,(0,n.jsx)(r.code,{children:`x++`}),` | `,(0,n.jsx)(r.code,{children:`x += 1`}),` |
| `,(0,n.jsx)(r.code,{children:`// comment`}),` | `,(0,n.jsx)(r.code,{children:`# comment`}),` |
| `,(0,n.jsx)(r.code,{children:`console.log(a, b)`}),` | `,(0,n.jsx)(r.code,{children:`print(a, b)`}),` |`]}),`
`,(0,n.jsx)(r.h2,{children:`Numbers behave a little differently`}),`
`,(0,n.jsx)(l,{id:`arithmetic`}),`
`,(0,n.jsx)(o,{kind:`tip`,children:(0,n.jsxs)(r.p,{children:[`Python integers never overflow. `,(0,n.jsx)(r.code,{children:`2 ** 100`}),` is exact, unlike JavaScript's `,(0,n.jsx)(r.code,{children:`Number`}),`. Floats are the same IEEE doubles as JS, so `,(0,n.jsx)(r.code,{children:`0.1 + 0.2`}),` is still `,(0,n.jsx)(r.code,{children:`0.30000000000000004`}),`. That's why money is often stored as integer cents.`]})}),`
`,(0,n.jsx)(r.h2,{children:`No silent type conversion`}),`
`,(0,n.jsx)(l,{id:`no-coercion`}),`
`,(0,n.jsxs)(r.p,{children:[`This is a feature for data work. When a CSV hands you the text `,(0,n.jsx)(r.code,{children:`"42"`}),`, Python makes you decide whether it's an `,(0,n.jsx)(r.code,{children:`int`}),`, a `,(0,n.jsx)(r.code,{children:`float`}),` or really text. Nothing gets coerced silently.`]}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsx)(s,{id:`receipt`}),`
`,(0,n.jsx)(s,{id:`parse-number`}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[`"It's text but should be a number" is the most common bug in raw data. Staging code in Python or SQL exists largely to `,(0,n.jsx)(r.strong,{children:`cast`}),` every column to its proper type exactly once, so nothing downstream has to wonder.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};