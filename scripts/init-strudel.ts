import { StrudelMCPClient } from './mcp-client.js';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

async function initStrudel() {
  console.log(`\n${colors.bright}Initializing Strudel...${colors.reset}\n`);

  const mcpClient = new StrudelMCPClient();

  try {
    const connected = await mcpClient.connect();

    if (!connected) {
      log.error('Failed to connect to Strudel MCP server');
      log.info('Make sure the Strudel MCP server is properly configured');
      process.exit(1);
    }

    await mcpClient.init();
    log.success('Strudel initialized successfully!');

    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log('  1. Create or edit a .strudel file in your project');
    console.log('  2. Run `npm run dev` to start the file watcher');
    console.log('  3. Or run `npm run dev:all` to start both the sampler and watcher\n');

    await mcpClient.close();
  } catch (error) {
    log.error(`Failed to initialize Strudel: ${error}`);
    process.exit(1);
  }
}

initStrudel();