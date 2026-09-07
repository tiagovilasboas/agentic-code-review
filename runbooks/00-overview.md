# Runbook — Agentic PR review (15 min)

## Purpose
Ship a useful security/quality pass with an agent without inventing findings.

## Flow
1. **Human** pastes PR diff (or points agent at the PR).
2. **Agent** runs one skill at a time (start: `skills/authz-idor.md`).
3. **Guardrail:** every finding needs `path:line` ([evidence-required](../guardrails/evidence-required.md)).
4. **HITL:** human decides merge / request changes — agent does not merge.
5. Optional: re-run with `skills/secrets-config.md`.

## Done when
- Report lists findings **or** explicit "no evidence-based findings"
- No finding without path:line
