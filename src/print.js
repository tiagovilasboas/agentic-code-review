'use strict';

const { CLASS_LABEL, MERGE_CHANGING } = require('./rules/common');

/**
 * @typedef {import('./rules/common').Finding} Finding
 */

/**
 * Prefer AuthZ/IDOR, then secrets — those classes change the merge decision.
 *
 * @param {Finding[]} findings
 * @returns {Finding | undefined}
 */
function pickMergeBlocker(findings) {
  const blockers = findings.filter((finding) => finding.action === 'BLOCK');
  return (
    blockers.find((finding) => finding.findingClass === 'authz') ||
    blockers.find((finding) => finding.findingClass === 'secret') ||
    blockers[0]
  );
}

/**
 * @param {Finding} finding
 * @returns {string}
 */
function asvsOrOfficial(finding) {
  return finding.owasp.find((id) => id.startsWith('ASVS-5.0-')) || finding.owasp[0];
}

/**
 * @param {Finding[]} findings
 * @returns {string}
 */
function formatMergeDecision(findings) {
  const blocker = pickMergeBlocker(findings);
  if (!blocker) {
    return '';
  }
  const label = CLASS_LABEL[blocker.findingClass];
  const id = asvsOrOfficial(blocker);
  return [
    'Decision: DO NOT MERGE',
    `Reason: ${label} at ${blocker.path}:${blocker.line} (${id})`,
  ].join('\n');
}

/**
 * @param {Finding} finding
 * @returns {string}
 */
function formatFinding(finding) {
  const lines = [
    `Finding: ${finding.title}`,
    `Class: ${CLASS_LABEL[finding.findingClass]}`,
    `Evidence: ${finding.path}:${finding.line}`,
    `CWE: ${finding.cwe}`,
    `OWASP: ${finding.owasp.join(', ')}`,
    `Severity: ${finding.severity}`,
    `Action: ${finding.action}`,
  ];
  if (finding.action === 'BLOCK' && MERGE_CHANGING.has(finding.findingClass)) {
    lines.push('Decision: DO NOT MERGE');
  }
  return lines.join('\n');
}

/**
 * @param {Finding[]} findings
 * @returns {string}
 */
function formatReport(findings) {
  if (findings.length === 0) {
    return 'no evidence-based findings\n';
  }

  const decision = formatMergeDecision(findings);
  const blocks = findings.map(formatFinding);
  return `${decision}\n\n${blocks.join('\n\n')}\n`;
}

/**
 * Non-zero when any BLOCK finding exists; 0 when clean or REVIEW only.
 *
 * @param {Finding[]} findings
 * @returns {number}
 */
function exitCodeFor(findings) {
  return findings.some((finding) => finding.action === 'BLOCK') ? 1 : 0;
}

module.exports = { formatReport, formatMergeDecision, pickMergeBlocker, exitCodeFor };
