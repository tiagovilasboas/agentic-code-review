'use strict';

const { parseUnifiedDiff } = require('./parse-diff');
const xss = require('./rules/xss');
const ssrf = require('./rules/ssrf');
const supplyChain = require('./rules/supply-chain');
const authz = require('./rules/authz');
const secrets = require('./rules/secrets');

/**
 * @typedef {import('./rules/common').Finding} Finding
 */

const RULES = [xss, ssrf, supplyChain, authz, secrets];

const SEVERITY_RANK = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/**
 * @param {Finding} left
 * @param {Finding} right
 * @returns {number}
 */
function compareFindings(left, right) {
  const severity = SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity];
  if (severity !== 0) {
    return severity;
  }
  const pathCmp = left.path.localeCompare(right.path);
  if (pathCmp !== 0) {
    return pathCmp;
  }
  return left.line - right.line;
}

/**
 * @param {Finding[]} findings
 * @returns {Finding[]}
 */
function dedupeFindings(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.path}:${finding.line}:${finding.cwe}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Deterministic rule engine: unified diff in, findings with path:line + CWE out.
 * No LLM. Silence when the hunk has no matching fail-closed pattern.
 *
 * @param {string} diffText
 * @returns {Finding[]}
 */
function reviewDiff(diffText) {
  const files = parseUnifiedDiff(diffText);
  /** @type {Finding[]} */
  const findings = [];
  for (const file of files) {
    for (const rule of RULES) {
      findings.push(...rule.apply(file));
    }
  }
  return dedupeFindings(findings).sort(compareFindings);
}

module.exports = { reviewDiff };
