import { watch } from 'chokidar';
import { readFileSync } from 'fs';
import { StrudelMCPClient } from './mcp-client.js';

// ANSI color codes for better terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  pattern: (msg: string) => console.log(`${colors.cyan}♪${colors.reset} ${msg}`),
};

// Keep track of the currently active pattern file
let activePatternFile: string | null = null;

async function updateStrudelPattern(filePath: string, mcpClient: StrudelMCPClient) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    log.pattern(`Updating pattern from ${filePath}`);

    await mcpClient.writePattern(content);
    activePatternFile = filePath;

    log.success(`Pattern updated successfully`);
  } catch (error) {
    log.error(`Failed to update pattern: ${error}`);
  }
}

async function startWatcher() {
  console.log(`\n${colors.bright}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}║   Strudel Development Watcher v1.0    ║${colors.reset}`);
  console.log(`${colors.bright}╚════════════════════════════════════════╝${colors.reset}\n`);

  // Check for file argument
  const targetFile = process.argv[2];
  const watchPatterns = targetFile
    ? [targetFile]
    : ['**/*.strudel', '**/*.str'];

  // Create and connect MCP client
  const mcpClient = new StrudelMCPClient();

  log.info('Connecting to Strudel MCP server...');
  const connected = await mcpClient.connect();

  if (!connected) {
    log.error('Failed to connect to Strudel MCP server');
    log.info('Make sure the Strudel MCP server is properly configured');
    process.exit(1);
  }

  // Initialize Strudel on startup
  try {
    await mcpClient.init();
  } catch (error) {
    log.error('Failed to initialize Strudel');
    log.info('The watcher will continue, but you may need to manually initialize Strudel');
  }

  log.info('Starting file watcher...');
  if (targetFile) {
    log.info(`Watching specific file: ${targetFile}\n`);
  } else {
    log.info('Watching for changes in *.strudel and *.str files\n');
  }

  // Watch specified file(s)
  const watcher = watch(watchPatterns, {
    ignored: ['node_modules/**', '.git/**', 'dist/**'],
    persistent: true,
    ignoreInitial: false,
  });

  // Handle file changes
  watcher.on('change', async (path: string) => {
    log.info(`File changed: ${path}`);
    await updateStrudelPattern(path, mcpClient);
  });

  // Handle new files
  watcher.on('add', async (path: string) => {
    log.info(`New file detected: ${path}`);
    await updateStrudelPattern(path, mcpClient);
  });

  // Error handling
  watcher.on('error', (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Watcher error: ${message}`);
  });

  // Ready event
  watcher.on('ready', () => {
    log.success('Watcher is ready and monitoring for changes');
    console.log(`\n${colors.bright}Commands:${colors.reset}`);
    console.log(`  ${colors.cyan}Ctrl+C${colors.reset} - Stop the watcher`);
    if (activePatternFile) {
      console.log(`  ${colors.cyan}Active pattern:${colors.reset} ${activePatternFile}`);
    }
    console.log('');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n');
    log.info('Shutting down watcher...');
    await watcher.close();
    await mcpClient.close();
    log.success('Watcher stopped');
    process.exit(0);
  });
}

// Start the watcher
startWatcher().catch((error) => {
  log.error(`Failed to start watcher: ${error}`);
  process.exit(1);
});