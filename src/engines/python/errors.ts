/** Beginner hints for common Python errors, written for someone coming from JavaScript. */
export function translatePyError(type: string, message: string): string | undefined {
  if (type === 'NameError') {
    const m = message.match(/name '(\w+)' is not defined/);
    const name = m?.[1];
    if (name === 'true' || name === 'false') return `Python booleans are capitalised: True and False.`;
    if (name === 'null' || name === 'undefined') return `Python has no ${name} — use None.`;
    if (name === 'console') return 'Use print(...) instead of console.log(...).';
    if (name === 'let' || name === 'const' || name === 'var') return `Python has no ${name} — just write name = value.`;
    return `"${name}" hasn't been defined yet. Check the spelling, and that it's assigned before this line.`;
  }
  if (type === 'IndentationError' || type === 'TabError') {
    return 'Python uses indentation instead of { }. Every line in a block must be indented the same amount (4 spaces), and a line ending in ":" needs an indented block after it.';
  }
  if (type === 'SyntaxError') {
    if (/expected ':'/.test(message)) return 'Lines that start a block (if, for, while, def) must end with a colon ":".';
    if (/invalid syntax/.test(message))
      return 'Python couldn’t parse this line. Coming from JS? Check for { } braces, semicolons, ===, && / || (use and / or), or a missing colon.';
    if (/unterminated string/.test(message)) return 'A string is missing its closing quote.';
    return 'Python couldn’t parse this line — look closely at the caret (^) position.';
  }
  if (type === 'TypeError') {
    if (/can only concatenate str/.test(message) || /unsupported operand type\(s\) for \+: 'int' and 'str'/.test(message))
      return 'Python won’t mix text and numbers with +. Convert first: str(n), or use an f-string: f"total: {n}".';
    if (/object is not callable/.test(message)) return 'You used ( ) on something that isn’t a function. Did a variable shadow a function name?';
    if (/missing \d+ required positional argument/.test(message)) return 'The function was called with fewer arguments than it needs.';
    if (/not subscriptable/.test(message)) return 'You used [ ] on a value that doesn’t support indexing (for example a number or None).';
  }
  if (type === 'KeyError') return 'That key isn’t in the dict. Use d.get(key) to get None instead of an error, or check with `key in d`.';
  if (type === 'IndexError') return 'The index is past the end of the list. Lists start at 0, so the last item is at len(xs) - 1.';
  if (type === 'AttributeError') {
    if (/'list' object has no attribute 'push'/.test(message)) return 'Python lists use .append(x), not .push(x).';
    if (/has no attribute 'length'/.test(message)) return 'Use len(x) instead of x.length.';
    return 'That value doesn’t have this method or attribute. Check the type with type(x).';
  }
  if (type === 'ZeroDivisionError') return 'Division by zero. Unlike JS (which gives Infinity), Python raises an error.';
  if (type === 'RecursionError') return 'A function kept calling itself without stopping. Check your base case.';
  return undefined;
}
