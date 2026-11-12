import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyRequest, MODES } from '../scripts/lib/classify-request.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('primary commands exist in every distribution copy', () => {
  for (const c of ['website-create', 'website-redesign', 'website-improve']) {
    test(`${c}: commands/, .claude/commands/ and plugin/commands/ are identical-sourced`, () => {
      const src = fs.readFileSync(path.join(root, 'commands', `${c}.md`), 'utf8').replace(/\r\n/g, '\n');
      assert.match(src, new RegExp(`# COMMAND: /${c}`));
      assert.equal(fs.readFileSync(path.join(root, '.claude/commands', `${c}.md`), 'utf8').replace(/\r\n/g, '\n'), src);
      assert.ok(fs.existsSync(path.join(root, 'plugin/commands', `${c}.md`)));
    });
  }
});

describe('request classification', () => {
  test('all ten project modes are defined', () => {
    assert.deepEqual([...MODES].sort(), ['BOOKING_WEBSITE', 'CONTENT_WEBSITE', 'CORPORATE_WEBSITE', 'CUSTOMER_PORTAL', 'E_COMMERCE', 'ENHANCE', 'FULL_STACK_MVP', 'LANDING_PAGE', 'NEW_WEBSITE', 'REDESIGN'].sort());
  });
  test('the command fixes the base lifecycle mode', () => {
    assert.equal(classifyRequest({ command: 'create', text: 'a site' }).base, 'NEW_WEBSITE');
    assert.equal(classifyRequest({ command: 'redesign', text: 'refresh it' }).base, 'REDESIGN');
    assert.equal(classifyRequest({ command: 'improve', text: 'faster' }).base, 'ENHANCE');
  });
  test('sub-type is inferred from the text', () => {
    const t = (text) => classifyRequest({ command: 'create', text }).subtype;
    assert.equal(t('An online shop with cart and checkout for shoes'), 'E_COMMERCE');
    assert.equal(t('A one-page landing page for our app launch'), 'LANDING_PAGE');
    assert.equal(t('Customers log in to view invoices in a portal'), 'CUSTOMER_PORTAL');
    assert.equal(t('Clients can book appointments online'), 'BOOKING_WEBSITE');
    assert.equal(t('Premium international commodities export company website with enquiry forms'), 'CORPORATE_WEBSITE');
    assert.equal(t('A blog and articles site'), 'CONTENT_WEBSITE');
    assert.equal(t('MVP with a database, API and user accounts'), 'FULL_STACK_MVP');
  });
  test('ambiguous text is reported as low confidence, not guessed silently', () => {
    const r = classifyRequest({ command: 'create', text: 'make me a website' });
    assert.equal(r.subtype, 'CORPORATE_WEBSITE');
    assert.equal(r.confidence, 'low');
    assert.ok(r.assumption && /assum/i.test(r.assumption.description + r.assumption.reason));
  });
  test('redesign/improve require an existing project; create warns when one exists', () => {
    assert.equal(classifyRequest({ command: 'redesign', text: 'x', hasProject: false }).blocked, true);
    assert.equal(classifyRequest({ command: 'improve', text: 'x', hasProject: false }).blocked, true);
    assert.equal(classifyRequest({ command: 'create', text: 'x', hasProject: true }).warning !== undefined, true);
  });
  test('unknown command throws', () => assert.throws(() => classifyRequest({ command: 'nuke', text: '' })));
});
