# Skill — XSS / HTML sinks

## Purpose
Find user-controlled strings reaching HTML or JS execution sinks in a PR diff. Stored, reflected, DOM — same job: source → sink, or drop it.

## Hunt table

| Signal in the diff | What you are looking for | Evidence to cite |
|---|---|---|
| `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write` | Assignment from request, URL, storage, markdown, CMS, or API field | sink `path:line` + source `path:line` |
| React `dangerouslySetInnerHTML` | `__html` not a compile-time constant; no sanitizer on the path | component `path:line` + where the string is built |
| Vue `v-html`, Angular `bypassSecurityTrust*`, Lit `unsafeHTML` | Framework escape hatch + untrusted input | template/binding `path:line` |
| Server templates: `{{! }}`, `{{{ }}}`, `|safe`, `|raw`, `{!! !!}`, `<%-` | Auto-escape turned off | template `path:line` |
| `eval` / `new Function` / `setTimeout(string)` / `href="javascript:"` | String executed as code or URL scheme | call `path:line` |
| Markdown / rich-text → HTML | Renderer with HTML enabled, or custom allow-list that keeps `script` / event attrs / `javascript:` | render call `path:line` |

Do not hunt “XSS” as a vibe. Hunt the row.

## Required evidence
Every finding: **`path:line`** for the sink. Prefer a second `path:line` for the source.

If you only have the sink and the source is not in the diff → **insufficient evidence**, not a CWE.

Guardrail: [`guardrails/evidence-required.md`](../guardrails/evidence-required.md).

## Pass / fail
- **FAIL** — untrusted string reaches an HTML/JS sink and the hunk does not encode or sanitize for that context.
- **PASS** — sink is present but the value is a constant, already encoded for the context, or passed through a real sanitizer (e.g. DOMPurify) *before* the sink. Cite that `path:line` too.
- **INSUFFICIENT** — sink or “user input” is guessed. Say so. Do not invent CWE-79.

Regex-strip of `<script>` is not a pass. Context-wrong encoding (HTML-encode into a JS string, or vice versa) is not a pass.

## Fix direction
1. Prefer a safe sink (`textContent`, framework default escaping, markdown with HTML off).
2. If you must render HTML: sanitize with a maintained library (OWASP points at DOMPurify), then sink. Do not hand-roll a tag denylist.
3. Encode for the actual context (HTML body ≠ attribute ≠ JS ≠ URL). Unquoted attributes are a footgun.
4. CSP is defense-in-depth, not the fix for this PR.

## Out of scope
- Full-app XSS audits, gadget chains, mutation XSS, browser quirks.
- “This looks like it could be XSS” without a sink line.
- Claiming stored vs reflected vs DOM unless the diff shows it.
- Inventing a production incident or a CVSS. This is a PR smoke skill.

## Output format
- `SEVERITY` | `file:line` | summary | (optional CWE)
- One line on source → sink, or `insufficient evidence`.

## Refs (public)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [CWE-79](https://cwe.mitre.org/data/definitions/79.html)

Worked fixture: [`examples/xss-sink.sample.diff`](../examples/xss-sink.sample.diff) → [`examples/xss-sink.sample-report.md`](../examples/xss-sink.sample-report.md).
