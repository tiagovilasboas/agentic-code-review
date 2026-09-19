'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const cli = path.join(root, 'bin', 'review.js');

/**
 * @param {string[]} args
 * @param {{ cwd?: string }} [opts]
 * @returns {{ status: number | null, stdout: string, stderr: string }}
 */
function runReview(args, opts = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8',
    cwd: opts.cwd || root,
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

/**
 * @param {string} stdout
 * @param {{ title?: string, evidence: string, cwe: string, owasp: string, severity: string, action: string }} expect
 */
function assertFinding(stdout, expect) {
  assert.match(stdout, new RegExp(`Evidence: ${expect.evidence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(stdout, new RegExp(`CWE: ${expect.cwe}`));
  const block = stdout.split('\n\n').find((chunk) => chunk.includes(`Evidence: ${expect.evidence}`));
  assert.ok(block, `missing finding block for ${expect.evidence}`);
  if (expect.title) {
    assert.match(block, new RegExp(`Finding: ${expect.title}`));
  }
  assert.match(block, new RegExp(`CWE: ${expect.cwe}`));
  assert.match(block, new RegExp(`OWASP: ${expect.owasp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  assert.match(block, new RegExp(`Severity: ${expect.severity}`));
  assert.match(block, new RegExp(`Action: ${expect.action}`));
}

test('xss-sink.sample.diff prints DOM XSS at CommentBody.tsx:18 / CWE-79 and exits 1', () => {
  const result = runReview(['examples/xss-sink.sample.diff']);
  assert.equal(result.status, 1);
  assertFinding(result.stdout, {
    title: 'DOM XSS',
    evidence: 'web/src/components/CommentBody.tsx:18',
    cwe: 'CWE-79',
    owasp: 'A03:2021, ASVS-5.0-1.3.1',
    severity: 'HIGH',
    action: 'BLOCK',
  });
});

test('ssrf-egress.sample.diff prints open fetch at preview.ts:14 / CWE-918', () => {
  const result = runReview(['examples/ssrf-egress.sample.diff']);
  assert.equal(result.status, 1);
  assertFinding(result.stdout, {
    title: 'SSRF / open URL fetch',
    evidence: 'src/api/preview.ts:14',
    cwe: 'CWE-918',
    owasp: 'A10:2021, ASVS-5.0-1.3.6',
    severity: 'HIGH',
    action: 'BLOCK',
  });
  assertFinding(result.stdout, {
    evidence: 'src/api/preview.ts:16',
    cwe: 'CWE-918',
    owasp: 'A10:2021, ASVS-5.0-1.3.6',
    severity: 'MEDIUM',
    action: 'REVIEW',
  });
  assert.equal(result.stdout.includes('status.example.invalid'), false);
  assert.equal(result.stdout.includes('preview.ts:4'), false);
});

test('supply-chain.sample.diff prints install-path findings; honest lockfile pin is silent', () => {
  const result = runReview(['examples/supply-chain.sample.diff']);
  assert.equal(result.status, 1);
  assertFinding(result.stdout, {
    evidence: 'package.json:8',
    cwe: 'CWE-829',
    owasp: 'A08:2021, ASVS-5.0-15.2.4',
    severity: 'HIGH',
    action: 'BLOCK',
  });
  assertFinding(result.stdout, {
    evidence: '.npmrc:2',
    cwe: 'CWE-829',
    owasp: 'A08:2021, ASVS-5.0-15.2.4',
    severity: 'HIGH',
    action: 'BLOCK',
  });
  assertFinding(result.stdout, {
    evidence: '.github/workflows/ci.yml:9',
    cwe: 'CWE-829',
    owasp: 'A08:2021, ASVS-5.0-15.2.4',
    severity: 'HIGH',
    action: 'BLOCK',
  });
  assertFinding(result.stdout, {
    evidence: '.github/workflows/ci.yml:14',
    cwe: 'CWE-1104',
    owasp: 'A06:2021, ASVS-5.0-15.1.2',
    severity: 'MEDIUM',
    action: 'REVIEW',
  });
  assert.equal(result.stdout.includes('package-lock.json'), false);
});

test('sample-pr.diff prints AuthZ + hardcoded token + CORS', () => {
  const result = runReview(['examples/sample-pr.diff']);
  assert.equal(result.status, 1);
  assertFinding(result.stdout, {
    title: 'Missing object-level authorization',
    evidence: 'src/api/orders.ts:36',
    cwe: 'CWE-639',
    owasp: 'A01:2021, API1:2023, ASVS-5.0-8.2.2',
    severity: 'HIGH',
    action: 'BLOCK',
  });
  assertFinding(result.stdout, {
    title: 'Hardcoded credential in source',
    evidence: 'config/app.ts:14',
    cwe: 'CWE-798',
    owasp: 'A02:2021, ASVS-5.0-13.3.1',
    severity: 'CRITICAL',
    action: 'BLOCK',
  });
  assertFinding(result.stdout, {
    title: 'Overly permissive CORS origin',
    evidence: 'src/server.ts:8',
    cwe: 'CWE-942',
    owasp: 'A05:2021, ASVS-5.0-3.4.2',
    severity: 'MEDIUM',
    action: 'REVIEW',
  });
  assert.equal(result.stdout.includes('pk_test_REDACTED_SAMPLE_ONLY_0000'), false);
});

test('docs-only diff is silence and exit 0', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acr-review-'));
  const diffPath = path.join(dir, 'clean.diff');
  fs.writeFileSync(
    diffPath,
    [
      'diff --git a/README.md b/README.md',
      '--- a/README.md',
      '+++ b/README.md',
      '@@ -1,3 +1,4 @@',
      ' # Title',
      ' ',
      '+A harmless documentation line.',
      ' Hello',
      '',
    ].join('\n'),
  );
  const result = runReview([diffPath]);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'no evidence-based findings\n');
});

test('missing path prints usage and exits 2', () => {
  const result = runReview([]);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Usage: npm run review -- <diff-file>/);
});
