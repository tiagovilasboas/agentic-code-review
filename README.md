# Agentic Code Review

## Purpose / Propósito

**PT:** Entregar um kit **simples e acionável** para review de PR com agents: **skills** (o que o agent faz), **runbooks** (quando humano entra), **guardrails** (o que nunca pode pular). Valor pra comunidade + evidência pública de AppSec · Agentic.

**EN:** A **simple, actionable** kit for agentic PR review: **skills** (what the agent does), **runbooks** (when humans step in), **guardrails** (what must never be skipped). Community value + public AppSec · Agentic evidence.

**Não é / Not:** scanner SaaS · dump de 50 prompts · “AI review” sem evidência arquivo:linha.

Maintainer: [Tiago Montanha](https://github.com/tiagovilasboas) · Staff · AppSec · Agentic AI

---

## Layout

| Path | Role |
|---|---|
| `skills/` | Review prompts/skills |
| `runbooks/` | Human + agent flow |
| `guardrails/` | Fail-closed rules |
| `examples/` | Sample PR diff + expected report (dry-run) |

---

## Start in 15 minutes

1. Read [`runbooks/00-overview.md`](runbooks/00-overview.md)
2. Dry-run (optional): apply skills to [`examples/sample-pr.diff`](examples/sample-pr.diff) and compare [`examples/sample-report.md`](examples/sample-report.md)
3. Run [`skills/authz-idor.md`](skills/authz-idor.md) on a real PR diff (then optionally [`skills/secrets-config.md`](skills/secrets-config.md))
4. Enforce [`guardrails/evidence-required.md`](guardrails/evidence-required.md)

Agent do/don't (any harness): [`AGENTS.md`](AGENTS.md).

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to add a skill or runbook, the evidence contract (`path:line` or silence), and the pull-request checklist. Use the **Add a skill** issue template to propose new skills.

---

## Inspired by

- [OWASP secure-agent-playbook](https://github.com/owasp/secure-agent-playbook)
- [OWASP agent-skills (ASVS)](https://github.com/eoftedal/owasp-agent-skills-project)
- [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
- [OWASP AISVS](https://owasp.org/www-project-artificial-intelligence-security-verification-standard-aisvs-docs/)
- [OWASP appsec-agent](https://github.com/OWASP/appsec-agent)

Related: [agent-measurement](https://github.com/tiagovilasboas/agent-measurement) · [awesome-agentic-ai](https://github.com/tiagovilasboas/awesome-agentic-ai) · [kiro-playbook](https://github.com/tiagovilasboas/kiro-playbook)

## License

MIT
