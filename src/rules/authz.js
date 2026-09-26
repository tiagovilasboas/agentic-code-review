'use strict';

const { labelsFor } = require('../owasp-catalog');
const { compactFindings, createFinding, isCommentLine } = require('./common');

/**
 * @typedef {import('./common').Finding} Finding
 * @typedef {import('../parse-diff').DiffFile} DiffFile
 * @typedef {import('../parse-diff').DiffLine} DiffLine
 */

const SINK = /\b(?:findById|getById|findOne|findUnique|findFirst)\s*\(/;
const CALLER_ID = /\breq\.(?:params|query|body)\b/;
/** A principal or an explicit guard in the same handler counts as an authorization check. */
const AUTHZ_IN_SCOPE =
  /\b(?:req\.user|ctx\.user|currentUser|authorize(?:d)?|canAccess|hasAccess|assertOwner|belongsTo)\b/;
/** Ownership fields only count when they filter the query itself, not as a stray identifier. */
const OWNERSHIP_FILTER = /\b(?:userId|tenantId|ownerId)\b/;

/**
 * Drop string literals so braces or parens inside them do not skew counting.
 *
 * @param {string} text
 * @returns {string}
 */
function stripStrings(text) {
  return text.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""');
}

/**
 * @param {string} text
 * @param {string} open
 * @param {string} close
 * @returns {number} opens minus closes
 */
function net(text, open, close) {
  const code = stripStrings(text);
  let n = 0;
  for (const ch of code) {
    if (ch === open) n += 1;
    else if (ch === close) n -= 1;
  }
  return n;
}

/**
 * A line that opens a function body: arrow, `function`, a method signature,
 * or the `) {` that closes a multi-line parameter list. `if (...) {`, `try {`,
 * `else {` and other control blocks are not handlers.
 */
const FUNCTION_OPENER =
  /=>\s*\{|\bfunction\b[^{]*\{|^\s*(?:(?:export|default|public|private|protected|static|async)\s+)*(?!(?:if|for|while|switch|catch|with)\b)[A-Za-z_$][\w$]*\s*\(.*\)\s*(?::[^{]*)?\{\s*$|^\s*\)\s*(?::[^{]*)?\{\s*$/;

/**
 * Lines of the innermost function body (handler) that encloses `lines[index]`,
 * climbing out of `if`/`try`/loop blocks, and limited to the contiguous hunk the
 * sink sits in. Unseen lines are not evidence.
 *
 * @param {DiffLine[]} lines
 * @param {number} index
 * @returns {DiffLine[]}
 */
function enclosingHandler(lines, index) {
  let start = index;
  let depth = 0;
  let levels = 0;
  let found = false;
  for (let i = index - 1; i >= 0; i -= 1) {
    if (lines[i].line !== lines[i + 1].line - 1) break; // hunk boundary
    start = i;
    if (isCommentLine(lines[i].text)) continue;
    depth -= net(lines[i].text, '{', '}');
    if (depth < -levels) {
      levels = -depth; // this line opens a block around the sink
      if (FUNCTION_OPENER.test(stripStrings(lines[i].text))) {
        found = true;
        break;
      }
    }
  }
  // Opener not in the hunk: stop at the first closer of a block we did not see open.
  const closeAt = found ? -levels : -levels - 1;
  let end = index;
  depth = net(lines[index].text, '{', '}');
  for (let i = index + 1; i < lines.length; i += 1) {
    if (lines[i].line !== lines[i - 1].line + 1) break; // hunk boundary
    end = i;
    if (isCommentLine(lines[i].text)) continue;
    depth += net(lines[i].text, '{', '}');
    if (depth <= closeAt) break; // this line closes the handler
  }
  return lines.slice(start, end + 1);
}

/**
 * Text of the sink call, from `findX(` until its parentheses balance.
 *
 * @param {DiffLine[]} lines
 * @param {number} index
 * @returns {string}
 */
function sinkCall(lines, index) {
  const match = SINK.exec(lines[index].text);
  let text = '';
  let depth = 0;
  for (let i = index; i < lines.length; i += 1) {
    if (i > index && lines[i].line !== lines[i - 1].line + 1) break; // hunk boundary
    const source = i === index && match ? lines[i].text.slice(match.index) : lines[i].text;
    for (const ch of stripStrings(source)) {
      text += ch;
      if (ch === '(') {
        depth += 1;
      } else if (ch === ')') {
        depth -= 1;
        if (depth === 0) return text;
      }
    }
    text += '\n';
  }
  return text;
}

/**
 * @param {DiffLine[]} scope
 * @param {string} call
 * @returns {boolean}
 */
function hasAuthzCheck(scope, call) {
  if (OWNERSHIP_FILTER.test(call)) {
    return true;
  }
  return scope.some((line) => !isCommentLine(line.text) && AUTHZ_IN_SCOPE.test(stripStrings(line.text)));
}

/**
 * @param {DiffFile} file
 * @returns {Finding[]}
 */
function apply(file) {
  const callerIdInDiff = file.added.some((line) => !isCommentLine(line.text) && CALLER_ID.test(line.text));
  if (!callerIdInDiff) {
    return [];
  }

  return compactFindings(
    file.lines.map((line, index) => {
      if (line.kind !== 'add' || isCommentLine(line.text) || !SINK.test(line.text)) {
        return null;
      }
      if (hasAuthzCheck(enclosingHandler(file.lines, index), sinkCall(file.lines, index))) {
        return null;
      }
      return createFinding({
        title: 'Missing object-level authorization',
        findingClass: 'authz',
        path: file.path,
        line: line.line,
        cwe: 'CWE-639',
        owasp: labelsFor('authz'),
        severity: 'HIGH',
      });
    }),
  );
}

module.exports = { apply };
