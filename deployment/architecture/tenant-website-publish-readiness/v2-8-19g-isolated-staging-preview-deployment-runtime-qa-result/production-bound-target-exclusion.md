# Production-Bound Target Exclusion

Result: pass.

Production-bound target:

- `swa-ice-static-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `happy-mud-0b375e20f.7.azurestaticapps.net`

Attached custom domains:

- `iceskatingrinkrentals.com` - Ready
- `www.iceskatingrinkrentals.com` - Ready

Exclusion evidence:

- No deployment command targeted `swa-ice-static-staging`.
- No route checks were sent to `iceskatingrinkrentals.com`.
- No route checks were sent to `www.iceskatingrinkrentals.com`.
- No DNS or custom-domain mutation command was run.

Conclusion:

The production-bound target remained excluded and blocked throughout V2.8.19G.
