import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const expectedAgents = [
  'orchestrator',
  'requirement-grilling',
  'product-discovery',
  'design-art-director',
  'ux-ui-designer',
  'stitch-design-engineer',
  'frontend-architect',
  'implementation-engineer',
  'tdd-test-engineer',
  'motion-engineer',
  'browser-qa',
  'security-auditor',
  'web-performance-auditor',
  'seo-accessibility',
  'code-reviewer',
  'production-reviewer'
];

export function validateContracts() {
  console.log('Validating Agent Machine Contracts (*.contract.json)...');
  const agentsDir = path.join(rootDir, 'agents');
  const claudeAgentsDir = path.join(rootDir, '.claude', 'agents');
  
  const results = {
    totalChecked: 0,
    valid: 0,
    errors: []
  };

  const validAgentIds = new Set();

  // First pass: collect agent IDs from agents/
  for (const name of expectedAgents) {
    const contractPath = path.join(agentsDir, `${name}.contract.json`);
    if (!fs.existsSync(contractPath)) {
      results.errors.push(`Missing contract: agents/${name}.contract.json`);
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
      if (data.agent_id) validAgentIds.add(data.agent_id);
    } catch (err) {
      results.errors.push(`Invalid JSON in agents/${name}.contract.json: ${err.message}`);
    }
  }

  // Second pass: deep validation
  for (const name of expectedAgents) {
    results.totalChecked++;
    const contractPath = path.join(agentsDir, `${name}.contract.json`);
    const claudePath = path.join(claudeAgentsDir, `${name}.contract.json`);

    if (!fs.existsSync(contractPath)) continue;

    try {
      const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

      // Validate required fields
      const requiredFields = [
        'agent_id',
        'name',
        'role',
        'allowed_read_roots',
        'allowed_write_roots',
        'forbidden_write_roots',
        'may_spawn'
      ];

      for (const field of requiredFields) {
        if (contract[field] === undefined) {
          results.errors.push(`${name}.contract.json is missing required field: ${field}`);
        }
      }

      // Check array types
      if (!Array.isArray(contract.allowed_write_roots) || !Array.isArray(contract.forbidden_write_roots)) {
        results.errors.push(`${name}.contract.json write roots must be arrays`);
      }

      // Check spawn targets
      if (Array.isArray(contract.may_spawn)) {
        for (const spawnTarget of contract.may_spawn) {
          if (!validAgentIds.has(spawnTarget)) {
            results.errors.push(`${name}.contract.json specifies unknown spawn target: ${spawnTarget}`);
          }
        }
      }

      // Check sync with .claude/agents/
      if (fs.existsSync(claudePath)) {
        const claudeContent = fs.readFileSync(claudePath, 'utf8');
        const agentContent = fs.readFileSync(contractPath, 'utf8');
        if (claudeContent.trim() !== agentContent.trim()) {
          results.errors.push(`${name}.contract.json out of sync with .claude/agents/${name}.contract.json`);
        }
      }

      results.valid++;
    } catch (e) {
      results.errors.push(`Error validating ${name}: ${e.message}`);
    }
  }

  const passed = results.errors.length === 0;
  if (passed) {
    console.log(`[PASS] All ${results.valid}/${results.totalChecked} agent contracts verified successfully.`);
  } else {
    console.error(`[FAIL] Agent contract validation failed with ${results.errors.length} error(s):`);
    results.errors.forEach(err => console.error(`  - ${err}`));
  }

  return { passed, ...results };
}

if (process.argv[1] && process.argv[1].endsWith('validate-contracts.js')) {
  const { passed } = validateContracts();
  process.exit(passed ? 0 : 1);
}
