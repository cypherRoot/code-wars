import{t as e}from"./jsx-runtime-Wy9s6hX0.js";import{n as t}from"./lib-rkeVO_fE.js";var n=e();function r(e){let r={code:`code`,em:`em`,h2:`h2`,p:`p`,pre:`pre`,strong:`strong`,...t(),...e.components},{Breaks:i,Callout:o,Checklist:s,JsBridge:c}=r;return i||a(`Breaks`,!0),o||a(`Callout`,!0),s||a(`Checklist`,!0),c||a(`JsBridge`,!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(r.p,{children:`Most of this course runs in your browser. Real data work happens on your own machine, though, so this lab sets up the tools you'll grow into. Do it once, at your own pace. Your ticks are saved, so you can stop halfway.`}),`
`,(0,n.jsx)(r.h2,{children:`Why these four tools`}),`
`,(0,n.jsxs)(r.p,{children:[`| Tool | What it's for | The JS world equivalent |
|---|---|---|
| `,(0,n.jsx)(r.strong,{children:`Terminal`}),` | Running everything else | Same terminal you run `,(0,n.jsx)(r.code,{children:`npm`}),` in |
| `,(0,n.jsx)(r.strong,{children:`Git`}),` | Versioning code: SQL models, pipelines, configs | Same Git |
| `,(0,n.jsx)(r.strong,{children:`uv`}),` | Installing Python and managing project dependencies | `,(0,n.jsx)(r.code,{children:`nvm`}),` + `,(0,n.jsx)(r.code,{children:`npm`}),` in one tool |
| `,(0,n.jsx)(r.strong,{children:`DuckDB`}),` | A fast SQL engine that reads files directly | No real equivalent; think "SQLite for analytics" |`]}),`
`,(0,n.jsxs)(c,{children:[(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`# JavaScript project
npm init -y
npm install lodash
node index.js
`})}),(0,n.jsx)(r.pre,{children:(0,n.jsx)(r.code,{className:`language-bash`,children:`# Python project with uv
uv init my-project
uv add pandas
uv run main.py
`})}),(0,n.jsx)(i,{children:(0,n.jsxs)(r.p,{children:[`Python has no `,(0,n.jsx)(r.code,{children:`node_modules`}),` folder in your project. uv creates a hidden `,(0,n.jsx)(r.code,{children:`.venv`}),` folder that holds the environment, and `,(0,n.jsx)(r.code,{children:`uv run`}),` uses it for you. If you call plain `,(0,n.jsx)(r.code,{children:`python`}),` outside `,(0,n.jsx)(r.code,{children:`uv run`}),`, you might get a `,(0,n.jsx)(r.em,{children:`different`}),` Python that doesn't have your packages.`]})})]}),`
`,(0,n.jsx)(r.h2,{children:`The lab`}),`
`,(0,n.jsx)(r.p,{children:`Work through the list top to bottom. Each step has a command to paste and a way to check that it worked.`}),`
`,(0,n.jsx)(s,{}),`
`,(0,n.jsx)(o,{kind:`tip`,children:(0,n.jsxs)(r.p,{children:[`If a command fails, read the `,(0,n.jsx)(r.strong,{children:`last`}),` line of the error first. That's usually the real problem, such as "command not found" or "permission denied". Paste the error into a search engine before you change anything.`]})}),`
`,(0,n.jsx)(o,{kind:`dialect`,children:(0,n.jsxs)(r.p,{children:[`This app's SQL runs on `,(0,n.jsx)(r.strong,{children:`DuckDB-WASM`}),` (DuckDB compiled to run in the browser). The `,(0,n.jsx)(r.code,{children:`duckdb`}),` you just installed is the same engine, so anything you write here works there too. Most of it also works in PostgreSQL. When it doesn't, the lesson says so.`]})}),`
`,(0,n.jsxs)(r.p,{children:[`When every box is ticked, take the short quiz below. Then you're ready for `,(0,n.jsx)(r.strong,{children:`S0`}),`.`]})]})}function i(e={}){let{wrapper:i}={...t(),...e.components};return i?(0,n.jsx)(i,{...e,children:(0,n.jsx)(r,{...e})}):r(e)}function a(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{i as default};