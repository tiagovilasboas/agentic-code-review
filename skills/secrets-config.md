# Skill — Secrets & config

## Purpose
Catch hardcoded secrets and dangerous config defaults in a PR diff.

## Instructions
1. Look for API keys, tokens, private URLs with credentials, `password =`.
2. Flag debug flags / open CORS only if introduced or worsened in the diff.
3. Every finding: `file:line` + what leaked.
4. No finding → say so explicitly.
