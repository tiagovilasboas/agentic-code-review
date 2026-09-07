# Skill — AuthZ / IDOR smoke

## Purpose
Find missing authorization on object access (IDOR-style) in a PR diff: user-controlled identifiers used without a caller-ownership or role check.

## Risk class
- **OWASP Web:** [A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/) (includes IDOR / BOLA-style object access)
- **OWASP API:** [API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- **OWASP LLM / GenAI (agent posture):** overreliance — do not invent ownership checks that are outside the diff; escalate to human when the sink is not visible

## Instructions for the agent
1. Scope is the **provided PR diff only**. Do not invent handlers, middleware, or policies that are not in the diff.
2. Scan added/changed lines for user-controlled identifiers: path/query params, body fields named `id` / `uuid` / `slug` / `*Id`, or similar.
3. For each such identifier that reaches a data fetch, update, or delete: look in the same diff hunk (or adjacent changed lines) for an authorization check (ownership, tenant, role, ACL).
4. If the identifier is used and **no** authorization check appears in the diff → report a finding with `file:line` of the sink (or of the identifier use if the sink is the same line).
5. If the check might live outside the diff → **insufficient evidence**. Do not invent CWE numbers or claim a confirmed vulnerability.
6. Never write exploit PoCs, curl payloads, or attack procedures. Location + why is enough.
7. Do not merge, patch, or change the PR.

## Output format
```text
SEVERITY | file:line | summary | (optional CWE only if obvious from the pattern)
```

Example shape (not a real finding):

```text
HIGH | src/api/orders.ts:42 | orderId from path used in findById without ownership check
```

When unsure:

```text
insufficient evidence — ownership middleware not visible in the provided diff
```

Severity: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` (GitHub security labels). Prefer `HIGH` for missing object-level checks on read/write of user data; use `LOW` or insufficient evidence when the impact is unclear.
