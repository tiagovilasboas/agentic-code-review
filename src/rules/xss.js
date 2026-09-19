'use strict';

const { labelsFor } = require('../owasp-catalog');
const { compactFindings, createFinding, isCommentLine } = require('./common');

/**
 * @typedef {import('./common').Finding} Finding
 * @typedef {import('../parse-diff').DiffFile} DiffFile
 */

const SINKS = [
  { title: 'DOM XSS', re: /dangerouslySetInnerHTML/ },
  { title: 'DOM XSS', re: /\.innerHTML\s*=/ },
  { title: 'DOM XSS', re: /\.outerHTML\s*=/ },
  { title: 'DOM XSS', re: /\binsertAdjacentHTML\s*\(/ },
  { title: 'DOM XSS', re: /\bdocument\.write\s*\(/ },
  { title: 'DOM XSS', re: /\bv-html\b/ },
  { title: 'DOM XSS', re: /\bbypassSecurityTrust(?:Html|Script|Url|ResourceUrl|Style)\b/ },
  { title: 'DOM XSS', re: /\bunsafeHTML\s*\(/ },
];

/**
 * Sanitizer applied on the same assignment is a pass for this smoke engine.
 *
 * @param {string} text
 * @returns {boolean}
 */
function sinkLooksSanitized(text) {
  return /__html\s*:\s*(?:DOMPurify|sanitizeHtml|sanitize)\s*\(/.test(text);
}

/**
 * @param {DiffFile} file
 * @returns {Finding[]}
 */
function apply(file) {
  return compactFindings(
    file.added.map((line) => {
      if (isCommentLine(line.text)) {
        return null;
      }
      if (sinkLooksSanitized(line.text)) {
        return null;
      }
      const hit = SINKS.find((sink) => sink.re.test(line.text));
      if (!hit) {
        return null;
      }
      return createFinding({
        title: hit.title,
        path: file.path,
        line: line.line,
        cwe: 'CWE-79',
        owasp: labelsFor('xss'),
        severity: 'HIGH',
      });
    }),
  );
}

module.exports = { apply };
