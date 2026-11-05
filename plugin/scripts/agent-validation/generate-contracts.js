import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contracts = [
  {
    agent_id: '01-orchestrator',
    name: 'Master Website Orchestrator',
    role: 'Orchestration, routing, quality gate enforcement',
    filename: 'orchestrator',
    allowed_read_roots: ['*'],
    allowed_write_roots: [
      '.harness/',
      'docs/',
      'reports/',
      'DEFECT_REGISTER.md',
      'TEST_TRACEABILITY_MATRIX.md',
      'README.md',
      'VERSION'
    ],
    forbidden_write_roots: ['src/'],
    may_spawn: [
      '02-requirement-grilling',
      '03-product-discovery',
      '04-design-art-director',
      '05-ux-ui-designer',
      '06-stitch-design-engineer',
      '07-frontend-architect',
      '08-implementation-engineer',
      '09-tdd-test-engineer',
      '10-motion-engineer',
      '11-browser-qa',
      '12-security-auditor',
      '13-web-performance-auditor',
      '14-seo-accessibility',
      '15-code-reviewer',
      '16-production-reviewer'
    ],
    max_context_turns: 30,
    token_budget_soft_limit: 150000,
    token_budget_hard_limit: 195000
  },
  {
    agent_id: '02-requirement-grilling',
    name: 'Requirement Grilling Specialist',
    role: 'Socratic interrogation, ambiguity reduction',
    filename: 'requirement-grilling',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['REQUIREMENTS.md', 'docs/requirements/', 'templates/'],
    forbidden_write_roots: ['src/', 'tests/', 'public/', 'styles/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '03-product-discovery',
    name: 'Product Discovery Specialist',
    role: 'User journeys, personas, sitemaps, IA',
    filename: 'product-discovery',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['USER_JOURNEYS.md', 'docs/discovery/', 'SITEMAP.md'],
    forbidden_write_roots: ['src/', 'tests/', 'public/', 'styles/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '04-design-art-director',
    name: 'Design Art Director',
    role: 'Visual identity, anti-slop, aesthetics',
    filename: 'design-art-director',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['DESIGN_DIRECTION.md', 'docs/design/', 'tokens/'],
    forbidden_write_roots: ['src/app.js', 'tests/'],
    may_spawn: ['05-ux-ui-designer', '06-stitch-design-engineer'],
    max_context_turns: 25,
    token_budget_soft_limit: 140000,
    token_budget_hard_limit: 190000
  },
  {
    agent_id: '05-ux-ui-designer',
    name: 'UX/UI Design Specialist',
    role: 'Usability, design critique, layout, typesetting',
    filename: 'ux-ui-designer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['UI_CRITIQUE_REPORT.md', 'docs/ux/', 'DEFECT_REGISTER.md'],
    forbidden_write_roots: ['src/', 'tests/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '06-stitch-design-engineer',
    name: 'Google Stitch Design Engineer',
    role: 'AI design generation, tokens, variants',
    filename: 'stitch-design-engineer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['STITCH_DESIGN_SPEC.md', 'DESIGN_TOKENS.json', 'styles/tokens/', 'docs/stitch/'],
    forbidden_write_roots: ['tests/', 'reports/'],
    may_spawn: [],
    max_context_turns: 25,
    token_budget_soft_limit: 140000,
    token_budget_hard_limit: 190000
  },
  {
    agent_id: '07-frontend-architect',
    name: 'Frontend Architect',
    role: 'Stack evaluation, modular structure, tokens',
    filename: 'frontend-architect',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['ARCHITECTURE.md', 'COMPONENT_INVENTORY.md', 'docs/architecture/', 'package.json'],
    forbidden_write_roots: ['reports/release-audit.md'],
    may_spawn: ['08-implementation-engineer', '09-tdd-test-engineer'],
    max_context_turns: 25,
    token_budget_soft_limit: 140000,
    token_budget_hard_limit: 190000
  },
  {
    agent_id: '08-implementation-engineer',
    name: 'Website Implementation Engineer',
    role: 'Clean code, semantic HTML, responsive frontend',
    filename: 'implementation-engineer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['src/', 'public/', 'styles/', 'index.html'],
    forbidden_write_roots: ['tests/', 'reports/release-audit.md', 'DEFECT_REGISTER.md'],
    may_spawn: [],
    max_context_turns: 30,
    token_budget_soft_limit: 150000,
    token_budget_hard_limit: 195000
  },
  {
    agent_id: '09-tdd-test-engineer',
    name: 'TDD & Test Engineering Specialist',
    role: 'RED-GREEN-REFACTOR, test seams, test suites',
    filename: 'tdd-test-engineer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['tests/', '.harness/receipts/', 'vitest.config.js', 'playwright.config.js', 'TEST_TRACEABILITY_MATRIX.md'],
    forbidden_write_roots: ['reports/release-audit.md'],
    may_spawn: [],
    max_context_turns: 25,
    token_budget_soft_limit: 140000,
    token_budget_hard_limit: 190000
  },
  {
    agent_id: '10-motion-engineer',
    name: 'Motion Design Engineer',
    role: 'Micro-interactions, physics transitions, reduced-motion',
    filename: 'motion-engineer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['MOTION_SPECIFICATION.md', 'styles/motion.css', 'src/motion/'],
    forbidden_write_roots: ['tests/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '11-browser-qa',
    name: 'Playwright Browser Engineer',
    role: 'Viewport QA, real browser automation, traces',
    filename: 'browser-qa',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['BROWSER_QA_REPORT.md', 'tests/e2e/', 'reports/browser-qa/', 'DEFECT_REGISTER.md'],
    forbidden_write_roots: ['src/'],
    may_spawn: [],
    max_context_turns: 25,
    token_budget_soft_limit: 140000,
    token_budget_hard_limit: 190000
  },
  {
    agent_id: '12-security-auditor',
    name: 'Security Auditor',
    role: 'Threat modeling, OWASP Top 10, STRIDE',
    filename: 'security-auditor',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['SECURITY_AUDIT_REPORT.md', 'reports/security/', 'DEFECT_REGISTER.md'],
    forbidden_write_roots: ['src/', 'tests/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '13-web-performance-auditor',
    name: 'Web Performance Auditor',
    role: 'Core Web Vitals, bundle size, metric honesty',
    filename: 'web-performance-auditor',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['PERFORMANCE_AUDIT_REPORT.md', 'reports/performance/', 'DEFECT_REGISTER.md'],
    forbidden_write_roots: ['src/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '14-seo-accessibility',
    name: 'SEO & Accessibility Specialist',
    role: 'WCAG 2.2 AA, semantic hierarchy, metadata',
    filename: 'seo-accessibility',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['SEO_REPORT.md', 'ACCESSIBILITY_REPORT.md', 'reports/seo-a11y/', 'DEFECT_REGISTER.md'],
    forbidden_write_roots: ['src/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '15-code-reviewer',
    name: 'Code Review & Architecture Reviewer',
    role: 'Two-dimension code & architecture audit',
    filename: 'code-reviewer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['reports/code-review.md', 'DEFECT_REGISTER.md'],
    forbidden_write_roots: ['src/', 'tests/', 'public/', 'styles/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  },
  {
    agent_id: '16-production-reviewer',
    name: 'Production Readiness & Release Reviewer',
    role: 'Gate consolidation, release verification',
    filename: 'production-reviewer',
    allowed_read_roots: ['*'],
    allowed_write_roots: ['RELEASE_CHECKLIST.md', 'RELEASE_NOTES.md', 'reports/release-audit.md'],
    forbidden_write_roots: ['src/', 'tests/'],
    may_spawn: [],
    max_context_turns: 20,
    token_budget_soft_limit: 120000,
    token_budget_hard_limit: 180000
  }
];

const targetDirs = [
  path.join(__dirname, '..', '..', 'agents'),
  path.join(__dirname, '..', '..', '.claude', 'agents')
];

let generated = 0;
contracts.forEach(contract => {
  const { filename, ...contractData } = contract;
  const content = JSON.stringify(contractData, null, 2) + '\n';
  
  targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const filePath = path.join(dir, `${filename}.contract.json`);
      fs.writeFileSync(filePath, content, 'utf8');
      generated++;
    }
  });
});

console.log(`Successfully generated ${generated} agent contract files across agents/ and .claude/agents/.`);
