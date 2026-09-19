'use strict';

/**
 * @typedef {'add' | 'context'} DiffLineKind
 * @typedef {{ path: string, line: number, text: string, kind: DiffLineKind }} DiffLine
 * @typedef {{ path: string, lines: DiffLine[], added: DiffLine[] }} DiffFile
 */

/**
 * Parse a unified diff into per-file added/context lines with new-file numbers.
 * Only hunk lines on the `+++` side are evidence (guardrail: path:line in the diff).
 *
 * @param {string} diffText
 * @returns {DiffFile[]}
 */
function parseUnifiedDiff(diffText) {
  /** @type {DiffFile[]} */
  const files = [];
  /** @type {DiffFile | null} */
  let current = null;
  let newLine = 0;
  let inHunk = false;

  for (const raw of diffText.split(/\r?\n/)) {
    if (raw.startsWith('diff --git ')) {
      current = null;
      inHunk = false;
      continue;
    }

    if (raw.startsWith('+++ ')) {
      const spec = raw.slice(4).trim();
      if (spec === '/dev/null') {
        current = null;
        inHunk = false;
        continue;
      }
      const filePath = spec.replace(/^b\//, '');
      current = { path: filePath, lines: [], added: [] };
      files.push(current);
      inHunk = false;
      continue;
    }

    if (raw.startsWith('@@ ')) {
      const match = raw.match(/^@@\s+-\d+(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/);
      if (!match || !current) {
        inHunk = false;
        continue;
      }
      newLine = Number(match[1]);
      inHunk = true;
      continue;
    }

    if (!inHunk || !current) {
      continue;
    }

    if (raw.startsWith('+')) {
      const line = {
        path: current.path,
        line: newLine,
        text: raw.slice(1),
        kind: /** @type {const} */ ('add'),
      };
      current.lines.push(line);
      current.added.push(line);
      newLine += 1;
      continue;
    }

    if (raw.startsWith('-') || raw.startsWith('\\')) {
      continue;
    }

    const text = raw.startsWith(' ') ? raw.slice(1) : raw;
    current.lines.push({
      path: current.path,
      line: newLine,
      text,
      kind: 'context',
    });
    newLine += 1;
  }

  return files;
}

module.exports = { parseUnifiedDiff };
