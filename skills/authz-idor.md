# Skill — AuthZ / IDOR smoke

## Purpose
Find missing authorization on object access (IDOR-style) in a PR diff.

## Instructions for the agent
1. Scan the diff for user-controlled identifiers (`id`, `uuid`, `slug`, path params).
2. Check whether the handler verifies the caller may access that object.
3. Report only with evidence: `file:line` + short why.
4. If unsure, say **insufficient evidence** — do not invent CWE.

## Output format
- `SEVERITY` | `file:line` | summary | (optional CWE)
