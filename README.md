# Agentic Code Review

Actionable kit for agentic PR review: **skills**, **runbooks**, and fail-closed **guardrails**. Findings need AppSec evidence (`path:line`).

Kit acionável de review de PR com agents: skills, runbooks e guardrails. Achado só com evidência AppSec (`path:line`).

Maintainer: [Tiago Montanha](https://github.com/tiagovilasboas) · Staff · AppSec · Agentic AI

---

## Layout

| Path | Role |
|---|---|
| `skills/` | Review prompts/skills |
| `runbooks/` | Human + agent flow |
| `guardrails/` | Fail-closed rules |
| `examples/` | Sample PR diffs + expected reports (dry-run, not prod) |

---

## Start in 15 minutes

1. Read [`runbooks/00-overview.md`](runbooks/00-overview.md) (when-to-load table)
2. Dry-run (optional) — index: [`examples/README.md`](examples/README.md)
   - Stage 1 (AuthZ + secrets): [`examples/sample-pr.diff`](examples/sample-pr.diff) → [`examples/sample-report.md`](examples/sample-report.md)
   - Stage 2 (XSS sink): [`examples/xss-sink.sample.diff`](examples/xss-sink.sample.diff) → [`examples/xss-sink.sample-report.md`](examples/xss-sink.sample-report.md)
   - Stage 3 (supply chain): [`examples/supply-chain.sample.diff`](examples/supply-chain.sample.diff) → [`examples/supply-chain.sample-report.md`](examples/supply-chain.sample-report.md)
3. Pick **one** skill that matches the diff — not the whole pack:
   - [`skills/authz-idor.md`](skills/authz-idor.md)
   - [`skills/secrets-config.md`](skills/secrets-config.md)
   - [`skills/xss-html.md`](skills/xss-html.md)
   - [`skills/ssrf-egress.md`](skills/ssrf-egress.md)
   - [`skills/supply-chain.md`](skills/supply-chain.md)
4. Enforce [`guardrails/evidence-required.md`](guardrails/evidence-required.md)

Agent do/don't (any harness): [`AGENTS.md`](AGENTS.md).

---

## Inspired by

- [OWASP secure-agent-playbook](https://github.com/owasp/secure-agent-playbook)
- [OWASP agent-skills (ASVS)](https://github.com/eoftedal/owasp-agent-skills-project)
- [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
- [OWASP AISVS](https://owasp.org/www-project-artificial-intelligence-security-verification-standard-aisvs-docs/)
- [OWASP appsec-agent](https://github.com/OWASP/appsec-agent)

## Related

- [agent-measurement](https://github.com/tiagovilasboas/agent-measurement) — Eval harness (suites, named metrics, reports). Measures agents; not this review kit.
- [awesome-agentic-ai](https://github.com/tiagovilasboas/awesome-agentic-ai) — Curated short list (MCP, harnesses, HITL/ops, agent security). Decision filter, not a skill pack.
- [kiro-playbook](https://github.com/tiagovilasboas/kiro-playbook) — IDE steerings, skills, and hooks for a squad. Starting point, not harness-agnostic AppSec review.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to add a skill or runbook, the evidence contract (`path:line` or silence), and the pull-request checklist. Use the **Add a skill** issue template to propose new skills.

Agent notes: [`AGENTS.md`](AGENTS.md).

## License

MIT — see [LICENSE](LICENSE).
