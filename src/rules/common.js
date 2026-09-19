'use strict';

const { assertOfficialIds } = require('../owasp-catalog');

/**
 * @typedef {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'} Severity
 * @typedef {'BLOCK' | 'REVIEW'} Action
 * @typedef {'authz' | 'secret' | 'cors' | 'xss' | 'ssrf' | 'install-script' | 'registry-host' | 'unpinned-action' | 'lockfile-rewrite' | 'untrusted-diff'} FindingClass
 * @typedef {{
 *   title: string,
 *   findingClass: FindingClass,
 *   path: string,
 *   line: number,
 *   cwe: string,
 *   owasp: string[],
 *   severity: Severity,
 *   action: Action,
 * }} Finding
 * @typedef {import('../parse-diff').DiffFile} DiffFile
 * @typedef {import('../parse-diff').DiffLine} DiffLine
 */

/** @type {Record<FindingClass, string>} */
const CLASS_LABEL = {
  authz: 'AuthZ/IDOR',
  secret: 'Secret in source',
  cors: 'CORS misconfiguration',
  xss: 'XSS / HTML sink',
  ssrf: 'SSRF / egress',
  'install-script': 'Supply chain',
  'registry-host': 'Supply chain',
  'unpinned-action': 'Supply chain',
  'lockfile-rewrite': 'Supply chain',
  'untrusted-diff': 'Untrusted diff instruction',
};

/** AuthZ/IDOR and secrets change the merge decision when BLOCK. */
const MERGE_CHANGING = new Set(['authz', 'secret']);

/**
 * @param {string} findingClass
 * @returns {boolean}
 */
function isKnownClass(findingClass) {
  return Object.prototype.hasOwnProperty.call(CLASS_LABEL, findingClass);
}

/**
 * Fail-closed: drop anything that cannot cite a real new-file path:line
 * plus an official CWE, a known finding class, and official OWASP ids.
 *
 * @param {{ title: string, findingClass: FindingClass, path: string, line: number, cwe: string, owasp: string[], severity: Severity }} input
 * @returns {Finding | null}
 */
function createFinding(input) {
  if (!input.path || !Number.isInteger(input.line) || input.line < 1) {
    return null;
  }
  if (!input.cwe || !/^CWE-\d+$/.test(input.cwe)) {
    return null;
  }
  if (!isKnownClass(input.findingClass)) {
    return null;
  }
  const owasp = assertOfficialIds(input.owasp);
  if (!owasp) {
    return null;
  }
  const action = input.severity === 'CRITICAL' || input.severity === 'HIGH' ? 'BLOCK' : 'REVIEW';
  return {
    title: input.title,
    findingClass: input.findingClass,
    path: input.path,
    line: input.line,
    cwe: input.cwe,
    owasp,
    severity: input.severity,
    action,
  };
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function isCommentLine(text) {
  const trimmed = text.trim();
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('<!--')
  );
}

/**
 * @param {string} expr
 * @returns {boolean}
 */
function isStringLiteral(expr) {
  const trimmed = expr.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('`') && trimmed.endsWith('`') && !trimmed.includes('${'))
  );
}

/**
 * @param {(Finding | null)[]} rows
 * @returns {Finding[]}
 */
function compactFindings(rows) {
  return rows.filter((row) => row !== null);
}

module.exports = {
  CLASS_LABEL,
  MERGE_CHANGING,
  createFinding,
  isCommentLine,
  isStringLiteral,
  compactFindings,
};
