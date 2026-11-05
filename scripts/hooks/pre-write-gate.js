import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Known secret / credential patterns
const SECRET_PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'AWS Access Key', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: 'GitHub Token', regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}/ },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
  { name: 'Generic High-Entropy API Key', regex: /(?:api[_-]?key|secret[_-]?token|auth[_-]?token)\s*[:=]\s*['"][A-Za-z0-9_/\-+=]{24,}['"]/i }
];

// Anti-slop prohibited patterns in website styling
const ANTI_SLOP_PATTERNS = [
  {
    name: 'Generic AI Purple/Blue Gradient',
    regex: /linear-gradient\s*\([^)]*#667eea[^)]*#764ba2[^)]*\)/i
  },
  {
    name: 'Generic AI Blue/Violet Gradient',
    regex: /linear-gradient\s*\([^)]*#4f46e5[^)]*#7c3aed[^)]*\)/i
  }
];

export function checkSecrets(content, filePath = '') {
  const violations = [];
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.regex.test(content)) {
      violations.push(`Secret detected [${pattern.name}] in ${filePath}`);
    }
  }
  return violations;
}

export function checkAntiSlop(content, filePath = '') {
  // Only check css/html/js styles
  if (!/\.(css|html|jsx|tsx|vue)$/i.test(filePath)) return [];
  const violations = [];
  for (const pattern of ANTI_SLOP_PATTERNS) {
    if (pattern.regex.test(content)) {
      violations.push(`Anti-Slop violation [${pattern.name}] in ${filePath}: replace with approved design tokens`);
    }
  }
  return violations;
}

export function checkAgentContract(agentName, targetRelativePath) {
  if (!agentName) return [];
  const normalizedTarget = targetRelativePath.replace(/\\/g, '/');
  
  const contractPath = path.join(rootDir, 'agents', `${agentName}.contract.json`);
  if (!fs.existsSync(contractPath)) {
    return [`Contract not found for agent: ${agentName}`];
  }

  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  const violations = [];

  // Check forbidden paths
  for (const forbidden of contract.forbidden_write_roots) {
    const normForbidden = forbidden.replace(/\\/g, '/');
    if (normalizedTarget.startsWith(normForbidden) || normalizedTarget === normForbidden.replace(/\/$/, '')) {
      violations.push(`Agent '${agentName}' is strictly forbidden from writing to '${normalizedTarget}'`);
    }
  }

  // Check allowed paths
  if (contract.allowed_write_roots.length > 0 && !contract.allowed_write_roots.includes('*')) {
    const isAllowed = contract.allowed_write_roots.some(allowed => {
      const normAllowed = allowed.replace(/\\/g, '/');
      if (normAllowed.endsWith('/')) {
        return normalizedTarget.startsWith(normAllowed);
      }
      return normalizedTarget === normAllowed || normalizedTarget.startsWith(normAllowed + '/');
    });

    if (!isAllowed) {
      violations.push(`Path '${normalizedTarget}' is not in allowed_write_roots for agent '${agentName}'`);
    }
  }

  return violations;
}

export function inspectWrite({ filePath, content, agentName }) {
  const relPath = path.relative(rootDir, path.resolve(rootDir, filePath));
  const errors = [];

  // 1. Contract check
  if (agentName) {
    errors.push(...checkAgentContract(agentName, relPath));
  }

  // 2. Secret check
  if (content) {
    errors.push(...checkSecrets(content, relPath));
    errors.push(...checkAntiSlop(content, relPath));
  }

  return {
    allowed: errors.length === 0,
    errors
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith('pre-write-gate.js')) {
  const args = process.argv.slice(2);
  let filePath = '';
  let agentName = process.env.ACTIVE_AGENT || '';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file') filePath = args[++i];
    if (args[i] === '--agent') agentName = args[++i];
  }

  if (!filePath) {
    console.error('Usage: node pre-write-gate.js --file <path> [--agent <agent_id>]');
    process.exit(1);
  }

  const fullPath = path.resolve(rootDir, filePath);
  let content = '';
  if (fs.existsSync(fullPath)) {
    content = fs.readFileSync(fullPath, 'utf8');
  }

  const result = inspectWrite({ filePath, content, agentName });
  if (!result.allowed) {
    console.error('[GATE BLOCKED] Pre-write gate detected violations:');
    result.errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  } else {
    console.log('[PASS] Pre-write gate checks satisfied.');
    process.exit(0);
  }
}
