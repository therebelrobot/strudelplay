import { config } from 'dotenv';
import { StrudelMCPClient } from './mcp-client.js';

// Load environment variables
config();

async function test() {
  console.log('🧪 Testing MCP Connection...\n');

  const client = new StrudelMCPClient();

  try {
    // Step 1: Connect
    console.log('Step 1: Connecting...');
    const connected = await client.connect();
    if (!connected) {
      console.error('❌ Failed to connect');
      process.exit(1);
    }
    console.log('✅ Connected\n');

    // Step 2: Initialize
    console.log('Step 2: Initializing Strudel...');
    await client.init();
    console.log('✅ Initialized\n');

    // Step 3: Write a simple pattern
    console.log('Step 3: Writing test pattern...');
    const testPattern = 'sound("bd sd")';
    await client.writePattern(testPattern, true);
    console.log('✅ Pattern written and playing\n');

    // Wait a bit
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Close
    await client.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

test();