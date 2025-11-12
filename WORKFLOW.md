# Strudel Development Workflow

This guide explains how to use the automated Strudel workflow for this repository.

## Quick Start

```bash
# First time setup (already done if you ran npm install)
npm run setup

# Start development mode with file watching and sampler
npm run dev:all
```

## How It Works

### Architecture Overview

```
Your .strudel file changes
        ↓
File watcher detects change (chokidar)
        ↓
Pattern content is read
        ↓
MCP Client connects to Strudel MCP server
        ↓
Pattern is sent via MCP SDK
        ↓
Strudel browser updates automatically
        ↓
You hear your changes instantly!
```

### File Watcher

The file watcher (`scripts/watcher.ts`) monitors all `.strudel` files in your project:

- **Watches**: All `*.strudel` files recursively
- **Ignores**: `node_modules/`, `.git/`, `dist/`
- **Triggers**: On file save or creation
- **Action**: Sends pattern to Strudel MCP server

### MCP Integration

The MCP client (`scripts/mcp-client.ts`) provides:

- **Connection**: Spawns and communicates with the Strudel MCP server
- **Initialization**: Sets up the Strudel browser environment
- **Pattern Updates**: Sends your code to the browser
- **Playback Control**: Can start/stop playback programmatically

## Available Commands

### Development

```bash
# Watch for file changes only
npm run dev

# Run sampler + file watcher (recommended)
npm run dev:watch

# Run sampler + custom samples + file watcher
npm run dev:full

# Just the sampler server
npm run sampler

# Just the custom samples server
npm run samples:serve

# Initialize Strudel browser
npm run init
```

### Setup

```bash
# Complete setup (runs all setup steps)
npm run setup

# Individual setup steps
npm run setup:submodule  # Initialize git submodules
npm run setup:mcp        # Install & build MCP server
npm run setup:env        # Create .env file
```

## Typical Workflow

### Starting Your Session

1. **Open terminal** and start the dev environment:
   ```bash
   npm run dev:watch
   ```

2. **Wait for initialization**:
   - MCP server connects
   - Strudel browser launches
   - File watcher starts monitoring

3. **Look for these messages**:
   ```
   ✓ Connected to Strudel MCP server
   ✓ Strudel initialized
   ✓ Watcher is ready and monitoring for changes
   ```

### Coding Your Patterns

1. **Create or open a `.strudel` file**:
   ```bash
   # Example: first_notes.strudel
   ```

2. **Write your pattern**:
   ```javascript
   setcpm(90/4)
   samples('http://localhost:5555')
   sound("bd bd hh bd rim bd hh bd")
   ```

3. **Save the file** (Cmd+S / Ctrl+S)

4. **Watch the terminal**:
   ```
   ℹ File changed: first_notes.strudel
   ♪ Updating pattern in Strudel...
   ✓ Pattern updated
   ```

5. **Your pattern is now playing in Strudel!**

### Iterating

- **Make changes** → **Save** → **Hear updates instantly**
- No need to manually copy-paste into the browser
- No need to refresh or reload
- Just code and save!

### Stopping

Press **Ctrl+C** in the terminal to stop:
- File watcher shuts down gracefully
- MCP connection closes
- Sampler stops (if running)

## File Organization

### Recommended Structure

```
strudelplay/
├── patterns/           # Organize your patterns here
│   ├── drums/
│   │   └── kick.strudel
│   ├── melodies/
│   │   └── lead.strudel
│   └── experiments/
│       └── test.strudel
├── first_notes.strudel # Or keep them at root
└── my_song.strudel
```

### Pattern Files

Any file with `.strudel` extension will be watched. You can:

- ✅ Organize in subdirectories
- ✅ Use any naming convention
- ✅ Have multiple patterns
- ✅ Switch between files freely

The watcher will update whichever file you save!

## Tips & Tricks

### Multiple Patterns

Work on different patterns by just switching files:

```bash
# Edit drums pattern
vim patterns/drums.strudel
# Save → Updates in browser

# Switch to melody
vim patterns/melody.strudel
# Save → Updates in browser
```

### Quick Testing

Use `npm run init` to quickly test if MCP server is working:

```bash
npm run init
# Should see:
# ✓ Connected to Strudel MCP server
# ✓ Strudel initialized successfully!
```

### Debugging

If something isn't working:

1. **Check MCP server**:
   ```bash
   cd mcp-server
   npm run build
   ```

2. **Verify .env**:
   ```bash
   cat .env
   # Should have: STRUDEL_MCP_PATH=./mcp-server/dist/index.js
   ```

3. **Restart watcher**:
   ```bash
   # Ctrl+C to stop, then:
   npm run dev:all
   ```

### Performance

- **Large files**: The watcher handles files of any size
- **Many patterns**: Only the changed file is sent
- **Network**: Uses local MCP connection (fast!)

## Customization

### Change Sampler Port

Edit `.env`:
```env
PORT=6000  # Use your preferred port
```

Then restart:
```bash
npm run dev:all
```

### Different MCP Server

If using a custom MCP server location:

`.env`:
```env
STRUDEL_MCP_PATH=/path/to/your/mcp-server
```

### Auto-play on Update

The current setup updates the pattern but doesn't auto-play. To add auto-play, modify `scripts/watcher.ts`:

```typescript
await mcpClient.writePattern(content);
await mcpClient.play(); // Add this line
```

## Troubleshooting

### "Cannot find module" errors

These TypeScript errors in the IDE are normal before running:
```bash
npm install
```

They should disappear after installation and restarting VS Code.

### Watcher not detecting changes

- Ensure file has `.strudel` extension
- Check file is not in an ignored directory
- Verify file is within the project directory

### MCP server connection failed

- Verify submodule is initialized: `git submodule status`
- Rebuild MCP server: `npm run setup:mcp`
- Check `.env` has correct `STRUDEL_MCP_PATH`

### Pattern not updating in browser

- Ensure Strudel browser window is open
- Check terminal for error messages
- Verify pattern syntax is valid
- Try running `npm run init` to reset

## Advanced Usage

### Programmatic Control

You can extend the MCP client to add more features:

```typescript
// In scripts/watcher.ts, you can add:
await mcpClient.pause();  // Pause playback
await mcpClient.play();   // Resume playback
```

### Custom Scripts

Create your own scripts in `scripts/`:

```typescript
// scripts/my-workflow.ts
import { StrudelMCPClient } from './mcp-client.js';

const client = new StrudelMCPClient();
await client.connect();
await client.init();
// Your custom workflow...
```

Run with:
```bash
tsx scripts/my-workflow.ts
```

## Getting Help

- **Strudel Docs**: https://strudel.cc/
- **MCP Server**: https://github.com/williamzujkowski/strudel-mcp-server
- **Issues**: File an issue in this repository

Happy live coding! 🎵