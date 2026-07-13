# Self-Route No-Op Proof

Result: `failed_for_both_candidates`.

The earlier phrase "self-route" described a redirect stored on the page whose current slug equals the redirect source. It did not mean `source == target`.

| Requirement | Couples candidate | Dress-code candidate |
| --- | --- | --- |
| Normalized source equals target | fail | fail |
| No meaningful query/fragment difference | pass | pass |
| No host/scheme transition | pass | pass |
| Target page exists exactly once | pass | pass |
| Zero-delay refresh targets a distinct route | yes, meaningful | yes, meaningful |
| Canonical tag targets a distinct route | yes, meaningful | yes, meaningful |
| Moved-page link targets a distinct route | yes, meaningful | yes, meaningful |
| No distinct browser-visible behavior | fail | fail |
| No SEO/canonical behavior is lost | fail | fail |

Neither record qualifies for `canonical_noop`. The conditional owner deviation was not activated.
