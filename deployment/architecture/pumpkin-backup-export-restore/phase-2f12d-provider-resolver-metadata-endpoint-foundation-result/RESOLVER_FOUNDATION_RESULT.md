# Resolver Foundation Result

## Implemented Modules

- `ProviderSourceResolver` interface class.
- `FakeProviderSourceResolver` fixture implementation.
- `resolveProviderSourceFromFixture` helper.
- `writeFakeProviderSource` bundle writer.

## Implemented Fixtures

- configured Cosmos;
- Ice missing source with Cosmos selected as target;
- Ice future-target Cosmos;
- local provider;
- forbidden field.

## Behavior

- Configured Cosmos resolves as ready for a later read-only/export preflight, not live export.
- Ice missing source resolves as blocked and points to Cosmos provisioning preflight.
- Future-target Cosmos resolves as provisioning required.
- Local provider resolves as blocked for production restore proof.
- Forbidden fields fail validation.

## Boundary

The resolver reads fixtures only and does not read env values, protected config, CMS/API, Azure, databases, or blobs.
