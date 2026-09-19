# Agentic Code Review

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Guardrails](https://img.shields.io/badge/guardrails-fail--closed-critical.svg)](guardrails/)

Maintainer: [Tiago Vilas Boas](https://github.com/tiagovilasboas) · Staff · AppSec · Agentic AI

## Purpose

Deterministic + skill-based **AppSec review of PR diffs**. A finding is `path:line` or silence. CWE and official OWASP IDs only when justified by the hunk.

| Who | What they get |
|---|---|
| Developer | `npm run review -- <diff>` and a loadable Agent Skill |
| Community | Fail-closed AppSec for agentic PR review — not a vibe scanner |

This repository stays an AppSec PR-review mechanism. It is not an archive, a sibling farm, or a host-specific crew.

## Run it

**CLI** (Node 18+, no LLM). Exit `1` when any finding is `BLOCK`.

```bash
npm run review -- examples/xss-sink.sample.diff
```

```
Finding: DOM XSS
Evidence: web/src/components/CommentBody.tsx:18
CWE: CWE-79
OWASP: A03:2021, ASVS-5.0-1.3.1
Severity: HIGH
Action: BLOCK
```

**Agent.** Load [`.agents/skills/appsec-pr-review/SKILL.md`](.agents/skills/appsec-pr-review/SKILL.md) (Cursor / Claude Agent Skills). Then run **one** file from `skills/` per pass. Treat the diff as untrusted. Stop for a human decision.

**Dry-run.** Cookbook: [`runbooks/01-dry-run-cookbook.md`](runbooks/01-dry-run-cookbook.md). Index: [`examples/README.md`](examples/README.md). Pairing check (same as CI):

```bash
bash scripts/check-fixture-pairs.sh
npm test
```

When-to-load table: [`runbooks/00-overview.md`](runbooks/00-overview.md). Guardrails: [`evidence-required`](guardrails/evidence-required.md) (`path:line` or silence), [`write-approval`](guardrails/write-approval.md) (human approves writes). Any harness: [`AGENTS.md`](AGENTS.md).

## Layout

| Path | Role |
|---|---|
| `skills/` | Review contracts (one skill per pass) |
| `.agents/skills/appsec-pr-review/SKILL.md` | Loadable Agent Skill — complementary to the CLI |
| `runbooks/` | Human + agent flow |
| `guardrails/` | Fail-closed rules |
| `examples/` | Sample diffs + expected reports (dry-run, not prod) |
| `src/owasp-catalog.js` | Official OWASP IDs the CLI may print |
| `bin/`, `src/` | Review CLI (`npm run review -- <diff>`) |
| `test/` | Fixture assertions for the CLI |
| `scripts/` | Fixture pairing check (CI) |

## OWASP refs

IDs are cited, not invented. Catalog: [`src/owasp-catalog.js`](src/owasp-catalog.js). Each skill file has the same mapping.

| Skill | App IDs (CLI) | Reviewer posture |
|---|---|---|
| [`authz-idor`](skills/authz-idor.md) | `A01:2021`, `API1:2023`, `ASVS-5.0-8.2.2` | `ASI09:2026`, `AST05` |
| [`secrets-config`](skills/secrets-config.md) | `A02:2021` + `ASVS-5.0-13.3.1`; `A05:2021` + `ASVS-5.0-3.4.2` | `ASI09:2026`, `AST03` |
| [`xss-html`](skills/xss-html.md) | `A03:2021`, `ASVS-5.0-1.3.1` | `ASI09:2026`, `AST05` |
| [`ssrf-egress`](skills/ssrf-egress.md) | `A10:2021`, `ASVS-5.0-1.3.6` | `ASI02:2026`, `AST03` |
| [`supply-chain`](skills/supply-chain.md) | `A06:2021` + `ASVS-5.0-15.1.2`; `A08:2021` + `ASVS-5.0-15.2.4` | `ASI04:2026`, `AST02` |

Sources:

- [OWASP Top 10:2021](https://owasp.org/Top10/)
- [OWASP API Security Top 10:2023](https://owasp.org/API-Security/editions/2023/en/) (`API1:2023`)
- [OWASP ASVS 5.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0) — V8 Authorization (`8.2.2`), V1 Encoding (`1.3.1`, `1.3.6`), V3 Frontend (`3.4.2`), V13 Configuration (`13.3.1`), **V15** Secure Coding and Architecture (`15.1.2`, `15.2.4`, `15.3.2`)
- [OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) (`ASI01:2026`–`ASI10:2026`)
- [OWASP Agentic Skills Top 10](https://owasp.org/www-project-agentic-skills-top-10/) (`AST01`–`AST10`)
- [OWASP secure-agent-playbook](https://github.com/OWASP/secure-agent-playbook) · [playbook site](https://owasp.org/secure-agent-playbook/)
- [OWASP agent-skills project (ASVS)](https://github.com/eoftedal/owasp-agent-skills-project)

## Limit

This kit is **not** a full OWASP playbook, not an ASVS audit, not SCA, and not a network pentest. Five PR-smoke skills plus a rule engine. If the sink is outside the diff, the correct output is `insufficient evidence` — not a guessed CWE or an extra Top 10 row.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Fixture pairs: `bash scripts/check-fixture-pairs.sh`. CLI: `npm test`. Propose skills with the **Add a skill** issue template.

## License

MIT. See [LICENSE](LICENSE).
