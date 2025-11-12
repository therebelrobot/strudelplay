import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

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

export class StrudelMCPClient {
  private client: Client | null = null;
  private isInitialized = false;

  async connect() {
    try {
      log.info('Connecting to Strudel MCP server...');

      // Create transport with command and args
      const transport = new StdioClientTransport({
        command: process.env.NODE_PATH || 'node',
        args: [process.env.STRUDEL_MCP_PATH || './mcp-server/dist/index.js'],
      });

      // Create and connect client
      this.client = new Client(
        {
          name: 'strudelplay-watcher',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      await this.client.connect(transport);
      log.success('Connected to Strudel MCP server');
      return true;
    } catch (error) {
      log.error(`Failed to connect to MCP server: ${error}`);
      return false;
    }
  }

  async init() {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.');
    }

    try {
      log.info('Initializing Strudel browser...');
      await this.client.callTool({
        name: 'init',
        arguments: {},
      });
      this.isInitialized = true;
      log.success('Strudel initialized');
    } catch (error) {
      log.error(`Failed to initialize Strudel: ${error}`);
      throw error;
    }
  }

  async writePattern(pattern: string) {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.');
    }

    if (!this.isInitialized) {
      log.warning('Strudel not initialized yet, initializing now...');
      await this.init();
    }

    try {
      log.pattern('Updating pattern in Strudel...');
      await this.client.callTool({
        name: 'write',
        arguments: { pattern },
      });
      log.success('Pattern updated');
    } catch (error) {
      log.error(`Failed to update pattern: ${error}`);
      throw error;
    }
  }

  async play() {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.');
    }

    try {
      log.info('Starting playback...');
      await this.client.callTool({
        name: 'play',
        arguments: {},
      });
      log.success('Playback started');
    } catch (error) {
      log.error(`Failed to start playback: ${error}`);
      throw error;
    }
  }

  async pause() {
    if (!this.client) {
      throw new Error('Client not connected. Call connect() first.');
    }

    try {
      log.info('Pausing playback...');
      await this.client.callTool({
        name: 'pause',
        arguments: {},
      });
      log.success('Playback paused');
    } catch (error) {
      log.error(`Failed to pause playback: ${error}`);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      log.info('Closing connection to Strudel MCP server...');
      await this.client.close();
      this.client = null;
      this.isInitialized = false;
      log.success('Connection closed');
    }
  }
}