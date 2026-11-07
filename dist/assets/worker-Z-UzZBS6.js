const e=`https://cdn.jsdelivr.net/pyodide/v314.0.7/full/`;let t=null,n=null;const r=String.raw`
import sys, io, json, math, traceback, builtins, time

class _DfCap(io.TextIOBase):
    def __init__(self, limit):
        self.parts = []; self.n = 0; self.limit = limit; self.truncated = False
    def writable(self): return True
    def write(self, s):
        if self.truncated: return len(s)
        self.n += len(s)
        if self.n > self.limit:
            self.truncated = True
            self.parts.append(s[: max(0, self.limit - (self.n - len(s)))])
            raise RuntimeError("Output limit reached (200 KB). Is something printing in an endless loop?")
        self.parts.append(s)
        return len(s)
    def value(self): return "".join(self.parts)

def _df_no_input(*a, **k):
    raise RuntimeError("input() isn't available here — put the value in a variable instead.")

def _df_err(e):
    tb = traceback.extract_tb(e.__traceback__)
    user = [f for f in tb if f.filename == "<your code>"]
    line = user[-1].lineno if user else getattr(e, "lineno", None)
    lines = ["Traceback (most recent call last):"]
    for f in user:
        lines.append(f'  line {f.lineno}' + (f', in {f.name}' if f.name != '<module>' else ''))
        if f.line: lines.append('    ' + f.line)
    if isinstance(e, SyntaxError):
        lines = [f"  line {e.lineno}", "    " + (e.text or "").rstrip()]
        if e.offset: lines.append("    " + " " * (e.offset - 1) + "^")
    lines.append(f"{type(e).__name__}: {e}")
    return {"type": type(e).__name__, "message": str(e) if not isinstance(e, SyntaxError) else (e.msg or str(e)), "line": line, "traceback": "\n".join(lines)}

def _df_same(a, b):
    if isinstance(a, float) or isinstance(b, float):
        try: return math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-9)
        except TypeError: return False
    if type(a) is not type(b) and not (isinstance(a, (int, float)) and isinstance(b, (int, float))):
        return False
    return a == b

def _df_run(src, tests_json, limit):
    t0 = time.perf_counter()
    tests = json.loads(tests_json) if tests_json else {}
    cap = _DfCap(limit)
    ns = {"__name__": "__main__", "input": _df_no_input}
    old = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = cap
    out = {}
    try:
        try:
            exec(compile(src, "<your code>", "exec"), ns)
        except BaseException as e:
            out["error"] = _df_err(e)
        if "error" not in out and tests.get("cases"):
            results = []
            for c in tests["cases"]:
                r = {"call": c["call"], "expected": "", "got": None, "pass": False}
                try:
                    exp = eval(c["expect"], {})
                    r["expected"] = repr(exp)
                    got = eval(compile(c["call"], "<your code>", "eval"), ns)
                    r["got"] = repr(got)
                    r["pass"] = bool(_df_same(got, exp))
                except BaseException as e:
                    r["error"] = f"{type(e).__name__}: {e}"
                results.append(r)
            out["cases"] = results
    finally:
        sys.stdout, sys.stderr = old
    out["stdout"] = cap.value()
    out["truncated"] = cap.truncated
    if "stdout" in tests and tests["stdout"] is not None and "error" not in out:
        out["stdoutPass"] = out["stdout"].rstrip() == tests["stdout"].rstrip()
    out["elapsedMs"] = (time.perf_counter() - t0) * 1000
    return json.dumps(out)
`;async function i(i=[]){if(t)return t;n||=(async()=>{let n=await(await import(
/* @vite-ignore */
`${e}pyodide.mjs`)).loadPyodide({indexURL:e});return n.runPython(r),t=n,n})();let a=await n;return i.length&&await a.loadPackage(i),a}function a(e){self.postMessage(e)}self.onmessage=async e=>{let t=e.data;if(t.type===`init`)try{a({type:`ready`,version:(await i(t.packages)).version})}catch(e){a({type:`load-error`,message:e instanceof Error?e.message:String(e)})}else if(t.type===`run`){let e=(await i(t.packages)).globals.get(`_df_run`)(t.code,t.tests?JSON.stringify(t.tests):``,2e5);a({type:`result`,id:t.id,output:JSON.parse(e)})}};