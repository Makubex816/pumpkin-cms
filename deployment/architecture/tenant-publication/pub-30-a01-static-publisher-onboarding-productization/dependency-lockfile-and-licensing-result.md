# Dependency lockfile and licensing result

Focused dependency/attribution commit: `c176ec3fd49e6cae400d0d30626425087d6077b8`.

## npm

Final physical lock-file SHA-256 values are:

- root npm: `5b1c68bcf50de194dd15b551366299665fd548ddebebf87eca53b3a43d7140d7`;
- Admin npm: `ce1b202abdf9a8f400210c4c988b0857228c41926caa1a5c6ba26f042e32c5b3`;
- API NuGet: `cbdbfff78cfdd02a55536d5a569516aa616c41adf54bec1de18d71e764b22d3b`;
- API tests NuGet: `b669091c1ea5ef37d119800f4566f0934a739adbcb5f30d2b29d4b504dc05ac4`;
- .NET models NuGet: `a4364d81a6de2707d66fbced18fbbc926c882ab96e1d1aebbb17e871285b9d75`.

The exact audit snapshot reported:

- root: 5 findings, 1 moderate and 4 high;
- Admin: 14 findings, 4 moderate and 10 high.

Runtime impact includes the current Next.js line and Admin ExcelJS dependency; eslint-config findings are development-tooling impact. The offered Next.js remediation crosses to 16.2.11, and the offered ExcelJS remediation is a semver-major downgrade to 3.4.0. No automatic audit fix, override, downgrade, or unrelated upgrade was applied. These remain evidence-backed owner upgrade holds; the same counts and direct-remediation classifications were rechecked after the focused source commits.

## NuGet

The committed policy requires locked restore for both provider graphs and forbids using a missing lock as proof. The generated API Cosmos-only lock evidence was identical in both roots with SHA-256 `09ddef6f48541e3f2916773d34e38887d8af952756835c6e36af02d5537d8c88`. Locked restore, build, and test matrices passed in both roots using .NET SDK 10.0.204. The Mongo-enabled inventory contained 134 files and the Mongo driver; the 122-file Cosmos-only inventory contained no Mongo driver.

## Licensing

Frozen upstream attribution materializes exact LICENSE SHA-256 `1eb85fc97224598dad1852b5d6483bbcf0aa8608790dcc657a5a2a761ae9c8c6` and NOTICE SHA-256 `65c58dd61ab8360b28cfbe33c859c694bc8502c22d8d8b686dc44aeccc926c9b`.

The upstream root declares Apache-2.0 while integrated package manifests declare MIT. Automation does not resolve that conflict or provide legal advice. Product and customer artifact distribution remains `HELD_OWNER_LEGAL_REVIEW`.
