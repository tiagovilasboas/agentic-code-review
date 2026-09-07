# Runbook — Agentic PR review (15 min)

## Purpose
Ship a useful security/quality pass with an agent without inventing findings. Time box: **~15 minutes** wall-clock for a single PR of moderate size.

## Inputs
| Input | Required | Notes |
|---|---|---|
| PR diff (paste, patch file, or PR URL the human already fetched) | Yes | Agent works from **this** diff, not imagined repo context |
| Skill to run | Yes | One skill per pass |
| Guardrail | Always | [`evidence-required`](../guardrails/evidence-required.md) |

Dry-run without a real PR: use [`examples/sample-pr.diff`](../examples/sample-pr.diff) and compare to [`examples/sample-report.md`](../examples/sample-report.md).

## Flow

1. **Human — prepare (2 min)**  
   Paste the PR diff (or point the agent at a local patch). State which skill to run first. Default first pass: `skills/authz-idor.md`.

2. **Agent — pass N (5–8 min per skill)**  
   Follow the skill file only. Scope = provided diff. Output lines shaped like GitHub code-scanning alerts: `SEVERITY | file:line | why`.

3. **Guardrail — evidence check (1 min)**  
   Drop any finding without `path:line`, or mark `insufficient evidence`. Do not invent CWE / CVE / CVSS. Do not write exploit PoCs or payloads.

4. **Optional second pass**  
   Re-run with `skills/secrets-config.md` on the **same** diff. Do not mix both skills in one unstructured blob — keep passes separate so humans can audit.

5. **HITL — human decides (2–5 min)**  
   Human chooses merge / request changes / escalate. **Agent does not merge, push, deploy, or rotate secrets.**

6. **Stop**  
   Hand the report back. If a real credential appeared in the remote, human rotates outside this kit.

## Decision table

| Agent output | Human action |
|---|---|
| CRITICAL/HIGH with `file:line` | Prefer **request changes** before merge |
| MEDIUM/LOW with `file:line` | Fix now or track; human judgment |
| `insufficient evidence` | Expand diff / ask author — do not invent |
| `no evidence-based findings` | Proceed with normal review |

## Risk anchors (OWASP Web)

Skills in this kit map to web AppSec classes (not a full Top 10 dump):

| Skill | Primary OWASP Web refs |
|---|---|
| `authz-idor.md` | [A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/), [API1:2023 BOLA](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/) |
| `secrets-config.md` | [A02:2021 Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/), [A05:2021 Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/) |

Agentic posture (LLM / GenAI): prefer fail-closed agency — overreliance and excessive agency mean the agent **stops** for HITL instead of “fixing” production.

## Done when
- Report lists findings **or** explicit `no evidence-based findings`
- No finding without `path:line`
- No exploit PoC / payload / attack procedure in the report
- Human recorded merge vs request-changes decision
