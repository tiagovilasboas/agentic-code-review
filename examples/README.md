# Examples — dry-run fixtures

Synthetic PR diffs and the report shape this kit expects. AppSec evidence (`path:line`) first. Not production incidents. No exploit PoCs.

| Stage | Skill(s) | Diff | Expected report |
|---|---|---|---|
| 1 | [`authz-idor`](../skills/authz-idor.md), [`secrets-config`](../skills/secrets-config.md) | [`sample-pr.diff`](sample-pr.diff) | [`sample-report.md`](sample-report.md) |
| 2 | [`xss-html`](../skills/xss-html.md) | [`xss-sink.sample.diff`](xss-sink.sample.diff) | [`xss-sink.sample-report.md`](xss-sink.sample-report.md) |
| 3 | [`supply-chain`](../skills/supply-chain.md) | [`supply-chain.sample.diff`](supply-chain.sample.diff) | [`supply-chain.sample-report.md`](supply-chain.sample-report.md) |

Load **one** skill, apply it to the matching diff, compare `SEVERITY | file:line | why` to the report. Enforce [`guardrails/evidence-required.md`](../guardrails/evidence-required.md).

`ssrf-egress` has no fixture here. Run it on a real PR diff that fetches a URL — do not invent a sink.

Human decides merge vs request-changes after the report. The agent does not merge.
