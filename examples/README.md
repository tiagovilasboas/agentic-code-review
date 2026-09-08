# Examples — dry-run fixtures

Synthetic diffs and the report shape this kit expects. AppSec evidence (`path:line`). Not incidents. No exploit PoCs.

Load **one** skill per pass. Compare `SEVERITY | file:line | why` to the report. Guardrail: [`evidence-required`](../guardrails/evidence-required.md). Index is one row per skill.

| Fixture | Skill | What it exercises |
|---|---|---|
| [`sample-pr.diff`](sample-pr.diff) → [`sample-report.md`](sample-report.md) | [`authz-idor`](../skills/authz-idor.md) | `req.params.id` → `findById` with no ownership/tenant check in the hunk |
| same diff / report (second pass) | [`secrets-config`](../skills/secrets-config.md) | hardcoded payment token; CORS `origin: *` on bootstrap |
| [`xss-sink.sample.diff`](xss-sink.sample.diff) → [`xss-sink.sample-report.md`](xss-sink.sample-report.md) | [`xss-html`](../skills/xss-html.md) | React `dangerouslySetInnerHTML` on `comment.body`, no sanitizer |
| [`supply-chain.sample.diff`](supply-chain.sample.diff) → [`supply-chain.sample-report.md`](supply-chain.sample-report.md) | [`supply-chain`](../skills/supply-chain.md) | surprise registry / `postinstall` / floating Action; honest Express pin is **not** a finding |
| — | [`ssrf-egress`](../skills/ssrf-egress.md) | No fixture. Use a real PR that fetches a caller-influenced URL. Do not invent a sink. |
