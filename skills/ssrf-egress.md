# Skill — SSRF / egress

## Purpose
Find the server fetching a URL or host the caller can influence — webhook, preview, import, proxy, “fetch this image”. Diff review, not a network pentest.

## Hunt table

| Signal in the diff | What you are looking for | Evidence to cite |
|---|---|---|
| `fetch` / `axios` / `got` / `http.get` / `request` / `curl` in server code | URL, hostname, or path from query/body/header/DB | client call `path:line` + where the URL is built |
| Webhook / callback / “notify URL” / RSS / oEmbed / link-preview | User-supplied destination, often HTTPS-looking | handler `path:line` |
| Import / avatar / PDF / screenshot / “unfurl” | Server-side GET of an attacker URL | fetch site `path:line` |
| `file://`, `gopher://`, `dict://`, `ftp://`, or scheme from input | Parser + scheme confusion | URL parse `path:line` |
| Redirects left on (`maxRedirects`, `followRedirect: true`) | Allowlist on the first hop, attacker on the second | client options `path:line` |
| Cloud metadata hosts (`169.254.169.254`, `metadata.google.internal`) reachable from the same client | Egress to IMDS — only if the code can be pointed there | destination `path:line` |
| Denylist of `localhost` / `127.0.0.1` / RFC1918 only | Bypass via DNS rebinding, IPv6, decimal IP, redirects | filter `path:line` |

SSRF is not HTTP-only. If the diff opens `file://` or a non-HTTP scheme from input, that is in scope.

## Required evidence
Every finding: **`path:line`** of the outbound call (or the URL constructor that feeds it).

If the URL is hardcoded to a trusted host and input is only a path on that host → say so; that is usually not FAIL unless the path can hit a dangerous internal route *and* you can cite it.

No `path:line` → drop it. Guardrail: [`guardrails/evidence-required.md`](../guardrails/evidence-required.md).

## Pass / fail
- **FAIL** — user-influenced URL/host reaches a server HTTP(S) or scheme-capable client; no positive allowlist of scheme + host (+ port). Denylist-only is FAIL.
- **PASS** — destination is an allowlist (or a fixed internal client), redirects disabled or also checked, and the hunk does not pass raw responses of the fetched URL back to the browser.
- **INSUFFICIENT** — “this client *could* be pointed at IMDS” without a controllable URL in the diff. Do not invent CWE-918.

You cannot see VPC egress from a PR. Do not claim “network layer is open” or “IMDS is exposed in prod”. You can only talk about the code path.

## Fix direction
1. Allowlist scheme + host (and port). Do not denylist `localhost` and call it done — [OWASP A10:2021](https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/) is explicit on this.
2. Disable HTTP redirects, or re-validate the next hop against the same allowlist.
3. Do not return the raw fetched body to the client.
4. After DNS resolve, reject loopback / link-local / private / metadata if the feature does not need them. Parser mismatches are real; prefer a library that does not do the “decimal IP” surprise.
5. Network egress deny-by-default is the real backstop — note it as ops follow-up, not as a finding you proved in the diff.

## Out of scope
- Writing exploit payloads, metadata token theft, or “hit this IMDS path”.
- Claiming blast radius in AWS/GCP/Azure without infra in the diff.
- XXE→SSRF unless the XML parser hunk is actually in the PR (then cite it; otherwise another skill).
- Full DNS-rebinding lab. If you cannot cite the fetch line, stop.

## Output format
- `SEVERITY` | `file:line` | summary | (optional CWE)
- One line: who controls the URL, whether redirects/allowlist are in the hunk.

## Refs (public)
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Top 10:2021 A10 SSRF](https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/)
- [CWE-918](https://cwe.mitre.org/data/definitions/918.html)
