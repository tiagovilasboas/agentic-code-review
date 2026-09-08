# Runbook — Agentic PR review (15 min)

## Purpose
Ship a useful security/quality pass with an agent without inventing findings. Time box: **~15 minutes** wall-clock for a single PR of moderate size.

## Inputs
| Input | Required | Notes |
|---|---|---|
| PR diff (paste, patch file, or PR URL the human already fetched) | Yes | Agent works from **this** diff, not imagined repo context |
| Skill to run | Yes | One skill per pass — pick from the when-to-load table |
| Guardrail | Always | [`evidence-required`](../guardrails/evidence-required.md) |

Dry-run without a real PR — index: [`examples/README.md`](../examples/README.md)

- AuthZ + secrets: [`examples/sample-pr.diff`](../examples/sample-pr.diff) → [`examples/sample-report.md`](../examples/sample-report.md)
- XSS sink: [`examples/xss-sink.sample.diff`](../examples/xss-sink.sample.diff) → [`examples/xss-sink.sample-report.md`](../examples/xss-sink.sample-report.md)
- SSRF egress: [`examples/ssrf-egress.sample.diff`](../examples/ssrf-egress.sample.diff) → [`examples/ssrf-egress.sample-report.md`](../examples/ssrf-egress.sample-report.md)
- Supply chain: [`examples/supply-chain.sample.diff`](../examples/supply-chain.sample.diff) → [`examples/supply-chain.sample-report.md`](../examples/supply-chain.sample-report.md)

## Flow

1. **Human — prepare (2 min)**  
   Paste the PR diff (or point the agent at a local patch). State which skill to run first. Use the when-to-load table; default first pass is still `skills/authz-idor.md` when the hunks touch object access.

2. **Agent — pass N (5–8 min per skill)**  
   Follow the skill file only. Scope = provided diff. Output lines shaped like GitHub code-scanning alerts: `SEVERITY | file:line | why`.

3. **Guardrail — evidence check (1 min)**  
   Drop any finding without `path:line`, or mark `insufficient evidence`. Do not invent CWE / CVE / CVSS. Do not write exploit PoCs or payloads.

4. **Optional next pass**  
   Re-run with another matching skill on the **same** diff (see when-to-load). Do not mix skills in one unstructured blob — keep passes separate so humans can audit.

5. **HITL — human decides (2–5 min)**  
   Human chooses merge / request changes / escalate. **Agent does not merge, push, deploy, or rotate secrets.**

6. **Stop**  
   Hand the report back. Name skills you did **not** load. If a real credential appeared in the remote, human rotates outside this kit.

## Skill pack — when to load

| Load | When the diff… | Skip when |
|---|---|---|
| [`skills/authz-idor.md`](../skills/authz-idor.md) | Touches handlers, path/query ids, object fetch/update/delete | Pure CSS/docs, no object access |
| [`skills/secrets-config.md`](../skills/secrets-config.md) | Touches env, tokens, CORS, debug flags, credentials in URLs | No config / secret-shaped strings |
| [`skills/xss-html.md`](../skills/xss-html.md) | Touches HTML, templates, markdown→HTML, React/Vue/Angular render | Backend-only JSON, no UI sink |
| [`skills/ssrf-egress.md`](../skills/ssrf-egress.md) | Server fetches a URL/host, webhooks, previews, import-from-URL | Client-only `fetch` to *your* API |
| [`skills/supply-chain.md`](../skills/supply-chain.md) | Lockfile, manifest, `.npmrc`, Dockerfile, CI `uses:`, install scripts | App code only, no install/CI |

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
| `xss-html.md` | [A03:2021 Injection](https://owasp.org/Top10/A03_2021-Injection/), [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) |
| `ssrf-egress.md` | [A10:2021 SSRF](https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/), [SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) |
| `supply-chain.md` | [A06:2021 Vulnerable and Outdated Components](https://owasp.org/Top10/2021/A06_2021-Vulnerable_and_Outdated_Components/), [A08:2021 Software and Data Integrity Failures](https://owasp.org/Top10/2021/A08_2021-Software_and_Data_Integrity_Failures/) |

Agentic posture (LLM / GenAI): prefer fail-closed agency — overreliance and excessive agency mean the agent **stops** for HITL instead of “fixing” production.

## Done when
- Report lists findings **or** explicit `no evidence-based findings`
- No finding without `path:line`
- No exploit PoC / payload / attack procedure in the report
- Skills you did **not** load are named (so a human can load them)
- Human recorded merge vs request-changes decision
