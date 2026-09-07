# Contributing

Thanks for helping keep this kit small, evidence-first, and usable in a 15-minute PR review.

This repository is an **actionable kit** for agentic pull-request review:

| Path | Role |
|---|---|
| `skills/` | What the agent checks |
| `runbooks/` | When a human must step in |
| `guardrails/` | What must never be skipped |
| `examples/` | Sample PR diff + expected report (dry-run only) |

It is **not** a scanner SaaS, a dump of 50 prompts, or an “AI review” that invents findings.

## Quality bar

Every contribution must survive a Staff AppSec review. Align with how practitioners and platforms already report risk:

- **OWASP Top 10 for LLM Applications** — name the risk class the skill actually exercises (prompt injection, insecure output handling, sensitive information disclosure, excessive agency, overreliance). Do not paste the whole list into a skill.
- **OWASP GenAI / agentic framing** — agents take actions. Skills inspect diffs; humans decide merge. No skill grants the agent merge, deploy, or secret-rotation authority.
- **Practitioner checklists** — prefer a short, fail-closed checklist over narrative. Every step must be runnable on a PR diff.
- **Evidence path (GitHub code-security style)** — a finding is not a finding without a location. Report `path:line` (or `file:line`), a one-line why, and severity. Same contract as [code scanning alerts](https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/about-code-scanning-alerts): tool/skill name, location, severity, nature of the problem.

Hard rules:

1. **Evidence or silence.** No `path:line` → drop the finding or mark `insufficient evidence`. See [`guardrails/evidence-required.md`](guardrails/evidence-required.md).
2. **Do not invent CWE / CVE / CVSS.** If the mapping is not obvious from the diff, omit it.
3. **Fail closed on agency.** The agent never merges. Human-in-the-loop is the default (overreliance and excessive agency are first-class risks).
4. **English** for skills, runbooks, guardrails, issues, and PRs. Paths, commands, and identifiers stay in English inside fenced blocks.

Severity labels stay consistent with GitHub security severity: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`. If unsure, use `LOW` or say insufficient evidence.

## What belongs here

A skill, runbook, or guardrail lands only if all of these are true:

1. **It is a reusable review contract**, not a one-off prompt for a single repo.
2. **It is harness-agnostic** — works when a human pastes a diff into any agent. No vendor lock-in, no required MCP, no required CI product.
3. **It was (or can be) run on a real PR diff** and produces either evidence-backed findings or an explicit “no evidence-based findings”.
4. **It names the human gate** — when to stop, escalate, or refuse.

What does **not** belong:

- Unverified claims, blog-only threat names, or “this looks like XSS” without a location
- Exploit proof-of-concepts, payloads, or attack procedures
- Skills that tell the agent to apply patches, rotate secrets, or merge
- Vendor-specific playbooks that only work inside one IDE or one scanner
- Prompt dumps without Purpose / Instructions / Output format

## Adding a skill

Skills live in `skills/`. Filename is English kebab-case.

```bash
touch skills/my-skill.md
```

Use this structure (match existing files such as `skills/authz-idor.md`):

```markdown
# Skill — Short title

## Purpose
One sentence: what risk this skill looks for in a PR diff.

## Risk class
OWASP LLM / GenAI class this skill exercises (one or two, not the full Top 10).

## Instructions for the agent
1. Numbered, fail-closed steps.
2. Scope is the **diff**, not the whole repo, unless the runbook says otherwise.
3. Every finding: `file:line` + one-line why.
4. If unsure: **insufficient evidence** — do not invent CWE.

## Output format
- `SEVERITY` | `file:line` | summary | (optional CWE only if obvious)
```

Acceptance for a skill PR:

- [ ] Purpose is a single risk, not “review the whole PR”
- [ ] Instructions are numbered and runnable on a diff
- [ ] Output format requires `file:line` (GitHub alert-style location)
- [ ] Uncertain cases are `insufficient evidence`, not guessed CWEs
- [ ] No merge / exploit / payload steps
- [ ] English only; commands and paths in fenced blocks

Propose new skills with the **Add a skill** issue template before a large write-up.

## Adding a runbook

Runbooks live in `runbooks/`. They describe **human + agent** flow, not extra model instructions.

```bash
touch runbooks/nn-short-name.md
```

Minimum sections:

```markdown
# Runbook — Title

## Purpose
When this flow is used (time box if possible).

## Flow
1. **Human** provides the PR diff (or points the agent at the PR).
2. **Agent** runs one skill at a time.
3. **Guardrail:** every finding needs `path:line`.
4. **HITL:** human decides merge / request changes — agent does not merge.

## Done when
- Findings list **or** explicit "no evidence-based findings"
- No finding without path:line
```

Number new runbooks after `00-overview.md` (`01-…`, `02-…`). Do not replace the 15-minute overview unless you are fixing it.

## Adding a guardrail

Guardrails are fail-closed invariants. Keep them short.

```bash
touch guardrails/my-guardrail.md
```

```markdown
# Guardrail — Title

## Rule (fail closed)
The invariant in one sentence.

## Rationale
Why Staff review would reject a report that skips this.

## Enforcement
What to drop or mark when the rule is broken.
```

New guardrails must not weaken [`guardrails/evidence-required.md`](guardrails/evidence-required.md).

## How to run a review (local)

There is no installer. Clone, read, run one skill on a diff.

```bash
git clone https://github.com/tiagovilasboas/agentic-code-review.git
cd agentic-code-review
```

Then:

```bash
# 1. Read the human + agent flow
#    runbooks/00-overview.md
#
# 2. Optional dry-run on a sample diff
#    examples/sample-pr.diff + examples/sample-report.md
#    examples/xss-sink.sample.diff + examples/xss-sink.sample-report.md
#
# 3. Point your agent at one skill and a PR diff
#    skills/authz-idor.md
#    skills/secrets-config.md
#    skills/xss-html.md
#    skills/ssrf-egress.md
#    skills/supply-chain.md
#
# 4. Enforce the evidence guardrail before you trust the report
#    guardrails/evidence-required.md
```

A finding line should look like a code-scanning annotation, not a paragraph:

```text
HIGH | src/api/orders.ts:142 | object id from path used without ownership check
```

If the agent cannot cite a line:

```text
insufficient evidence — identifier usage is outside the provided diff
```

## Language and style

- **English** for all new contributor-facing text (this file, issue/PR templates, skills, runbooks, guardrails).
- Commands, paths, and identifiers stay in **English fenced blocks**. Do not mix another language into the same fence.
- Prefer checklists and tables over long prose.
- Cite a public source when you introduce a risk name (OWASP LLM Top 10, OWASP GenAI, GitHub code-security docs). Accuracy matters more than coverage.

## Pull request checklist

- [ ] English title and body (`Why` / `What` / `How to verify`)
- [ ] Only the paths that belong to the change (`skills/`, `runbooks/`, `guardrails/`, `examples/`, or hygiene docs)
- [ ] New skill/runbook follows the templates above
- [ ] Findings contract still requires `path:line`
- [ ] No exploit PoC, no new vendor lock-in, no agent-merge instructions
- [ ] README layout table still accurate if you added a path

## Review process

PRs are reviewed as Staff AppSec artifacts: problem first, evidence second, agency last. Expect questions of the form “where is the line?” and “why does the agent stop here?”.

Stage 1 added denser skills (`authz-idor`, `secrets-config`), a denser overview runbook, and `examples/` (`sample-pr.diff`, `sample-report.md`) for dry-runs. Stage 2 added `xss-html`, `ssrf-egress`, `supply-chain`, and `examples/xss-sink.sample.*`. Further stages may add more skills; keep examples free of exploit PoCs.
