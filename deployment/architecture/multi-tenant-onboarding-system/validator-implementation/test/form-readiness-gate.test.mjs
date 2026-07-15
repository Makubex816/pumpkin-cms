import test from 'node:test';
import assert from 'node:assert/strict';
import { FORM_READINESS_GATE_IDS, assertPublicFormActivation, evaluateFormReadinessGate } from '../src/form-readiness-gate.mjs';

test('future tenant forms remain no-post when any required evidence is missing', () => {
  const evidence = Object.fromEntries(FORM_READINESS_GATE_IDS.map((id) => [id, true]));
  evidence.terminal401 = false;
  const result = evaluateFormReadinessGate(evidence);
  assert.equal(result.gateCount, 30);
  assert.equal(result.overallStatus, 'forms_held_no_post');
  assert.deepEqual(result.blockers, ['terminal401']);
  assert.throws(() => assertPublicFormActivation(evidence), { code: 'FORMS_HELD_NO_POST' });
});

test('public activation requires all thirty gates', () => {
  const evidence = Object.fromEntries(FORM_READINESS_GATE_IDS.map((id) => [id, true]));
  const result = assertPublicFormActivation(evidence);
  assert.equal(result.passedCount, 30);
  assert.equal(result.overallStatus, 'ready_forms_live');
  assert.equal(result.publicFormMode, 'live');
});
