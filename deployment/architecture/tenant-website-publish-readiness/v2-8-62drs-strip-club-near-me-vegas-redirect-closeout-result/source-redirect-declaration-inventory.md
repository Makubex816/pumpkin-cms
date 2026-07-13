# Source Redirect Declaration Inventory

All three declarations were read from the committed 62CR route map and checked against the static source HTML without executing package code.

| # | Source file | Normalized source | Normalized target | Semantic disposition |
| ---: | --- | --- | --- | --- |
| 1 | `24-hour-late-night-strip-clubs-las-vegas/index.html` | `/24-hour-late-night-strip-clubs-las-vegas` | `/guides/24-hour-late-night-strip-clubs-las-vegas` | `persisted_redirect` |
| 2 | `guides/couples-night/index.html` | `/guides/couples-night` | `/guides/couples-guide-vegas` | `blocked_meaningful_redirect` |
| 3 | `guides/dress-code-what-to-expect/index.html` | `/guides/dress-code-what-to-expect` | `/guides/dress-code` | `blocked_meaningful_redirect` |

Raw targets:

- `24-hour-late-night-strip-clubs-las-vegas/index.html`: `../guides/24-hour-late-night-strip-clubs-las-vegas/index.html`
- `guides/couples-night/index.html`: `../couples-guide-vegas/index.html`
- `guides/dress-code-what-to-expect/index.html`: `../dress-code/index.html`

Each source HTML file contains a zero-delay meta refresh, a distinct canonical target, moved-page copy, and a direct link to the target. Source JavaScript was not executed and no script-location dependency was found.
