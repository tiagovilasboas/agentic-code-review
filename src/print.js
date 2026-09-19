'use strict';

/**
 * @typedef {import('./rules/common').Finding} Finding
 */

/**
 * @param {Finding[]} findings
 * @returns {string}
 */
function formatReport(findings) {
  if (findings.length === 0) {
    return 'no evidence-based findings\n';
  }

  const blocks = findings.map((finding) =>
    [
      `Finding: ${finding.title}`,
      `Evidence: ${finding.path}:${finding.line}`,
      `CWE: ${finding.cwe}`,
      `Severity: ${finding.severity}`,
      `Action: ${finding.action}`,
    ].join('\n'),
  );

  return `${blocks.join('\n\n')}\n`;
}

/**
 * Non-zero when any BLOCK/FAIL finding exists; 0 when clean or REVIEW only.
 *
 * @param {Finding[]} findings
 * @returns {number}
 */
function exitCodeFor(findings) {
  return findings.some((finding) => finding.action === 'BLOCK') ? 1 : 0;
}

module.exports = { formatReport, exitCodeFor };
