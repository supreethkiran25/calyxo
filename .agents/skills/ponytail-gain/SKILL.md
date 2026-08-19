---
name: ponytail-gain
description: >
  Show ponytail's measured impact as a compact scoreboard: less code, less
  cost, more speed, from the benchmark medians. One-shot display, not a
  persistent mode, and not a per-repo number. Trigger: /ponytail-gain,
  "ponytail gain", "what does ponytail save", "show ponytail impact",
  "ponytail scoreboard".
---

# Ponytail Gain

Display this scoreboard when invoked. One-shot: do NOT change mode, write flag files, or persist anything.

The figures are the published benchmark medians (5 everyday tasks: email validator, debounce, CSV sum, countdown timer, rate limiter; three models: Haiku, Sonnet, Opus). They are measured, not computed from the current repo.

## Scoreboard

```
  ponytail gain                     benchmark median · 5 tasks · 3 models

  Lines of code   no-skill ████████████████████ 100%
                  ponytail ████ 18%             (~82% reduction)

  Tokens used     no-skill ████████████████████ 100%
                  ponytail █████ 23%            (~77% reduction)

  Time spent      no-skill ████████████████████ 100%
                  ponytail ██████ 29%           (~71% faster)
```
