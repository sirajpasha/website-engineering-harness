#!/usr/bin/env node
/**
 * Environment Audit Script
 * Audits system runtime, git, node, python, Playwright, MCP configurations, and project directories.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function checkCommand(cmd, label) {
  try {
    const version = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    return { name: label, status: 'AVAILABLE', details: version.split('\n')[0] };
  } catch (err) {
    return { name: label, status: 'NOT_FOUND', details: err.message.split('\n')[0] };
  }
}

export function runEnvironmentAudit() {
  console.log('====================================================');
  console.log('  UNIVERSAL WEBSITE ENGINEERING HARNESS: ENVIRONMENT AUDIT');
  console.log('====================================================\n');

  const tools = [
    checkCommand('git --version', 'Git Version Control'),
    checkCommand('node --version', 'Node.js Runtime'),
    checkCommand('npm --version', 'NPM Package Manager'),
    checkCommand('python --version', 'Python Runtime'),
  ];

  console.log('--- System Runtimes ---');
  for (const t of tools) {
    const icon = t.status === 'AVAILABLE' ? '✔' : '✖';
    console.log(`[${icon}] ${t.name}: ${t.status} (${t.details})`);
  }

  console.log('\n--- Configuration Files ---');
  const configFiles = [
    'AGENTS.md',
    'CLAUDE.md',
    'GEMINI.md',
    '.cursorrules',
    '.github/copilot-instructions.md',
    'mcp.json',
    'package.json',
    'VERSION',
    'skills/registry/SKILL_REGISTRY.md'
  ];

  let configPass = 0;
  for (const cf of configFiles) {
    const fullPath = path.join(rootDir, cf);
    const exists = fs.existsSync(fullPath);
    const icon = exists ? '✔' : '✖';
    console.log(`[${icon}] ${cf}: ${exists ? 'EXISTS' : 'MISSING'}`);
    if (exists) configPass++;
  }

  console.log('\n--- MCP Configuration ---');
  const mcpPath = path.join(rootDir, 'mcp.json');
  if (fs.existsSync(mcpPath)) {
    try {
      const mcpData = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
      const servers = Object.keys(mcpData.mcpServers || {});
      console.log(`[✔] Configured MCP Servers (${servers.length}): ${servers.join(', ')}`);
    } catch (e) {
      console.log(`[✖] mcp.json parse error: ${e.message}`);
    }
  } else {
    console.log('[✖] mcp.json not found');
  }

  console.log('\n====================================================');
  console.log(`  Audit Result: ${configPass}/${configFiles.length} config files present.`);
  console.log('====================================================\n');
  return { tools, configPass, totalConfigs: configFiles.length };
}

if (process.argv[1] && process.argv[1].endsWith('audit-environment.js')) {
  runEnvironmentAudit();
}
