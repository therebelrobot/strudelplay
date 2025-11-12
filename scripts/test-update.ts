#!/usr/bin/env node
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testUpdate() {
  console.log('🧪 Testing update functionality...\n');

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./mcp-server/dist/index.js'],
  });

  const client = new Client(
    {
      name: 'test-update-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  await client.connect(transport);
  console.log('✅ Connected to MCP server\n');

  try {
    // Step 1: Initialize Strudel
    console.log('1️⃣ Initializing Strudel...');
    const initResult = await client.callTool({
      name: 'init',
      arguments: {},
    }) as any;
    console.log('✅', initResult.content[0].text, '\n');

    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Write initial pattern
    console.log('2️⃣ Writing initial pattern...');
    const pattern1 = 'note("c3 eb3 g3").s("piano")';
    const writeResult = await client.callTool({
      name: 'write',
      arguments: { pattern: pattern1 },
    }) as any;
    console.log('✅', writeResult.content[0].text, '\n');

    // Step 3: Start playing
    console.log('3️⃣ Starting playback...');
    const playResult = await client.callTool({
      name: 'play',
      arguments: {},
    }) as any;
    console.log('✅', playResult.content[0].text, '\n');

    // Wait for playback to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Update the pattern while playing
    console.log('4️⃣ Writing updated pattern...');
    const pattern2 = 'note("c4 d4 e4 g4").s("piano").slow(2)';
    const writeResult2 = await client.callTool({
      name: 'write',
      arguments: { pattern: pattern2 },
    }) as any;
    console.log('✅', writeResult2.content[0].text, '\n');

    // Step 5: Use UPDATE command to apply changes
    console.log('5️⃣ Clicking UPDATE button to apply changes...');
    const updateResult = await client.callTool({
      name: 'update',
      arguments: {},
    }) as any;
    console.log('✅', updateResult.content[0].text, '\n');

    // Wait to hear the updated pattern
    console.log('⏳ Waiting 5 seconds to hear updated pattern...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop playback
    console.log('6️⃣ Stopping playback...');
    const stopResult = await client.callTool({
      name: 'stop',
      arguments: {},
    }) as any;
    console.log('✅', stopResult.content[0].text, '\n');

    console.log('🎉 Update test completed successfully!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await client.close();
    process.exit(0);
  }
}

testUpdate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});