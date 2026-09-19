'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { parseUnifiedDiff } = require('../src/parse-diff');

const examples = path.join(__dirname, '..', 'examples');

/**
 * @param {string} name
 * @returns {import('../src/parse-diff').DiffFile[]}
 */
function parseExample(name) {
  return parseUnifiedDiff(fs.readFileSync(path.join(examples, name), 'utf8'));
}

/**
 * @param {import('../src/parse-diff').DiffFile[]} files
 * @param {string} filePath
 * @param {string} snippet
 * @returns {number}
 */
function addedLineContaining(files, filePath, snippet) {
  const file = files.find((entry) => entry.path === filePath);
  assert.ok(file, `missing file ${filePath}`);
  const hit = file.added.find((line) => line.text.includes(snippet));
  assert.ok(hit, `missing added line with ${snippet} in ${filePath}`);
  return hit.line;
}

test('xss fixture: dangerouslySetInnerHTML is CommentBody.tsx:18', () => {
  const files = parseExample('xss-sink.sample.diff');
  assert.equal(
    addedLineContaining(files, 'web/src/components/CommentBody.tsx', 'dangerouslySetInnerHTML'),
    18,
  );
});

test('ssrf fixture: open fetch is preview.ts:14; hardcoded ping is not added', () => {
  const files = parseExample('ssrf-egress.sample.diff');
  const preview = files.find((file) => file.path === 'src/api/preview.ts');
  assert.ok(preview);
  assert.equal(
    addedLineContaining(files, 'src/api/preview.ts', 'fetch(targetUrl'),
    14,
  );
  assert.equal(
    preview.added.some((line) => line.text.includes('status.example.invalid')),
    false,
  );
});

test('supply-chain fixture: postinstall / registry / Action / npm install lines', () => {
  const files = parseExample('supply-chain.sample.diff');
  assert.equal(addedLineContaining(files, 'package.json', 'postinstall'), 8);
  assert.equal(addedLineContaining(files, '.npmrc', 'registry='), 2);
  assert.equal(
    addedLineContaining(files, '.github/workflows/ci.yml', 'some-org/cache-warmup@v1'),
    9,
  );
  assert.equal(addedLineContaining(files, '.github/workflows/ci.yml', 'npm install'), 14);
});

test('sample-pr fixture: findById / token / CORS land in hunks', () => {
  const files = parseExample('sample-pr.diff');
  assert.equal(addedLineContaining(files, 'src/api/orders.ts', 'findById'), 36);
  assert.equal(addedLineContaining(files, 'config/app.ts', 'paymentApiToken'), 14);
  assert.equal(addedLineContaining(files, 'src/server.ts', 'origin: "*"'), 8);
});
