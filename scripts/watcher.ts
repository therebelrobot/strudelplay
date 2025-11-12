import { watch } from 'chokidar';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { config } from 'dotenv';
import { StrudelMCPClient } from './mcp-client.js';
import { glob } from 'glob';

// Load environment variables
config();

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

async function updateStrudelPattern(filePath: string, mcpClient: StrudelMCPClient, autoPlay: boolean = true) {
  try {
    console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    const content = readFileSync(filePath, 'utf-8');
    log.pattern(`Updating pattern from ${filePath}`);
    log.info(`Pattern length: ${content.length} characters`);

    // Explicitly pass autoPlay parameter
    await mcpClient.writePattern(content, autoPlay);
    activePatternFile = filePath;

    if (autoPlay) {
      log.success(`Pattern updated and playing!`);
    } else {
      log.success(`Pattern updated successfully!`);
    }
    console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  } catch (error) {
    log.error(`Failed to update pattern: ${error}`);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

async function updateCombinedPattern(filePaths: string[], mcpClient: StrudelMCPClient, autoPlay: boolean = true) {
  try {
    console.log(`\n${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

    // Sort files alphabetically
    const sortedFiles = [...filePaths].sort();

    // Read and concatenate all files
    const combinedContent = sortedFiles.map(filePath => {
      const content = readFileSync(filePath, 'utf-8');
      return `// File: ${filePath}\n${content}`;
    }).join('\n\n');

    log.pattern(`Updating combined pattern from ${sortedFiles.length} file(s)`);
    sortedFiles.forEach(f => log.info(`  - ${f}`));
    log.info(`Total pattern length: ${combinedContent.length} characters`);

    // Explicitly pass autoPlay parameter
    await mcpClient.writePattern(combinedContent, autoPlay);
    activePatternFile = `Combined: ${sortedFiles.length} files`;

    if (autoPlay) {
      log.success(`Combined pattern updated and playing!`);
    } else {
      log.success(`Combined pattern updated successfully!`);
    }
    console.log(`${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  } catch (error) {
    log.error(`Failed to update combined pattern: ${error}`);
    if (error instanceof Error) {
      console.error(error.stack);
    }
  }
}

async function startWatcher() {
  console.log(`\n${colors.bright}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}║   Strudel Development Watcher v1.0     ║${colors.reset}`);
  console.log(`${colors.bright}╚════════════════════════════════════════╝${colors.reset}\n`);

  // Get file arguments (supports globs and multiple files)
  const fileArgs = process.argv.slice(2);
  const cwd = process.cwd();

  // Find all .strudel and .str files manually first
  function findStrudelFiles(dir: string): string[] {
    const files: string[] = [];
    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        if (entry === 'node_modules' || entry === '.git' || entry === 'dist') {
          continue;
        }
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            files.push(...findStrudelFiles(fullPath));
          } else if (entry.endsWith('.strudel') || entry.endsWith('.str')) {
            files.push(fullPath);
          }
        } catch {
          // Skip files we can't read
        }
      }
    } catch {
      // Skip directories we can't read
    }
    return files;
  }

  // Resolve file arguments (handles globs and multiple files)
  let existingFiles: string[] = [];

  if (fileArgs.length > 0) {
    log.info(`Processing file patterns: ${fileArgs.join(', ')}`);

    for (const pattern of fileArgs) {
      const resolvedPath = resolve(cwd, pattern);

      // Check if it's a direct file path
      try {
        const stat = statSync(resolvedPath);
        if (stat.isFile() && (resolvedPath.endsWith('.strudel') || resolvedPath.endsWith('.str'))) {
          existingFiles.push(resolvedPath);
          continue;
        }
      } catch {
        // Not a direct file, try as glob
      }

      // Try as glob pattern
      const matches = await glob(pattern, {
        cwd,
        absolute: true,
        ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**']
      });

      const strudelMatches = matches.filter(f => f.endsWith('.strudel') || f.endsWith('.str'));
      existingFiles.push(...strudelMatches);
    }

    // Remove duplicates
    existingFiles = [...new Set(existingFiles)];

    if (existingFiles.length === 0) {
      log.error(`No .strudel or .str files found matching: ${fileArgs.join(', ')}`);
      process.exit(1);
    }
  } else {
    // No arguments, find all strudel files
    existingFiles = findStrudelFiles(cwd);
  }

  console.log(`${colors.blue}[DEBUG]${colors.reset} Found existing files:`, existingFiles);

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
  if (fileArgs.length > 0) {
    log.info(`Watching files matching: ${fileArgs.join(', ')}`);
    log.info(`Found ${existingFiles.length} file(s)\n`);
  } else {
    log.info('Watching for changes in *.strudel and *.str files\n');
  }

  // Watch all found files plus glob patterns for new files
  const watchPatterns = existingFiles.length > 0
    ? existingFiles
    : ['**/*.strudel', '**/*.str'];

  console.log(`${colors.blue}[DEBUG]${colors.reset} Watching:`, watchPatterns);
  console.log(`${colors.blue}[DEBUG]${colors.reset} Current directory:`, cwd);

  const watcher = watch(watchPatterns, {
    ignored: /(^|[\/\\])(node_modules|\.git|dist)([\/\\]|$)/,
    persistent: true,
    ignoreInitial: false,
  });

  let isReady = false;
  let filesFound = 0;
  let initialLoadComplete = false;

  // Handle file changes - reload all files when any file changes
  watcher.on('change', async (path: string) => {
    console.log(`\n${colors.blue}[DEBUG]${colors.reset} Event: change, Path: ${path}`);
    console.log(`${colors.yellow}⚡${colors.reset} ${colors.bright}File changed:${colors.reset} ${path}`);

    // Reload all files in alphabetical order
    await updateCombinedPattern(existingFiles, mcpClient, true);
  });

  // Handle new files
  watcher.on('add', async (path: string) => {
    filesFound++;
    console.log(`\n${colors.blue}[DEBUG]${colors.reset} Event: add, Path: ${path}`);

    if (isReady) {
      console.log(`${colors.green}➕${colors.reset} ${colors.bright}New file detected:${colors.reset} ${path}`);
      // Add to existing files and reload all
      if (!existingFiles.includes(path)) {
        existingFiles.push(path);
      }
      await updateCombinedPattern(existingFiles, mcpClient, true);
    } else {
      console.log(`${colors.cyan}📄${colors.reset} ${colors.bright}Found existing file:${colors.reset} ${path}`);
    }
  });

  // Error handling
  watcher.on('error', (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`Watcher error: ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  });

  // Ready event - only log once
  watcher.on('ready', () => {
    if (!isReady) {
      isReady = true;

      // Debug: Check what files the watcher is actually watching
      const watched = watcher.getWatched();
      console.log(`${colors.blue}[DEBUG]${colors.reset} Watched directories:`, Object.keys(watched));
      Object.keys(watched).forEach(dir => {
        console.log(`${colors.blue}[DEBUG]${colors.reset}   ${dir}:`, watched[dir]);
      });
      console.log(`${colors.blue}[DEBUG]${colors.reset} Files found during initial scan: ${filesFound}`);

      // Give a moment for all add events to process
      setTimeout(async () => {
        // Check if any files were found
        if (filesFound === 0) {
          console.log('');
          log.error('No .strudel or .str files found!');
          log.info(`Searched in: ${process.cwd()}`);
          log.info(`Patterns: ${watchPatterns.join(', ')}`);
          console.log(`\n${colors.yellow}Tip:${colors.reset} Create a .strudel file to get started:`);
          console.log(`  echo 'sound("bd sd")' > patterns/example.strudel`);
          console.log('');
          process.exit(1);
        }

        // Load all files combined on initial startup
        if (!initialLoadComplete && existingFiles.length > 0) {
          await updateCombinedPattern(existingFiles, mcpClient, true);
          initialLoadComplete = true;
        }

        log.success('Watcher is ready and monitoring for changes');
        log.info(`Found ${filesFound} file(s)`);
        console.log(`\n${colors.bright}Commands:${colors.reset}`);
        console.log(`  ${colors.cyan}Ctrl+C${colors.reset} - Stop the watcher`);
        if (activePatternFile) {
          console.log(`  ${colors.cyan}Active pattern:${colors.reset} ${activePatternFile}`);
        }
        console.log('');
      }, 100);
    }
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