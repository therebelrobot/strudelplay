# Quick Start Guide - Test Your Workflow

Follow these steps to test the automated Strudel workflow:

## Step 1: Initial Setup (First Time Only)

```bash
# Install dependencies and set up everything
npm install
npm run setup
```

## Step 2: Start the Development Environment

Open a terminal and run one of these:

```bash
# Watch all .strudel and .str files (recommended)
npm run dev:watch

# Or watch just a specific file
npm run dev:file patterns/example.strudel
```

You should see:
```
✓ Connected to Strudel MCP server
✓ Strudel initialized
✓ Watcher is ready and monitoring for changes
```

## Step 3: Test the Auto-Update

### Test 1: Basic Pattern (`.strudel` file)

1. Open [`patterns/example.strudel`](patterns/example.strudel)
2. The pattern should start playing automatically
3. Try this: Change line 8:
   ```javascript
   setcpm(90/4)  // Change this to 120/4
   ```
4. Save the file (Cmd+S / Ctrl+S)
5. **Listen** - the tempo should change instantly!

### Test 2: Different Extension (`.str` file)

1. Open [`patterns/techno.str`](patterns/techno.str)
2. Save it (even without changes)
3. Watch the terminal:
   ```
   ℹ File changed: patterns/techno.str
   ♪ Updating pattern in Strudel...
   ✓ Pattern updated
   ```
4. The techno pattern should now be playing!

### Test 3: Live Editing

Let's modify the techno pattern in real-time:

1. In [`patterns/techno.str`](patterns/techno.str), find line 10:
   ```javascript
   sound("~ hh ~ hh").fast(2),
   ```

2. Change it to:
   ```javascript
   sound("hh*8"),  // Faster hi-hats!
   ```

3. Save and hear the difference immediately

4. Try another change on line 7:
   ```javascript
   sound("bd*4"),  // Change to: sound("bd*2 ~ bd*2")
   ```

5. Save and listen - the kick pattern changes!

### Test 4: Adding Effects

1. In [`patterns/example.strudel`](patterns/example.strudel), uncomment lines 31-33:
   ```javascript
   .stack(
     note("c2 c2 g2 f2").sound("sawtooth").lpf(800)
   )
   ```

2. Save - you should hear a bass line added!

3. Uncomment lines 36-41 for melody:
   ```javascript
   .stack(
     note("c4 e4 g4 e4 c4 e4 g4 c5")
       .sound("piano")
       .slow(2)
   )
   ```

4. Save - melody added!

5. Uncomment lines 44-46 for effects:
   ```javascript
   .room(0.5)
   .delay(0.25)
   ```

6. Save - hear the reverb and delay!

## Step 4: Test Custom Samples (Optional)

If you have custom audio samples:

1. **Stop the current session** (Ctrl+C)

2. **Add your samples** to the `samples/` folder:
   ```
   samples/
   └── drums/
       ├── kick.wav
       └── snare.wav
   ```

3. **Start with custom samples**:
   ```bash
   npm run dev:full
   ```

4. **Create a new pattern** using your samples:
   ```javascript
   // custom-drums.strudel
   setcpm(90/4)
   samples('http://localhost:5555', 'http://localhost:8000')
   sound("drums/kick drums/snare")
   ```

5. Save and hear your custom samples!

## Step 5: Create Your Own Pattern

1. **Create a new file** in `patterns/`:
   ```bash
   touch patterns/my-song.strudel
   ```

2. **Add your pattern**:
   ```javascript
   setcpm(100/4)
   samples('http://localhost:5555')
   
   sound("bd sd bd sd")
   ```

3. **Save** - it starts playing automatically!

4. **Keep editing** - every save updates the browser instantly

## Troubleshooting

### Nothing happens when I save

- Check the terminal for errors
- Ensure the file has `.strudel` or `.str` extension
- Verify the watcher is running (look for "Watcher is ready")

### Pattern has errors

- Check the terminal for syntax errors
- Verify your Strudel code is valid
- Try the example files first to confirm the workflow works

### "Address already in use" error

If you see errors about ports 5555 or 8000 being in use:

```bash
# Clean up lingering processes
npm run cleanup
# or
npm run stop

# Then restart
npm run dev:watch
```

This happens when the servers don't shut down properly. The cleanup script kills any lingering processes.

### Connection errors

- Make sure the MCP server is built:
  ```bash
  npm run setup:mcp
  ```
- Check `.env` has correct `STRUDEL_MCP_PATH`

## What's Happening Behind the Scenes

```
You save file
     ↓
Chokidar detects change
     ↓
File content is read
     ↓
Sent to MCP Client
     ↓
MCP Client talks to Strudel MCP Server
     ↓
Browser updates via Puppeteer
     ↓
You hear the changes!
```

## Next Steps

- Read [`WORKFLOW.md`](WORKFLOW.md) for detailed workflow information
- Check [`README.md`](README.md) for full documentation
- Explore more Strudel patterns at https://strudel.cc/

## Quick Commands Reference

```bash
npm run dev:watch                    # Start development (all files)
npm run dev:file <path>              # Watch specific file only
npm run dev:full                     # With custom samples
npm run dev                          # Watcher only (all files)
npm run init                         # Initialize Strudel browser
npm run sampler                      # Just the sampler
npm run samples:serve                # Just custom samples server
```

### Examples

```bash
# Watch all files with sampler
npm run dev:watch

# Watch only the techno pattern
npm run dev:file patterns/techno.str

# Watch a specific file with sampler running
npm run sampler &
npm run dev:file patterns/my-song.strudel
```

Happy live coding! 🎵