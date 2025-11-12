#!/usr/bin/env node
/**
 * Functional code test for writePattern
 *
 * This test validates that written patterns are functionally equivalent
 * to the input, ignoring whitespace differences.
 *
 * Usage:
 *   node test-autocompletion-bug.js
 *
 * Focus: Validates functional code correctness, not formatting
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const TEST_PATTERNS = [
  // Single-line patterns
  'sound("bd hh")',
  'sound("bd").fast(2)',
  'stack(sound("bd"), sound("hh"))',
  'note("c4 e4 g4").sound("piano")',
  'sound("bd sd").fast(2).room(0.5).delay(0.25)',
  
  // Multi-line patterns (where auto-pairing bugs appear)
  `setcpm(90/4)
samples('http://localhost:5555')
sound("bd bd hh bd")`,

  `stack(
  sound("bd bd bd bd"),
  sound("~ sd ~ sd"),
  sound("hh hh hh hh").fast(2)
).room(0.5)`,

  `stack(
  note("c2 c2 g2 f2").sound("sawtooth").lpf(800),
  sound("bd ~ ~ bd ~ bd ~ bd")
)`,

  `setcpm(130/4)
stack(
  s("bd*4").gain(0.9),
  s("~ cp ~ cp").room(0.2),
  s("hh*16").gain(0.4).pan(sine.range(-0.5, 0.5)),
  note("c2 c2 eb2 c2").s("sawtooth").cutoff(800)
).swing(0.05)`,

  `stack(
  note("c4 e4 g4 e4 c4 e4 g4 c5")
    .sound("piano")
    .slow(2)
    .room(0.3),
  sound("bd ~ ~ bd ~ ~ bd ~").gain(0.8)
)`,
];

async function runTest() {
  console.log('🧪 Auto-completion Bug Reproduction Test\n');
  console.log('=' .repeat(60));
  
  // Create MCP client
  const transport = new StdioClientTransport({
    command: process.env.NODE_PATH || 'node',
    args: ['./mcp-server/dist/index.js'],
    env: process.env,
  });

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  try {
    console.log('\n📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected\n');

    // Initialize Strudel
    console.log('🎵 Initializing Strudel browser...');
    await client.callTool({
      name: 'init',
      arguments: {},
    });
    console.log('✅ Initialized\n');

    // Test each pattern
    let passCount = 0;
    let failCount = 0;

    for (const pattern of TEST_PATTERNS) {
      console.log('-'.repeat(60));
      console.log(`\nTest Pattern: "${pattern}"`);
      console.log(`Expected length: ${pattern.length} characters`);

      // Write the pattern
      await client.callTool({
        name: 'write',
        arguments: { pattern },
      });

      // Small delay to ensure write completes
      await new Promise(resolve => setTimeout(resolve, 300));

      // Read back what was actually written
      const result = await client.callTool({
        name: 'get_pattern',
        arguments: {},
      });

      const actualPattern = result.content?.[0]?.text || '';
      console.log(`Actual length: ${actualPattern.length} characters`);

      // Normalize for functional comparison - remove ALL whitespace
      const normalize = (str) => str.replace(/\s+/g, '');
      const normalizedExpected = normalize(pattern);
      const normalizedActual = normalize(actualPattern);

      // Compare functional code only (whitespace-insensitive)
      if (normalizedActual === normalizedExpected) {
        console.log('✅ PASS - Pattern functionally correct');
        passCount++;
      } else {
        console.log('❌ FAIL - Functional code mismatch!');
        console.log(`\nExpected (no whitespace):\n"${normalizedExpected.substring(0, 100)}..."`);
        console.log(`\nActual (no whitespace):\n"${normalizedActual.substring(0, 100)}..."`);
        
        // Show the difference
        if (normalizedActual.length > normalizedExpected.length) {
          const extra = normalizedActual.slice(normalizedExpected.length);
          console.log(`\n⚠️  Extra characters: "${extra.substring(0, 50)}..."`);
          console.log(`   ${normalizedActual.length - normalizedExpected.length} extra character(s)`);
        } else if (normalizedActual.length < normalizedExpected.length) {
          console.log(`\n⚠️  Missing ${normalizedExpected.length - normalizedActual.length} character(s)`);
        } else {
          console.log(`\n⚠️  Same length but different content`);
        }
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Summary (${TEST_PATTERNS.length} patterns tested):`);
    console.log(`   ✅ Passed: ${passCount}/${TEST_PATTERNS.length}`);
    console.log(`   ❌ Failed: ${failCount}/${TEST_PATTERNS.length}`);
    
    if (failCount > 0) {
      console.log('\n🐛 Bug confirmed: Auto-completion is adding extra characters');
      console.log('\nRoot cause: page.keyboard.type() triggers CodeMirror auto-pairing');
      console.log('\nSuggested fix: Use direct CodeMirror state manipulation instead');
      console.log('See: https://codemirror.net/docs/ref/#state.EditorState.dispatch\n');
    } else {
      console.log('\n✨ All tests passed! Bug may be fixed.\n');
    }

    // Cleanup
    await client.close();
    process.exit(failCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    await client.close();
    process.exit(1);
  }
}

runTest();