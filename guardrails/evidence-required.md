# Guardrail — Evidence required

## Rule (fail closed)
No security finding without **`path:line`** (and a one-line justification).

## Rationale
Agents hallucinate CWEs. Staff review needs actionable evidence.

## Enforcement
If a finding lacks path:line → drop it or mark `insufficient evidence`.
