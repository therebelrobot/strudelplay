# strudelplay

A repository for experimenting with [Strudel](https://strudel.cc/) live coding music patterns, with an automated development workflow powered by the Strudel MCP server.

## Demo

![Demo](.github/demo.gif)

## Features

- 🎵 **Auto-reload**: Automatically updates Strudel when you save `.strudel` or `.str` files
- 🔄 **File watching**: Monitors all `.strudel` and `.str` files in your project
- 🎹 **Integrated sampler**: Run the Strudel sampler server alongside your development
- 🚀 **MCP Integration**: Leverages the Strudel MCP server for seamless browser control
- 📝 **TypeScript workflow**: Type-safe development scripts with tsx

## ⚠️ Current Status

This project currently depends on two upstream pull requests of the submodule that are open and under review:

- [PR #8: Fix: Replace keyboard.type() with insertText() to prevent auto-pairing corruption](https://github.com/williamzujkowski/strudel-mcp-server/pull/8)
- [PR #9: Add Update Button Support for Live Pattern Updates](https://github.com/williamzujkowski/strudel-mcp-server/pull/9)

**Workaround**: While these PRs are in review, this project uses a fork of the MCP server submodule with the changes already implemented. The forked is available in the `main-fixed` branch of this repo. If you want a working version of this application prior to the merge of the two listed PRs, you'll have to copy/use `main-fixed` for now.

## Prerequisites

- Node.js (v18 or higher recommended)
- The Strudel MCP server installed and configured

## Installation

### Quick Setup (Recommended)

1. Clone this repository:
```bash
git clone <your-repo-url>
cd strudelplay
```

2. Run the setup command to install everything:
```bash
npm install
npm run setup
```

This will:
- Initialize the git submodule for the MCP server
- Install all dependencies
- Build the MCP server
- Create your `.env` file

### Manual Setup

If you prefer to set up manually:

1. Clone with submodules:
```bash
git clone --recurse-submodules <your-repo-url>
cd strudelplay
```

2. Install main project dependencies:
```bash
npm install
```

3. Set up the MCP server:
```bash
npm run setup:mcp
```

4. Create environment file:
```bash
npm run setup:env
```

## Usage

### Quick Start

**New to this workflow?** See [`QUICKSTART.md`](QUICKSTART.md) for a step-by-step tutorial with example files!

Initialize Strudel and start the development workflow:

```bash
# Initialize Strudel browser instance
npm run init

# Start the file watcher (all .strudel and .str files)
npm run dev

# Watch a specific file only
npm run dev:file patterns/my-song.strudel

# Start sampler + file watcher (recommended)
npm run dev:watch

# Start sampler + custom samples + file watcher (with custom samples)
npm run dev:full
```

### Available Scripts

| Command | Description |
|---------|-------------|
| **Development** | |
| `npm run dev` | Start the file watcher (all files) |
| `npm run dev:file <path>` | Watch a specific file only |
| `npm run dev:watch` | Start sampler + file watcher (recommended) |
| `npm run dev:full` | Start sampler + custom samples + file watcher |
| `npm run sampler` | Start the Strudel sampler server (port from `.env`) |
| `npm run samples:serve` | Start custom samples server (port/dir from `.env`) |
| `npm run init` | Initialize a new Strudel browser session |
| **Utilities** | |
| `npm run cleanup` | Kill lingering processes on ports 5555 and 8000 |
| `npm run stop` | Alias for cleanup |
| **Setup** | |
| `npm run setup` | Run all setup steps (submodule, MCP server, env file) |
| `npm run setup:submodule` | Initialize git submodules |
| `npm run setup:mcp` | Install and build the MCP server |
| `npm run setup:env` | Create `.env` from `.env.example` if it doesn't exist |

### Workflow

1. **Start the development environment**:
   ```bash
   npm run dev:all
   ```

2. **Create or edit a `.strudel` file**:
   - Any changes to `.strudel` files are automatically detected
   - The pattern is instantly updated in the Strudel browser

3. **Write your patterns**:
   ```javascript
   // first_notes.strudel or first_notes.str
   setcpm(90/4)
   samples('http://localhost:5555')
   sound("bd bd hh bd rim bd hh bd")
   ```

4. **Save and watch the magic happen**:
   - The watcher detects the change
   - Sends the pattern to the Strudel MCP server
   - Your pattern updates in the browser automatically

### File Organization

```
strudelplay/
├── patterns/           # Store your .strudel pattern files here
├── scripts/           # Development workflow scripts
│   ├── mcp-client.ts  # MCP server communication
│   ├── watcher.ts     # File watcher implementation
│   └── init-strudel.ts # Initialization script
├── .env               # Environment configuration
└── *.strudel          # Your pattern files (anywhere in project)
```

## Configuration

The `.env` file supports the following options:

```env
# Port for the Strudel sampler server (@strudel/sampler)
PORT=5555

# Custom samples server configuration
SAMPLES_PORT=8000      # Port for serving your custom samples
SAMPLES_DIR=samples    # Directory containing your samples

# Path to the Strudel MCP server (uses submodule by default)
STRUDEL_MCP_PATH=./mcp-server/dist/index.js

# Optional: Node executable path
# NODE_PATH=/usr/local/bin/node
```

## Using Custom Samples

### Quick Start

1. **Add your samples** to the `samples/` directory:
   ```
   samples/
   ├── drums/
   │   ├── kick.wav
   │   └── snare.wav
   └── synths/
       └── lead.wav
   ```

2. **Start the full dev environment**:
   ```bash
   npm run dev:full
   ```

3. **Use in your patterns**:
   ```javascript
   // Load both Strudel's samples and your custom ones
   samples('http://localhost:5555', 'http://localhost:8000')
   
   // Use your custom samples
   sound("drums/kick drums/snare")
   ```

See [`samples/README.md`](samples/README.md) for detailed information about organizing and using custom samples.

## How It Works

1. **File Watcher**: Uses [chokidar](https://github.com/paulmillr/chokidar) to monitor `.strudel` files
2. **MCP Client**: Communicates with the Strudel MCP server via the MCP SDK
3. **Auto-update**: When files change, the pattern is sent to the browser through MCP tools
4. **Sampler Integration**: Runs the Strudel sampler for audio samples

## Architecture

```
┌─────────────────┐
│  .strudel files │
└────────┬────────┘
         │ (file change detected)
         ↓
┌─────────────────┐
│  File Watcher   │
│  (chokidar)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   MCP Client    │
│  (SDK stdio)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Strudel MCP    │
│     Server      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Strudel Browser │
│   (Puppeteer)   │
└─────────────────┘
```

## Troubleshooting

### Watcher won't start
- Ensure the Strudel MCP server is properly installed
- Check that Node.js is in your PATH
- Verify `.env` configuration

### Pattern not updating
- Check the terminal for error messages
- Ensure the Strudel browser window is open
- Verify the `.strudel` file syntax is valid

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- The TypeScript errors about `@types/node` should resolve after installation

## Contributing

Feel free to experiment, add patterns, and improve the workflow! This is a personal playground for Strudel experimentation.

## License

MIT

## Resources

- [Strudel Documentation](https://strudel.cc/)
- [Strudel Tutorial](https://strudel.cc/learn/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
