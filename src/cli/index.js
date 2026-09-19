'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { reviewDiff } = require('../review');
const { formatReport, exitCodeFor } = require('../print');

/**
 * @param {string[]} argv
 * @param {{ stdout?: NodeJS.WritableStream, stderr?: NodeJS.WritableStream }} [io]
 * @returns {number}
 */
function main(argv, io = {}) {
  const stdout = io.stdout || process.stdout;
  const stderr = io.stderr || process.stderr;
  const diffArg = argv.find((arg) => arg !== '--');

  if (!diffArg) {
    stderr.write('Usage: npm run review -- <diff-file>\n');
    return 2;
  }

  const diffPath = path.resolve(process.cwd(), diffArg);
  let text;
  try {
    text = fs.readFileSync(diffPath, 'utf8');
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    stderr.write(`error: cannot read ${diffArg}: ${reason}\n`);
    return 2;
  }

  const findings = reviewDiff(text);
  stdout.write(formatReport(findings));
  return exitCodeFor(findings);
}

module.exports = { main };
