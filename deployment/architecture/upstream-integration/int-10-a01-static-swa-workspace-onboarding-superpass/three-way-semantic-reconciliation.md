# Three-way semantic reconciliation

Anchors:

| Item | Value |
| --- | --- |
| Previous upstream | 18b5cea01d23298b95b5945999e66a4aec8d748b |
| Frozen upstream | fda4611f6ca5a6206e3e8d6254e3e41c3b50618e |
| Downstream product source | 87ba5cd0ec305d30b9345ea95475c1b7fcde1c62 |

The authoritative upstream delta is 137 paths. All paths are accounted for in `three-way-semantic-reconciliation.json`.

Disposition totals:

- ADAPT_OR_PORT: 114
- WRAP_AND_EXTEND: 23

Component totals:

- api-transport: 1
- block-editor-and-defaults: 4
- block-view-package: 4
- dotnet-tests: 5
- form-contract: 1
- generated-csharp-contracts: 21
- generated-typescript-contracts: 50
- licensing-and-docs: 4
- schema-first-block-contracts: 20
- schema-generator-and-tests: 2
- shared-pumpkin-api: 3
- starter-admin-editor: 8
- starter-admin-form-entry-api: 2
- starter-admin-theme-css-api: 2
- starter-public-renderer: 4
- starter-public-runtime-layout: 1
- theme-contract: 1
- theme-package: 4

Cross-tree inventory counts:

- previous-upstream-18b5cea-to-downstream-product-87ba5cd-name-status: changed 11212, added 10983, modified 157, deleted 72
- frozen-upstream-fda4611-to-downstream-product-87ba5cd-name-status: changed 11272, added 10998, modified 161, deleted 113

Primary interpretation:

- Schema-first block contracts, generated C# contracts, generated TypeScript contracts, block defaults, and fixtures are qualified upstream capabilities that require downstream adaptation or no-op proof under the downstream serialization contract.
- Starter admin/editor, theme CSS publishing, form-entry admin routes, and shared API touches must be wrapped/extended so the public tenant artifact remains static and the central Pumpkin API remains authoritative.
- Licensing and notices are preserved as evidence; owner/legal acceptance remains an explicit hold.
