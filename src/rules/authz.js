'use strict';

const { compactFindings, createFinding, isCommentLine } = require('./common');

/**
 * @typedef {import('./common').Finding} Finding
 * @typedef {import('../parse-diff').DiffFile} DiffFile
 */

const SINK = /\b(?:findById|getById|findOne|findUnique|findFirst)\s*\(/;
const CALLER_ID = /\breq\.(?:params|query|body)\b/;
const AUTHZ_CHECK =
  /\b(?:req\.user|ctx\.user|currentUser|userId|tenantId|ownerId|authorize(?:d)?|canAccess|hasAccess|assertOwner|belongsTo)\b/;

/**
 * @param {DiffFile} file
 * @returns {Finding[]}
 */
function apply(file) {
  const callerIdInDiff = file.added.some((line) => !isCommentLine(line.text) && CALLER_ID.test(line.text));
  if (!callerIdInDiff) {
    return [];
  }

  const hasAuthz = file.lines.some((line) => !isCommentLine(line.text) && AUTHZ_CHECK.test(line.text));
  if (hasAuthz) {
    return [];
  }

  return compactFindings(
    file.added.map((line) => {
      if (isCommentLine(line.text) || !SINK.test(line.text)) {
        return null;
      }
      return createFinding({
        title: 'Missing object-level authorization',
        path: file.path,
        line: line.line,
        cwe: 'CWE-639',
        severity: 'HIGH',
      });
    }),
  );
}

module.exports = { apply };
