# Auto-completion Bug Reproduction

This directory contains a minimal reproduction test for the auto-completion bug in the Strudel MCP server.

## Problem

The `write` tool adds extra closing parentheses to patterns due to CodeMirror's auto-pairing feature being triggered by keyboard typing simulation.

## Test File

- `test-autocompletion-bug.js` - Minimal reproduction test

## How to Run

1. **Ensure the MCP server is built:**
   ```bash
   cd mcp-server
   npm install
   npm run build
   cd ..
   ```

2. **Run the test:**
   ```bash
   node test-autocompletion-bug.js
   ```

## Expected Output

The test will fail with output similar to:

```
🧪 Auto-completion Bug Reproduction Test

============================================================

📡 Connecting to MCP server...
✅ Connected

🎵 Initializing Strudel browser...
✅ Initialized

------------------------------------------------------------

Test Pattern: "sound("bd hh")"
Expected length: 16 characters
Actual length: 17 characters
❌ FAIL - Pattern mismatch!

Expected:
"sound("bd hh")"

Actual:
"sound("bd hh"))"

⚠️  Extra characters added: ")"
   Position: after character 16

------------------------------------------------------------
...

📊 Test Summary:
   ✅ Passed: 0/4
   ❌ Failed: 4/4

🐛 Bug confirmed: Auto-completion is adding extra characters

Root cause: page.keyboard.type() triggers CodeMirror auto-pairing

Suggested fix: Use direct CodeMirror state manipulation instead
See: https://codemirror.net/docs/ref/#state.EditorState.dispatch
```

## Root Cause

In `mcp-server/src/StrudelController.ts:47`:

```typescript
await this.page.keyboard.type(pattern);  // ← Problem
```

Using `page.keyboard.type()` simulates actual keyboard input character-by-character, which triggers CodeMirror's auto-pairing feature. When it detects an opening parenthesis being typed, it automatically inserts the closing parenthesis.

## Proposed Fix

Replace keyboard typing with direct CodeMirror state manipulation:

```typescript
async writePattern(pattern: string): Promise<string> {
  if (!this.page) throw new Error('Not initialized');

  await this.page.evaluate((patternContent) => {
    const editor = (window as any).view;
    if (editor && editor.state && editor.dispatch) {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: patternContent
        }
      });
    }
  }, pattern);

  return `Pattern written (${pattern.length} chars)`;
}
```

This approach:
- ✅ Bypasses auto-completion entirely  
- ✅ Guarantees exact content
- ✅ Is faster than typing simulation
- ✅ Works with any pattern complexity

## Test Cases

The test validates these patterns:

1. `sound("bd hh")` - Basic function call
2. `sound("bd").fast(2)` - Method chaining
3. `stack(sound("bd"), sound("hh"))` - Nested calls
4. `note("c4 e4 g4").sound("piano")` - Complex chaining

All of these fail with the current implementation due to extra closing parentheses being added.

## Environment

- **Node.js**: v20.x or higher
- **Playwright**: Chromium
- **Strudel**: https://strudel.cc/
- **MCP SDK**: @modelcontextprotocol/sdk

## Related Files

- `mcp-server/src/StrudelController.ts` - Contains the buggy `writePattern()` method
- `scripts/mcp-client.ts` - Client implementation (workaround with `replace` tool)
- `GITHUB_ISSUE.md` - Full bug report for upstream