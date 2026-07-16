# Upstream recheck

Read-only upstream source:

- Repository: `https://github.com/SDI-AI/pumpkin-cms`
- Branch: `main`
- Current head: `817e176cd6af7759c58923c713c5b8ac7cf79996`
- Tree SHA: `b4fed8406bd8ac8ab05ce8614d3cf3ba03cd1bbe`
- Parents:
  - `0c6e31a7184cd65d17cda66af9dc080293bd25f7`
  - `f7f83ef6614974fa9bf99b81755afb2bad959194`
- Commit date: `2026-07-16T15:17:48Z`
- Message: `Merge branch 'main' of https://github.com/sdi-ai/pumpkin-cms`
- GitHub URL: `https://github.com/SDI-AI/pumpkin-cms/commit/817e176cd6af7759c58923c713c5b8ac7cf79996`

`git ls-remote` matched the GitHub API head during CUR-20.

## Comparison with Atlas v3 candidate

Atlas v3 candidate: `18b5cea01d23298b95b5945999e66a4aec8d748b`

Current head is ahead by 4 commits, behind by 0:

- `dcd12c1` — `2026-07-16T14:16:30Z` — Add starter admin content and theme management
- `f7f83ef` — `2026-07-16T15:15:28Z` — Merge pull request #7 from SDI-AI/feature/starter-visual-page-editor
- `0c6e31a` — `2026-07-16T15:17:05Z` — API version update
- `817e176` — `2026-07-16T15:17:48Z` — Merge branch `main` of upstream

Changed files from `18b5cea` to current head:

- 32 files changed
- 8 added
- 24 modified
- 1,439 additions
- 41 deletions
- Prefixes: 25 under `apps/`, 7 under `packages/`

Primary affected areas: API theme publishing/version update, starter admin form entries, starter admin theme CSS management, navigation/page editor components, starter form/theme APIs, and shared Theme model outputs.

## Comparison with previous observed head

Previous observed head: `785e079269276c177832f9e7186ae44675e76f52`

Current head is ahead by 9 commits, behind by 0:

- `4157356` — Block Updates
- `a5e8eb8` — Add starter visual page and navigation editor
- `8e2bc1e` — Add tenant CAPTCHA and header logo media support
- `d84cef2` — Update `.gitignore`
- `18b5cea` — Merge pull request #6 from `feature/starter-visual-page-editor`
- `dcd12c1` — Add starter admin content and theme management
- `f7f83ef` — Merge pull request #7 from `feature/starter-visual-page-editor`
- `0c6e31a` — API version update
- `817e176` — Merge branch `main` of upstream

Changed files from `785e079` to current head:

- 63 files changed
- 15 added
- 48 modified
- 3,200 additions
- 77 deletions
- Prefixes: `.gitignore` 1, `apps/` 42, `packages/` 20

## Status checks

Combined commit status API returned `pending`; status contexts were empty. Check-runs API returned total count `0`.

## Decision

The previously observed candidate is no longer current. CUR-20 does not freeze, qualify, branch, tag, merge, or push upstream. UP-20 must preserve both prior observations and use `817e176cd6af7759c58923c713c5b8ac7cf79996` as the latest recheck candidate unless upstream moves again at UP-20 execution time.

Authorize.Net remains blocked until actual source is visible and inspected.

