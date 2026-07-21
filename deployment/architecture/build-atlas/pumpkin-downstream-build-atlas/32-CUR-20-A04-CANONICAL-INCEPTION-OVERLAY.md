# CUR-20-A04 canonical inception overlay

A04 resolves the authority gap left by CUR-20/A01-A03. The owner authorized a prospective comprehensive Build Atlas, and this package is that Atlas.

## Key decisions

- Canonical path: `deployment/architecture/build-atlas/pumpkin-downstream-build-atlas/`
- Version: `4.0.0`
- Authority start: the first Git commit adding this path with message `docs: establish canonical Pumpkin comprehensive build atlas`
- Prior v3 bridge: promoted as source material only after A04 overlay corrections
- Prior V2.8.61K resource Atlas: retained as historical resource/protection baseline
- CRSTUR: retained as current identity/capacity/customer-preservation carryforward
- Source ZIPs: original ZIP files not present in current workspace; A01 committed hash/CRC evidence is preserved and extracted input trees are present

## Fresh A04 observations

- Azure control-plane readback succeeded for 14 protected named resources.
- Production App Service plan is Standard `S2` with capacity `2`.
- API, Admin, and isolated Admin apps are `Running` in control-plane metadata.
- API health GET returned 200 and dependency readiness GET `/health/ready` returned 200.
- Admin root GET returned 200.
- Isolated Admin root timed out once and returned 200 on immediate retry.
- Ice SWA default/apex/www GET probes returned 200.
- No Airstrip public runtime probe was made.
- Upstream `SDI-AI/pumpkin-cms` `main` moved to `fda4611f6ca5a6206e3e8d6254e3e41c3b50618e` (`Adopt Apache 2.0 license`) and remains unfrozen/not ingested.
