'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { CLI_LABELS, SKILL_MAP, isOfficialId, labelsFor, assertOfficialIds } = require('../src/owasp-catalog');

test('every CLI label is an official OWASP id shape', () => {
  for (const [key, ids] of Object.entries(CLI_LABELS)) {
    assert.ok(ids.length > 0, `${key} has no labels`);
    for (const id of ids) {
      assert.equal(isOfficialId(id), true, `${key} has unofficial id ${id}`);
    }
  }
});

test('every skill map id is official; app labels stay on Web/API/ASVS', () => {
  for (const [skill, map] of Object.entries(SKILL_MAP)) {
    assert.ok(map.app.length > 0, `${skill} missing app ids`);
    assert.ok(map.posture.length > 0, `${skill} missing posture ids`);
    for (const id of [...map.app, ...map.posture]) {
      assert.equal(isOfficialId(id), true, `${skill} has unofficial id ${id}`);
    }
    for (const id of map.app) {
      assert.match(id, /^(?:A0[1-9]:2021|A10:2021|API[1-9]:2023|ASVS-5\.0-\d+\.\d+\.\d+)$/);
    }
    for (const id of map.posture) {
      assert.match(id, /^(?:ASI[0-9]{2}:2026|AST[0-9]{2})$/);
    }
  }
});

test('labelsFor and assertOfficialIds are fail-closed', () => {
  assert.deepEqual(labelsFor('xss'), ['A03:2021', 'ASVS-5.0-1.3.1']);
  assert.deepEqual(labelsFor('missing'), []);
  assert.equal(assertOfficialIds([]), null);
  assert.equal(assertOfficialIds(['CWE-79']), null);
  assert.equal(assertOfficialIds(['A99:2021']), null);
  assert.deepEqual(assertOfficialIds(['A01:2021', 'ASVS-5.0-8.2.2']), ['A01:2021', 'ASVS-5.0-8.2.2']);
});
