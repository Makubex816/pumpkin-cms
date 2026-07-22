
# Schema-first block contract qualification

Disposition: `QUALIFIED`

Commands:

| Command | Result | Exit | Duration ms | Log |
|---|---:|---:|---:|---|
| run1 schema generator check | pass | 0 | 61 | `program-management/upstream-intake/UP-30-A01/logs/07_run1_schema_generator_check.log` |
| run1 schema contract tests | pass | 0 | 63 | `program-management/upstream-intake/UP-30-A01/logs/08_run1_schema_contract_tests.log` |
| run2 schema generator check | pass | 0 | 57 | `program-management/upstream-intake/UP-30-A01/logs/23_run2_schema_generator_check.log` |
| run2 schema contract tests | pass | 0 | 55 | `program-management/upstream-intake/UP-30-A01/logs/24_run2_schema_contract_tests.log` |

Schema and contract-related source paths:

- `apps/pumpkin-api.Tests/Fixtures/block-contracts.generated.json`
- `schemas/blocks/README.md`
- `schemas/blocks/block-base.schema.json`
- `schemas/blocks/blog.schema.json`
- `schemas/blocks/breadcrumbs.schema.json`
- `schemas/blocks/card-grid.schema.json`
- `schemas/blocks/contact.schema.json`
- `schemas/blocks/faq.schema.json`
- `schemas/blocks/form.schema.json`
- `schemas/blocks/gallery.schema.json`
- `schemas/blocks/hero.schema.json`
- `schemas/blocks/how-it-works.schema.json`
- `schemas/blocks/html-block.schema.json`
- `schemas/blocks/hub-spokes.schema.json`
- `schemas/blocks/local-pro-tips.schema.json`
- `schemas/blocks/primary-cta.schema.json`
- `schemas/blocks/secondary-cta.schema.json`
- `schemas/blocks/service-area-map.schema.json`
- `schemas/blocks/shared.schema.json`
- `schemas/blocks/testimonials.schema.json`
- `schemas/blocks/trust-bar.schema.json`
- `scripts/generate-block-contracts.mjs`
- `scripts/test-block-contracts.mjs`
