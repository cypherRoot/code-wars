import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Exercise:s,JsBridge:c,Worked:l}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Exercise`,!0),c||a(`JsBridge`,!0),l||a(`Worked`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.h2,{children:`Why it matters`}),`
`,(0,n.jsxs)(r.p,{children:[`Almost all data in a pipeline passes through these four shapes at some point. A JSON API response becomes a `,(0,n.jsx)(r.strong,{children:`list of dicts`}),`. A database row comes back as a `,(0,n.jsx)(r.strong,{children:`tuple`}),`. "Have I seen this ID before?" is a `,(0,n.jsx)(r.strong,{children:`set`}),`. You'll use them all daily.`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-js`,children:`const amounts = [114.49, 29.99];        // Array
const customer = { name: "Priya" };     // Object
const seen = new Set([101, 102]);       // Set
amounts.push(42.5);
customer.city ?? "unknown";
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-python`,children:`amounts = [114.49, 29.99]               # list
customer = {"name": "Priya"}            # dict
seen = {101, 102}                       # set
amounts.append(42.5)
customer.get("city", "unknown")
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[`Dict keys need quotes (`,(0,n.jsx)(r.code,{children:`{"name": ...}`}),`), and you read them with `,(0,n.jsx)(r.code,{children:`customer["name"]`}),`, never `,(0,n.jsx)(r.code,{children:`customer.name`}),`. Reading a missing key with brackets `,(0,n.jsx)(r.strong,{children:`raises an error`}),` instead of giving `,(0,n.jsx)(r.code,{children:`undefined`}),`. Also, `,(0,n.jsx)(r.code,{children:`{}`}),` is an empty `,(0,n.jsx)(r.strong,{children:`dict`}),`. An empty set is `,(0,n.jsx)(r.code,{children:`set()`}),`.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`Lists`}),`
`,(0,n.jsx)(l,{id:`lists`}),`
`,(0,n.jsxs)(r.p,{children:[`Slicing `,(0,n.jsx)(r.code,{children:`xs[start:stop]`}),` takes items from `,(0,n.jsx)(r.code,{children:`start`}),` up to, `,(0,n.jsx)(r.strong,{children:`but not including`}),`, `,(0,n.jsx)(r.code,{children:`stop`}),`. Leave either side out to go to the edge: `,(0,n.jsx)(r.code,{children:`xs[:3]`}),` gives the first three, `,(0,n.jsx)(r.code,{children:`xs[-2:]`}),` the last two.`]}),`
`,(0,n.jsx)(r.h2,{children:`Dicts`}),`
`,(0,n.jsx)(l,{id:`dict-get`}),`
`,(0,n.jsx)(r.h2,{children:`Sets and tuples`}),`
`,(0,n.jsx)(l,{id:`sets-tuples`}),`
`,(0,n.jsxs)(r.p,{children:[`| Need | Use |
|---|---|
| An ordered sequence you'll add to | `,(0,n.jsx)(r.code,{children:`list`}),` |
| Look things up by a key | `,(0,n.jsx)(r.code,{children:`dict`}),` |
| A fixed record, like a row from a database | `,(0,n.jsx)(r.code,{children:`tuple`}),` |
| Uniqueness, or fast "have I seen it?" checks | `,(0,n.jsx)(r.code,{children:`set`}),` |`]}),`
`,(0,n.jsx)(r.h2,{children:`The aliasing trap`}),`
`,(0,n.jsx)(l,{id:`aliasing`}),`
`,(0,n.jsx)(r.h2,{children:`Your turn`}),`
`,(0,n.jsxs)(r.p,{children:[`These exercises use a `,(0,n.jsx)(r.strong,{children:`function`}),` with `,(0,n.jsx)(r.code,{children:`def`}),`. It's the next module's topic, but the shape is simple: `,(0,n.jsx)(r.code,{children:`def name(args):`}),`, an indented body, and `,(0,n.jsx)(r.code,{children:`return`}),` to hand back the value. The checker calls your function with several inputs.`]}),`
`,(0,n.jsx)(s,{id:`last-two`}),`
`,(0,n.jsx)(s,{id:`country-of`}),`
`,(0,n.jsx)(o,{kind:`de`,children:(0,n.jsxs)(r.p,{children:[`Real API records are messy: optional fields go missing, and keys arrive as `,(0,n.jsx)(r.code,{children:`null`}),`. Data engineers read nested JSON defensively with `,(0,n.jsx)(r.code,{children:`.get()`}),` and defaults, then validate the shape with a library such as Pydantic, which comes later in P8.`]})})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};