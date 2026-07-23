# Frozen upstream attribution evidence

This directory preserves the root `LICENSE` and `NOTICE` text from
`https://github.com/SDI-AI/pumpkin-cms.git` at
`fda4611f6ca5a6206e3e8d6254e3e41c3b50618e`.

Git may normalize the checked-out text files to the platform line ending.
The materializer canonicalizes them to the frozen upstream CRLF byte form and
verifies the frozen source SHA-256 before packaging.

It is attribution and packaging evidence only. It does not declare or change
the license of the downstream PumpkinCMS repository.

The frozen upstream root license text identifies Apache License 2.0, while the
frozen and integrated `pumpkin-block-views` and `pumpkin-ts-models` package
manifests contain `MIT` license fields. Automated work must not resolve that
declaration conflict. External product, package, or tenant-artifact rollout
remains `HELD_PENDING_OWNER_LEGAL_REVIEW`.

`attribution-package.json` defines repository-relative source paths,
distributable relative paths, and expected SHA-256 values. Validate it with:

```text
node tools/release-attribution/materialize.mjs
```

After owner/legal review authorizes distribution, a packaging step can
materialize the exact files under an artifact staging root:

```text
node tools/release-attribution/materialize.mjs --out <artifact-staging-root>
```

Materialization does not clear or otherwise modify the staging root.
