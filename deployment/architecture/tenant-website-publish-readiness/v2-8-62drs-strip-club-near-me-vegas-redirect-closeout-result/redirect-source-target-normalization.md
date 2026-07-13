# Redirect Source And Target Normalization

Normalization decoded URL paths, normalized slash and terminal `index.html` forms, applied lowercase route policy, sorted query parameters, preserved fragments, and retained host/scheme distinctions.

| Source | Target | Paths equal | Query equal | Fragment equal | Target exists |
| --- | --- | --- | --- | --- | --- |
| `/24-hour-late-night-strip-clubs-las-vegas` | `/guides/24-hour-late-night-strip-clubs-las-vegas` | false | true | true | true |
| `/guides/couples-night` | `/guides/couples-guide-vegas` | false | true | true | true |
| `/guides/dress-code-what-to-expect` | `/guides/dress-code` | false | true | true | true |

All three source and target paths are different after normalization. There are no query, fragment, case, locale, extension, trailing-slash, scheme, or host tricks that collapse either blocked declaration into the same route.
