# Repository Topology and Immutability

## Current topology

```text
SDI-AI/pumpkin-cms
└── main                         moving upstream shared core
    current candidate: 18b5cea01d23298b95b5945999e66a4aec8d748b

Makubex816/pumpkin-cms
└── main                         public historical lineage
    observed: 64156a3015943f08bc89cadb2caae910d5cadf4f

Active downstream source
└── repository/branch unknown until current build closeout and local/private inventory
```

## Intended topology after inventory

```text
upstream/main
→ immutable/upstream/2026-07-15-18b5cea01d23
→ upstream-qualified/2026-07-15-18b5cea01d23
→ integration/upstream-18b5cea01d23
→ active product branch
→ release/<version>
```

Do not assume the public downstream `main` should become a mirror or product branch. Its role is decided only after the active product source is identified.

## Immutable snapshot requirements

- full 40-character commit SHA;
- commit tree and parent SHAs;
- protected branch and annotated/signed tag where permissions allow;
- repository rules preventing update, deletion, and force push;
- source archive and Git bundle;
- SHA-256 for archive, bundle, manifest, and qualification result;
- explicit distinction between `source_snapshot` and `qualified_baseline`;
- no secrets or private control-plane source in public artifacts.

The moving `main` is never the immutable object. The exact commit is.
