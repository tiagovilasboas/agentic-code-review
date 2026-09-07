## Why

What problem does this change solve? Keep it Staff-shaped: problem and constraints first, not a file list.

## What

What changed, and what is explicitly **out of scope**?

- [ ] Skill (`skills/…`)
- [ ] Runbook (`runbooks/…`)
- [ ] Guardrail (`guardrails/…`)
- [ ] Hygiene / docs only (LICENSE, CONTRIBUTING, templates)

## How to verify

Commands, paths, and expected output. Reviewers should be able to re-run this without guessing.

```bash
# Example: open the new skill and apply it to a PR diff
# Then confirm every finding has file:line or "insufficient evidence"
```

## Evidence contract

- [ ] Every claimed finding (if this PR is a skill/runbook) requires `path:line` + one-line why
- [ ] No invented CWE / CVE / CVSS
- [ ] Agent still does **not** merge, deploy, or rotate secrets
- [ ] No exploit PoC or attack procedure

## Risk class (skills / runbooks only)

Which OWASP LLM / GenAI class does this exercise? Leave blank for hygiene-only PRs.

## Checklist

- [ ] English title and body
- [ ] Follows [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] Commands and paths are in English fenced blocks
- [ ] README layout table still accurate if a path was added
