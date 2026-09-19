'use strict';

/**
 * @typedef {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'} Severity
 * @typedef {'BLOCK' | 'REVIEW'} Action
 * @typedef {{
 *   title: string,
 *   path: string,
 *   line: number,
 *   cwe: string,
 *   severity: Severity,
 *   action: Action,
 * }} Finding
 * @typedef {import('../parse-diff').DiffFile} DiffFile
 * @typedef {import('../parse-diff').DiffLine} DiffLine
 */

/**
 * Fail-closed: drop anything that cannot cite a real new-file path:line.
 *
 * @param {{ title: string, path: string, line: number, cwe: string, severity: Severity }} input
 * @returns {Finding | null}
 */
function createFinding(input) {
  if (!input.path || !Number.isInteger(input.line) || input.line < 1) {
    return null;
  }
  if (!input.cwe || !/^CWE-\d+$/.test(input.cwe)) {
    return null;
  }
  const action = input.severity === 'CRITICAL' || input.severity === 'HIGH' ? 'BLOCK' : 'REVIEW';
  return {
    title: input.title,
    path: input.path,
    line: input.line,
    cwe: input.cwe,
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
  createFinding,
  isCommentLine,
  isStringLiteral,
  compactFindings,
};
