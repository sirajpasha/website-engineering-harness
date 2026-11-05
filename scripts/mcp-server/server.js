#!/usr/bin/env node
/**
 * Website Engineering Harness — MCP server (stdio, zero dependencies).
 *
 * The universal integration point: any MCP-capable AI client (Claude Code, Cursor,
 * Windsurf, Gemini CLI, Codex, Cline, Zed, …) gets
 *   tools      real, deterministic checks (gates, Playwright QA, ratchets, write/command guards)
 *   prompts    each of the 16 specialist agents as a loadable role
 *   resources  the quality standards, templates, workflows and agent definitions
 *
 * Transport: newline-delimited JSON-RPC 2.0 on stdin/stdout. stdout carries protocol
 * messages ONLY; anything the harness modules print is redirected to stderr.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

// Protect the protocol channel: nothing but JSON-RPC may reach stdout.
console.log = (...a) => console.error(...a);
console.info = (...a) => console.error(...a);

const { HARNESS_ROOT, projectRoot, defaultTarget } = await import('../lib/paths.js');
const { verifyGates } = await import('../quality-gates/gate-rules.js');
const { validateBrowser } = await import('../browser-validation/validate-browser.js');
const { collectCurrentMetrics, evaluateRatchets, seedBaselines, baselinesPathFor } = await import('../ratchets/check-ratchet.js');
const { inspectWrite } = await import('../hooks/pre-write-gate.js');
const { inspectCommand } = await import('../hooks/pre-bash-gate.js');

const SERVER_INFO = { name: 'website-engineering-harness', version: JSON.parse(fs.readFileSync(path.join(HARNESS_ROOT, 'package.json'), 'utf8')).version };
const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const subagentMeta = () => readJson(path.join(HARNESS_ROOT, 'agents', 'claude-subagents.json'));
const agentNames = () => Object.keys(subagentMeta()).filter(k => !k.startsWith('_')).sort();

const projectArg = (args) => path.resolve(args?.project_dir || defaultTarget(projectRoot()));
const text = (obj) => ({ content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] });

// ─────────────────────────────────────────── tools
const TOOLS = [
  {
    name: 'harness_check_gates',
    description: 'Verify quality gates G1–G13 for a website project from its evidence files (content-aware: placeholders, open P0/High findings, stale or missing browser QA are all failures). Returns per-gate status and problems.',
    inputSchema: { type: 'object', properties: { project_dir: { type: 'string', description: 'Project directory (default: current project).' } } },
    run: (args) => {
      const v = verifyGates(projectArg(args));
      return text({ project: v.dir, passed: v.passed, failed: v.failed, total: v.total, results: v.results.map(r => ({ gate: r.gate, name: r.name, status: r.status, problems: r.problems })) });
    }
  },
  {
    name: 'harness_browser_qa',
    description: 'Run REAL browser validation in headless Chromium (Playwright) at 6 viewports: horizontal overflow, 44px touch targets, h1/landmarks, console errors, axe WCAG violations, lab LCP/CLS. Writes reports/browser-qa/browser-qa.json. Fails closed if Playwright is not installed.',
    inputSchema: { type: 'object', properties: { target: { type: 'string', description: 'HTML file or http(s) URL (default: the project entry page).' }, project_dir: { type: 'string' } } },
    run: async (args) => {
      const dir = projectArg(args);
      const { findEntryHtml } = await import('../lib/paths.js');
      const target = args?.target
        ? (/^https?:/i.test(args.target) ? args.target : path.resolve(dir, args.target))
        : findEntryHtml(dir) || path.join(dir, 'index.html');
      const lines = [];
      const r = await validateBrowser(target, { log: (l) => lines.push(l) });
      return text({
        passed: r.passed, blocked: !!r.blocked, reason: r.reason, viewportsTested: r.viewportsTested,
        viewports: r.results.map(v => ({ viewport: v.viewport, passed: v.passed, failures: v.failures })),
        log: lines.join('\n')
      });
    }
  },
  {
    name: 'harness_check_ratchets',
    description: 'Measure coverage, bundle size, viewport passes, lab LCP/CLS and axe violations, and compare with the project\'s monotonic baselines (<project>/.harness/baselines.json). An unmeasured metric fails. With update=true, seeds baselines on first run and ratchets improvements forward.',
    inputSchema: { type: 'object', properties: { project_dir: { type: 'string' }, update: { type: 'boolean' } } },
    run: (args) => {
      const dir = projectArg(args);
      const metrics = collectCurrentMetrics(dir);
      const bp = baselinesPathFor(dir);
      let seeded = false;
      if (args?.update) seeded = seedBaselines(metrics, bp);
      if (!fs.existsSync(bp)) return text({ passed: false, note: 'No baselines yet. Call again with update=true to seed them from the measured values.', metrics });
      const r = evaluateRatchets(metrics, { baselinesPath: bp, updateBaselines: !!args?.update, log: () => {} });
      return text({ passed: r.passed, seeded, hasRegressions: r.hasRegressions, unmeasured: r.unmeasured, results: r.results });
    }
  },
  {
    name: 'harness_inspect_write',
    description: 'Dry-run the harness write guard BEFORE writing a file: detects secrets, banned AI-slop gradients, and (when `agent` is given) violations of that agent\'s write-root contract. Returns allowed + reasons.',
    inputSchema: { type: 'object', required: ['file_path'], properties: { file_path: { type: 'string' }, content: { type: 'string' }, agent: { type: 'string', description: 'Agent name, e.g. browser-qa, to apply its contract.' }, project_dir: { type: 'string' } } },
    run: (args) => {
      const agentName = args?.agent && fs.existsSync(path.join(HARNESS_ROOT, 'agents', `${path.basename(String(args.agent))}.contract.json`)) ? path.basename(String(args.agent)) : '';
      const r = inspectWrite({ filePath: args.file_path, content: args.content || '', agentName, projectDir: projectArg(args) });
      return text({ allowed: r.allowed, errors: r.errors });
    }
  },
  {
    name: 'harness_inspect_command',
    description: 'Dry-run the shell safety guard BEFORE running a command: blocks hard resets, force pushes, --no-verify, recursive root deletes, chmod 777.',
    inputSchema: { type: 'object', required: ['command'], properties: { command: { type: 'string' } } },
    run: (args) => {
      const r = inspectCommand(String(args.command || ''));
      return text({ allowed: r.allowed, reason: r.blockedReason });
    }
  },
  {
    name: 'harness_list_agents',
    description: 'List the 16 specialist agents, what each is for, and its write/spawn contract.',
    inputSchema: { type: 'object', properties: {} },
    run: () => {
      const meta = subagentMeta();
      return text({
        agents: agentNames().map(name => {
          const c = readJson(path.join(HARNESS_ROOT, 'agents', `${name}.contract.json`));
          return { name, description: meta[name].description, allowed_write_roots: c.allowed_write_roots, forbidden_write_roots: c.forbidden_write_roots, may_spawn: c.may_spawn };
        })
      });
    }
  }
];

// ─────────────────────────────────────────── prompts & resources
const RESOURCE_KINDS = { standards: 'standards', agents: 'agents', templates: 'templates', workflows: 'workflows', skills: 'skills' };
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

function listResources() {
  const out = [];
  for (const [kind, dir] of Object.entries(RESOURCE_KINDS)) {
    const full = path.join(HARNESS_ROOT, dir);
    if (!fs.existsSync(full) || kind === 'skills') continue;
    for (const f of fs.readdirSync(full).filter(x => x.endsWith('.md')).sort()) {
      const name = f.replace(/\.md$/, '');
      out.push({ uri: `harness://${kind}/${name}`, name: `${kind}/${name}`, mimeType: 'text/markdown' });
    }
  }
  return out;
}

function readResource(uri) {
  const m = String(uri).match(/^harness:\/\/([a-z]+)\/(.+)$/);
  if (!m || !RESOURCE_KINDS[m[1]] || !SAFE_NAME.test(m[2])) throw rpcError(-32602, `Invalid resource URI: ${uri}`);
  const file = path.join(HARNESS_ROOT, RESOURCE_KINDS[m[1]], `${m[2]}.md`);
  if (!fs.existsSync(file)) throw rpcError(-32002, `Resource not found: ${uri}`);
  return { contents: [{ uri, mimeType: 'text/markdown', text: fs.readFileSync(file, 'utf8') }] };
}

function listPrompts() {
  const meta = subagentMeta();
  return [
    { name: 'website-orchestrator', description: 'Act as the Master Website Engineering Orchestrator for a new site, redesign or enhancement. Loads the multi-agent spec and orchestrator role.', arguments: [{ name: 'goal', description: 'What website to build or change', required: false }] },
    ...agentNames().map(name => ({ name, description: meta[name].description, arguments: [{ name: 'task', description: 'What you want this specialist to do', required: false }] }))
  ];
}

function getPrompt(name, args = {}) {
  const read = (rel) => fs.readFileSync(path.join(HARNESS_ROOT, rel), 'utf8');
  let body;
  if (name === 'website-orchestrator') {
    body = `${read('AGENTS.md')}\n\n---\n\n${read('agents/orchestrator.md')}${args.goal ? `\n\n---\n\n## Goal\n${args.goal}` : ''}`;
  } else if (agentNames().includes(name)) {
    body = `${read(`agents/${name}.md`)}${args.task ? `\n\n---\n\n## Task\n${args.task}` : ''}`;
  } else {
    throw rpcError(-32602, `Unknown prompt: ${name}`);
  }
  return { description: name, messages: [{ role: 'user', content: { type: 'text', text: body } }] };
}

// ─────────────────────────────────────────── JSON-RPC plumbing
function rpcError(code, message) { const e = new Error(message); e.rpcCode = code; return e; }

async function handle(method, params = {}) {
  switch (method) {
    case 'initialize': {
      const wanted = params.protocolVersion;
      return {
        protocolVersion: SUPPORTED_PROTOCOLS.includes(wanted) ? wanted : SUPPORTED_PROTOCOLS[0],
        capabilities: { tools: {}, prompts: {}, resources: {} },
        serverInfo: SERVER_INFO,
        instructions: 'Use harness_check_gates / harness_browser_qa / harness_check_ratchets for evidence, never for assumptions. Load a specialist with the prompt of the same name. Report only measured results.'
      };
    }
    case 'ping': return {};
    case 'tools/list': return { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) };
    case 'tools/call': {
      const tool = TOOLS.find(t => t.name === params.name);
      if (!tool) throw rpcError(-32602, `Unknown tool: ${params.name}`);
      try { return await tool.run(params.arguments || {}); }
      catch (err) { return { isError: true, content: [{ type: 'text', text: `Tool error: ${err.message}` }] }; }
    }
    case 'prompts/list': return { prompts: listPrompts() };
    case 'prompts/get': return getPrompt(params.name, params.arguments || {});
    case 'resources/list': return { resources: listResources() };
    case 'resources/read': return readResource(params.uri);
    default: throw rpcError(-32601, `Method not found: ${method}`);
  }
}

const send = (obj) => process.stdout.write(JSON.stringify(obj) + '\n');

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', async (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  if (msg.id === undefined) return; // notification (e.g. notifications/initialized): no response
  try {
    send({ jsonrpc: '2.0', id: msg.id, result: await handle(msg.method, msg.params) });
  } catch (err) {
    send({ jsonrpc: '2.0', id: msg.id, error: { code: err.rpcCode || -32603, message: err.message } });
  }
});
rl.on('close', () => process.exit(0));
