/**
 * Automated Test Suite: Aether Studio
 * Verifies Requirements REQ-001 through REQ-008.
 * Run with: node --test examples/sample-website/tests/sample-website.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculateScope, validateAuditForm } from '../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sampleDir = path.resolve(__dirname, '../');

describe('TDD Suite: Scope Calculation Logic (REQ-003)', () => {
  test('calculates standard sprint and cost for 3 pages', () => {
    const result = calculateScope(3, 'standard');
    assert.strictEqual(result.pages, 3);
    assert.strictEqual(result.sprints, 2);
    assert.strictEqual(result.estimatedCostUsd, 12000);
    assert.strictEqual(result.formattedCost, '$12,000 USD');
  });

  test('applies minimal tier discount multiplier', () => {
    const result = calculateScope(2, 'minimal');
    assert.strictEqual(result.sprints, 1);
    assert.strictEqual(result.estimatedCostUsd, 5100); // 6000 * 0.85
  });

  test('applies overdrive tier premium multiplier and additional sprint', () => {
    const result = calculateScope(4, 'overdrive');
    assert.strictEqual(result.sprints, 3); // 2 + 1
    assert.strictEqual(result.estimatedCostUsd, 24300); // 3 * 6000 * 1.35
  });
});

describe('TDD Suite: Client Audit Form Validation (REQ-004, REQ-007)', () => {
  test('flags missing name, email, and invalid URL', () => {
    const res = validateAuditForm({ name: '', email: 'invalid-email', url: 'not-a-url' });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.name);
    assert.ok(res.errors.email);
    assert.ok(res.errors.url);
  });

  test('approves valid client submission data', () => {
    const res = validateAuditForm({
      name: 'Jordan Belfort',
      email: 'jordan@strattoneast.com',
      url: 'https://strattoneast.com'
    });
    assert.strictEqual(res.isValid, true);
    assert.deepStrictEqual(res.errors, {});
  });
});

describe('Static DOM & Semantic Architecture Verification (REQ-001, REQ-005, REQ-008)', () => {
  const html = fs.readFileSync(path.join(sampleDir, 'index.html'), 'utf-8');

  test('REQ-001: contains semantic hero section and primary h1', () => {
    assert.ok(html.includes('<h1 id="heroTitle"'), 'Hero must contain an h1 element');
    assert.ok(html.includes('Website Engineering'), 'Hero contains correct heading copy');
  });

  test('REQ-005: contains responsive navigation controls', () => {
    assert.ok(html.includes('id="navToggle"'), 'Navigation contains mobile toggle');
    assert.ok(html.includes('id="primaryNav"'), 'Navigation contains primary nav list');
  });

  test('REQ-007: modal dialog implements accessible attributes', () => {
    assert.ok(html.includes('<dialog id="auditModal"'), 'Implements native HTML dialog');
    assert.ok(html.includes('aria-modal="true"'), 'Declares aria-modal attribute');
    assert.ok(html.includes('for="clientName"'), 'Input labels are explicitly paired');
  });

  test('REQ-008: contains OpenGraph tags and JSON-LD schema', () => {
    assert.ok(html.includes('property="og:title"'), 'Contains og:title');
    assert.ok(html.includes('application/ld+json'), 'Contains structured JSON-LD');
  });
});

describe('Motion & CSS Accessibility Verification (REQ-006, REQ-007)', () => {
  const css = fs.readFileSync(path.join(sampleDir, 'src/styles.css'), 'utf-8');

  test('REQ-006: defines Emil Kowalski motion curves', () => {
    assert.ok(css.includes('--ease-tactile'), 'Declares tactile easing variable');
    assert.ok(css.includes('--ease-spatial'), 'Declares spatial easing variable');
  });

  test('REQ-006: provides prefers-reduced-motion media query', () => {
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'Contains reduced-motion override');
  });

  test('REQ-007: provides visible focus indicators', () => {
    assert.ok(css.includes(':focus-visible'), 'Declares :focus-visible rules');
  });
});
