# Skill — Supply chain (PR smoke)

## Purpose
Catch install-time and lockfile surprises in a PR: new registries, install scripts, unpinned Actions, `curl | sh`. You are not running SCA. You are reading the diff.

## Hunt table

| Signal in the diff | What you are looking for | Evidence to cite |
|---|---|---|
| `package.json` / `requirements.txt` / `go.mod` / `Gemfile` / `Cargo.toml` | New dep, version pin removed, range widened to `*` / `latest` | manifest `path:line` |
| `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` / `poetry.lock` | `resolved` host ≠ expected registry; integrity hash dropped; lockfile rewritten “for no app reason” | lockfile `path:line` |
| `.npmrc` / `.yarnrc*` / pip `index-url` / `PIP_EXTRA_INDEX_URL` | Registry or extra-index pointed at a new host | config `path:line` |
| `postinstall` / `preinstall` / `install` scripts in `package.json` | Arbitrary shell at `npm ci` | script `path:line` |
| CI: `npm install` instead of `npm ci` (or yarn/pnpm without frozen lockfile) | Lockfile can be rewritten on CI | workflow `path:line` |
| GitHub Action `uses: org/action@v1` (moving tag) vs `@<sha>` | Third-party CI code you did not pin | workflow `path:line` |
| `curl … \| sh` / `wget … \| bash` in Dockerfile or setup | Unsigned remote installer | Dockerfile/`*.sh` `path:line` |
| New `vendor/`, git submodule URL, or `http://` tarball | Code you did not review, fetched over cleartext | fetch site `path:line` |

A lockfile that only bumps a known package to a specific version, with `resolved` on the usual registry and an integrity hash, is usually **not** a finding. Say that.

## Required evidence
Every finding: **`path:line`** of the manifest, lockfile field, workflow step, or installer line.

Do not paste a CVE from memory. If the diff does not show the package/version, you do not have a vuln — you have a hygiene note, or insufficient evidence.

Guardrail: [`guardrails/evidence-required.md`](../guardrails/evidence-required.md).

## Pass / fail
- **FAIL** — new/changed install script; registry/index host changed; lockfile `resolved` to an unexpected host or missing integrity; CI install that rewrites the lockfile; Action pinned to a floating tag *and* it runs on `pull_request` from forks or has secrets; `curl | sh`.
- **PASS** — deps change, lockfile stays on the expected registry with integrity, CI uses `npm ci` / frozen lockfile, Actions pinned to commit SHA (or first-party `actions/*` you are willing to trust at a tag — say which).
- **INSUFFICIENT** — “this package had a CVE last year” with no version in the diff. Do not invent CWE-1104.

This skill does **not** prove the new version is safe. It proves the *install path* in the PR is honest.

## Fix direction
1. Pin what you install. Commit the lockfile. CI: `npm ci` / `--frozen-lockfile`, not a bare `install` that rewrites it. See [npm ci](https://docs.npmjs.com/cli/v10/commands/npm-ci).
2. Keep `resolved` on the registry you meant (npmjs, your mirror). Treat extra-index / surprise `.npmrc` as a review event.
3. Drop `postinstall` unless you can explain the script at `path:line`.
4. Pin GitHub Actions to a commit SHA. Tags move. [GitHub: security hardening for Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#using-third-party-actions).
5. No pipe-to-shell. Vendor or use a signed package.

## Out of scope
- Full SBOM, SCA, or “are we on a vulnerable lodash”. That is a scanner job; this is a PR skill.
- Claiming a named incident (xz, event-stream, etc.) happened *here*.
- Provenance/SLSA attestations unless the workflow in the diff actually verifies them — then cite the step.
- Malware analysis of a tarball.

## Output format
- `SEVERITY` | `file:line` | summary | (optional CWE)
- Name the host/script/action. Do not dump the whole lockfile.

## Refs (public)
- [OWASP Top 10:2021 A06 Vulnerable and Outdated Components](https://owasp.org/Top10/2021/A06_2021-Vulnerable_and_Outdated_Components/)
- [OWASP Top 10:2021 A08 Software and Data Integrity Failures](https://owasp.org/Top10/2021/A08_2021-Software_and_Data_Integrity_Failures/)
- [CWE-1104](https://cwe.mitre.org/data/definitions/1104.html)
