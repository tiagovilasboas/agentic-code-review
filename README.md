# Agentic Code Review

**PT** · Kit Staff de **code review com agents**: **skills · runbooks · guardrails** de boas práticas e segurança. Valor pra comunidade; evidência de AppSec + Agentic.

**EN** · Staff kit for **agentic code review**: **skills · runbooks · security/practice guardrails**. Community value; AppSec + Agentic evidence.

Maintainer: [Tiago Montanha](https://github.com/tiagovilasboas) · Staff · AppSec · Agentic AI

---

## Peças / Pieces

| Pasta | PT | EN |
|---|---|---|
| `skills/` | Skills/prompts de review (diff, authZ, secrets, ASVS) | Review skills/prompts |
| `runbooks/` | Fluxo humano+agent (quando HITL) | Human+agent flow |
| `guardrails/` | Regras fail-closed (não pular) | Fail-closed rules |

---

## Princípios / Principles

1. **Fail closed** — sem evidência arquivo:linha, não inventa achado
2. **HITL em write** — merge/comment sensível com humano
3. **Anonimizado** — sem IP de cliente; exemplos genéricos
4. **Simples** — poucas skills boas > dezenas de prompts

---

## Começar / Start

1. Leia `runbooks/00-overview.md` (WIP)
2. Escolha uma skill em `skills/`
3. Rode no seu agent (Cursor / CLI / outro) com o diff do PR
4. Aplique `guardrails/` como checklist obrigatório

---

## Roadmap curto

- [ ] Skill: authZ / IDOR
- [ ] Skill: secrets & config
- [ ] Skill: ASVS L1 smoke
- [ ] Runbook: PR review 15 min
- [ ] Guardrail: no finding without path:line

Relacionados: [agent-measurement](https://github.com/tiagovilasboas/agent-measurement) · [awesome-agentic-ai](https://github.com/tiagovilasboas/awesome-agentic-ai)

---

## License

MIT
