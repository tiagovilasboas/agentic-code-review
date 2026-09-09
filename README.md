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
| `scripts/` | Fixture pairing check (CI) |

---

## Start in 15 minutes

1. Read [`runbooks/00-overview.md`](runbooks/00-overview.md) (when-to-load table)
2. Dry-run (optional). Cookbook: [`runbooks/01-dry-run-cookbook.md`](runbooks/01-dry-run-cookbook.md). Index: [`examples/README.md`](examples/README.md)
   - AuthZ + secrets: [`examples/sample-pr.diff`](examples/sample-pr.diff) → [`examples/sample-report.md`](examples/sample-report.md)
   - XSS sink: [`examples/xss-sink.sample.diff`](examples/xss-sink.sample.diff) → [`examples/xss-sink.sample-report.md`](examples/xss-sink.sample-report.md)
   - SSRF egress: [`examples/ssrf-egress.sample.diff`](examples/ssrf-egress.sample.diff) → [`examples/ssrf-egress.sample-report.md`](examples/ssrf-egress.sample-report.md)
   - Supply chain: [`examples/supply-chain.sample.diff`](examples/supply-chain.sample.diff) → [`examples/supply-chain.sample-report.md`](examples/supply-chain.sample-report.md)
3. Pick **one** skill that matches the diff, not the whole pack:
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

This kit is AppSec PR review: skills, runbooks, `path:line` or silence. Siblings are scoped kits, not this pack.

- [awesome-agentic-ai](https://github.com/tiagovilasboas/awesome-agentic-ai): Curated short list: MCP, harnesses, agent security. Decision filter, not a skill pack.
- [agent-measurement](https://github.com/tiagovilasboas/agent-measurement): Eval harness: suites, named metrics, markdown reports. Measure; do not train.
- [jarvis-architecture](https://github.com/tiagovilasboas/jarvis-architecture): Reference architecture: brain · workers · ops. Swap the host, keep the domain.
- [kiro-crew](https://github.com/tiagovilasboas/kiro-crew): Crew pattern: Planner → Implementer → Reviewer → Ops. Kiro is the example host.
- [grok-bot-architecture](https://github.com/tiagovilasboas/grok-bot-architecture): Desktop assistant OS: chief-of-staff, specialists, shared computer, connectors.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to add a skill or runbook, the evidence contract (`path:line` or silence), and the pull-request checklist. Fixture pairs are checked in CI (`scripts/check-fixture-pairs.sh`). Use the **Add a skill** issue template to propose new skills.

Agent notes: [`AGENTS.md`](AGENTS.md).

## License

MIT. See [LICENSE](LICENSE).
