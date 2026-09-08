# Skill — AuthZ / IDOR smoke

## Purpose
Find missing authorization on object access (IDOR-style) in a PR diff: user-controlled identifiers used without a caller-ownership or role check.

## Risk class
- **OWASP Web:** [A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/) (includes IDOR / BOLA-style object access)
- **OWASP API:** [API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- **OWASP LLM / GenAI (agent posture):** overreliance — do not invent ownership checks that are outside the diff; escalate to human when the sink is not visible

## Hunt table

| Signal in the diff | What you are looking for | Evidence to cite |
|---|---|---|
| Path/query/body `id` / `uuid` / `slug` / `*Id` | Caller-controlled identifier | identifier `path:line` |
| `findById` / `getById` / `findOne({ id })` / SQL `WHERE id =` | Object load from that identifier | sink `path:line` |
| `UPDATE` / `DELETE` / `PATCH` / `save` by request id | Write to an object the caller named | write `path:line` |
| New `/:id` (or `/:uuid`) route | Registration is not the finding; the handler is | handler sink `path:line` |
| Fetch then `res.json(object)` with no `req.user` / tenant / role bind | Returned without ownership/ACL in the hunk | sink `path:line` |

Do not hunt “IDOR” as a vibe. Hunt the row.

## Required evidence
Every finding: **`path:line`** of the sink (fetch/update/delete). Prefer a second `path:line` for the identifier.

If you only have the identifier and the check might live in unseen middleware → **insufficient evidence**. Do not invent CWE-639.

Guardrail: [`guardrails/evidence-required.md`](../guardrails/evidence-required.md).

## Instructions for the agent
1. Scope is the **provided PR diff only**. Do not invent handlers, middleware, or policies that are not in the diff.
2. Scan added/changed lines against the hunt table.
3. For each identifier that reaches a data fetch, update, or delete: look in the same diff hunk (or adjacent changed lines) for an authorization check (ownership, tenant, role, ACL).
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

Worked fixture: [`examples/sample-pr.diff`](../examples/sample-pr.diff) → [`examples/sample-report.md`](../examples/sample-report.md) (pass 1). Index: [`examples/README.md`](../examples/README.md).
