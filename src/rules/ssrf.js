'use strict';

const { labelsFor } = require('../owasp-catalog');
const { compactFindings, createFinding, isCommentLine, isStringLiteral } = require('./common');

/**
 * @typedef {import('./common').Finding} Finding
 * @typedef {import('../parse-diff').DiffFile} DiffFile
 */

const CLIENT_CALL = /\b(?:fetch|axios\.(?:get|post|put|patch|delete)|got|https?\.get)\s*\(\s*([^,\n)]+)/;

/**
 * @param {DiffFile} file
 * @returns {boolean}
 */
function looksServerSide(file) {
  if (/(?:^|\/)(?:api|server|backend|webhook|worker|jobs)\//.test(file.path)) {
    return true;
  }
  if (/\.(?:tsx|jsx|vue)$/.test(file.path) && !/(?:^|\/)(?:api|server)\//.test(file.path)) {
    return false;
  }
  const blob = file.lines.map((line) => line.text).join('\n');
  return /\b(?:express|fastify|koa|IncomingMessage)\b/.test(blob) || /\breq\.(?:body|query|params)\b/.test(blob);
}

/**
 * @param {DiffFile} file
 * @returns {Finding[]}
 */
function apply(file) {
  if (!looksServerSide(file)) {
    return [];
  }

  /** @type {(Finding | null)[]} */
  const rows = [];

  for (const line of file.added) {
    if (isCommentLine(line.text)) {
      continue;
    }
    const match = line.text.match(CLIENT_CALL);
    if (!match) {
      continue;
    }
    const arg = match[1].trim();
    if (isStringLiteral(arg)) {
      continue;
    }
    rows.push(
      createFinding({
        title: 'SSRF / open URL fetch',
        findingClass: 'ssrf',
        path: file.path,
        line: line.line,
        cwe: 'CWE-918',
        owasp: labelsFor('ssrf'),
        severity: 'HIGH',
      }),
    );
  }

  const fetchedText = file.added.some((line) => /\bresponse\.text\s*\(/.test(line.text));
  if (fetchedText) {
    for (const line of file.added) {
      if (isCommentLine(line.text)) {
        continue;
      }
      if (!/res\.(?:json|send)\s*\(.*\bhtml\b/.test(line.text)) {
        continue;
      }
      rows.push(
        createFinding({
          title: 'Fetched body returned to client',
          findingClass: 'ssrf',
          path: file.path,
          line: line.line,
          cwe: 'CWE-918',
          owasp: labelsFor('ssrf'),
          severity: 'MEDIUM',
        }),
      );
    }
  }

  return compactFindings(rows);
}

module.exports = { apply };
