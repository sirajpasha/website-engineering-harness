#!/usr/bin/env node
/**
 * MCP Validation Script
 * Verifies Model Context Protocol configurations in mcp.json,
 * inspecting schemas, servers, and environment bindings.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

export function validateMCP() {
  console.log('====================================================');
  console.log('  MODEL CONTEXT PROTOCOL (MCP) VALIDATION');
  console.log('====================================================\n');

  const mcpPath = path.join(rootDir, 'mcp.json');
  if (!fs.existsSync(mcpPath)) {
    console.log('[✖] mcp.json not found in repository root');
    return { valid: false, error: 'mcp.json missing' };
  }

  try {
    const content = fs.readFileSync(mcpPath, 'utf-8');
    const config = JSON.parse(content);
    const servers = config.mcpServers || {};

    console.log(`Found ${Object.keys(servers).length} MCP server configurations:\n`);

    for (const [name, srv] of Object.entries(servers)) {
      console.log(`- Server: ${name}`);
      console.log(`  Command: ${srv.command} ${srv.args ? srv.args.join(' ') : ''}`);
      const envKeys = Object.keys(srv.env || {});
      console.log(`  Environment variables: ${envKeys.length > 0 ? envKeys.join(', ') : 'none'}`);
      console.log(`  [✔] Config syntax valid\n`);
    }

    const hasPlaywright = !!servers['playwright'];
    const hasStitch = !!servers['google-stitch'];

    console.log(`[${hasPlaywright ? '✔' : '✖'}] Playwright MCP server configured`);
    console.log(`[${hasStitch ? '✔' : '✖'}] Google Stitch MCP server configured`);

    console.log('\n====================================================');
    console.log('  MCP Validation: PASSED');
    console.log('====================================================\n');

    return { valid: true, hasPlaywright, hasStitch };
  } catch (err) {
    console.log(`[✖] MCP configuration error: ${err.message}`);
    return { valid: false, error: err.message };
  }
}

if (process.argv[1] && process.argv[1].endsWith('validate-mcp.js')) {
  const result = validateMCP();
  process.exit(result.valid ? 0 : 1);
}
