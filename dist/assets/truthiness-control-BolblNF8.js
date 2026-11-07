import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Parsons:l,Worked:u}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Parsons`,!0),u||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsx)(r.p,{children:`Pipeline code is full of decisions: skip the record if it's missing a field, retry if the API failed, bucket the amount. If you get truthiness wrong, records disappear without an error. Python's rules are mostly like JavaScript's, with one important exception.`}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`if (items.length > 0) { ... }   // [] is truthy in JS!
for (const o of orders) { ... }
for (let i = 0; i < 3; i++) { ... }
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-python`,children:`if items:          # [] is falsy in Python
    ...
for o in orders:
    ...
for i in range(3):
    ...
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.strong,{children:`Empty collections are falsy in Python`}),`, so `,(0,n.jsx)(r.code,{children:`if items:`}),` means "if the list isn't empty". In JS, `,(0,n.jsx)(r.code,{children:`[]`}),` and `,(0,n.jsx)(r.code,{children:`{}`}),` are truthy. Python also has no C-style `,(0,n.jsx)(r.code,{children:`for (;;)`}),` loop: you loop over things directly, and use `,(0,n.jsx)(r.code,{children:`range()`}),` when you need numbers.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`Truthiness`}),`
`,(0,n.jsx)(u,{id:`empty-list`}),`
`,(0,n.jsxs)(r.p,{children:[`| Value | JavaScript | Python |
|---|---|---|
| `,(0,n.jsx)(r.code,{children:`[]`}),` / `,(0,n.jsx)(r.code,{children:`{}`}),` | truthy | `,(0,n.jsx)(r.strong,{children:`falsy`}),` |
| `,(0,n.jsx)(r.code,{children:`0`}),`, `,(0,n.jsx)(r.code,{children:`""`}),` | falsy | falsy |
| `,(0,n.jsx)(r.code,{children:`null`}),` / `,(0,n.jsx)(r.code,{children:`None`}),` | falsy | falsy |
| `,(0,n.jsx)(r.code,{children:`"0"`}),`, `,(0,n.jsx)(r.code,{children:`"false"`}),` | truthy | truthy |`]}),`
`,(0,n.jsx)(r.h2,{children:`Loops`}),`
`,(0,n.jsx)(u,{id:`loops`}),`
`,(0,n.jsx)(r.h2,{children:`None checks and defaults`}),`
`,(0,n.jsx)(u,{id:`none-checks`}),`
`,(0,n.jsx)(r.h2,{children:`Put it in order`}),`
`,(0,n.jsx)(l,{id:`total-delivered`}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsx)(s,{id:`size-label`}),`
`,(0,n.jsx)(s,{id:`count-active`}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[(0,n.jsx)(r.code,{children:`count_active`}),` is a tiny `,(0,n.jsx)(r.strong,{children:`data-quality rule`}),`: "missing counts as not active". Real pipelines write such rules down explicitly and test them, because silently treating `,(0,n.jsx)(r.code,{children:`None`}),` as `,(0,n.jsx)(r.code,{children:`True`}),` (or dropping it) changes the numbers on someone's dashboard.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};