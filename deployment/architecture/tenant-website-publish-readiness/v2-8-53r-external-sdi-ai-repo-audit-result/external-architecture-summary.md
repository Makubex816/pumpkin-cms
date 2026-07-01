# External Architecture Summary

The external SDI-AI repo is an API-first Pumpkin CMS monorepo:

- .NET API in `apps/pumpkin-api`.
- Shared .NET models in `apps/pumpkin-net-models`.
- TypeScript models in `packages/pumpkin-ts-models`.
- React block views in `packages/pumpkin-block-views`.
- Next.js admin UI in `apps/admin`.
- Next.js public sample app in `apps/sample-app`.

Runtime/source facts:

- `global.json` requests SDK `10.0.100`.
- API project targets `net10.0`.
- Admin app uses Next 14 and React 18.
- TypeScript model package is `pumpkin-ts-models` version `1.0.0`.

Documentation note:

README prose still says .NET 9.0, but source files prove .NET 10 is the actual build target.
