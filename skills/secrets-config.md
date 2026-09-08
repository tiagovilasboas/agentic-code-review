# Skill — Secrets & config

## Purpose
Catch hardcoded secrets and dangerous config defaults introduced or worsened in a PR diff.

## Risk class
- **OWASP Web:** [A02:2021 Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/) (secrets in source / credentials exposure) and [A05:2021 Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/) (debug flags, open CORS, insecure defaults)
- **OWASP LLM / GenAI (agent posture):** sensitive information disclosure — report location only; never echo full secret values in the report body; never rotate or delete secrets

## Instructions for the agent
1. Scope is the **provided PR diff only**.
2. Look for newly added or changed literals that look like credentials: API keys, tokens, private URLs with embedded userinfo, `password =`, `secret =`, PEM blocks, cloud access keys.
3. Flag debug flags, `CORS` allow-all (`*`), disabled TLS verification, or default admin credentials **only if** introduced or made worse in this diff.
4. Every finding: `file:line` + what class of secret/config leaked (e.g. "hardcoded API token", "CORS origin *"). Redact the secret value in the summary (show at most a short prefix or length).
5. If a string might be a placeholder/test fixture with no production path in the diff → **insufficient evidence** or `LOW` with that caveat — do not invent CVEs.
6. No finding → say so explicitly (`no evidence-based findings`).
7. Never write exploit PoCs. Never instruct the agent to rotate, commit `.env`, or push secrets. Human rotates credentials outside this kit.

## Output format
```text
SEVERITY | file:line | summary | (optional CWE only if obvious)
```

Example shape (not a real finding):

```text
CRITICAL | config/app.ts:18 | hardcoded payment API token in source
MEDIUM | src/server.ts:9 | CORS origin set to * in production bootstrap path
```

When nothing qualifies:

```text
no evidence-based findings
```

Severity: `CRITICAL` for live-looking credentials in source; `HIGH`/`MEDIUM` for misconfiguration that widens exposure; `LOW` when the context is unclear.

Worked fixture: [`examples/sample-pr.diff`](../examples/sample-pr.diff) → [`examples/sample-report.md`](../examples/sample-report.md) (pass 2). Index: [`examples/README.md`](../examples/README.md).
