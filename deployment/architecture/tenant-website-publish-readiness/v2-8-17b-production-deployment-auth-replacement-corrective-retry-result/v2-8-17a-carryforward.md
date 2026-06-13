# V2.8.17A Carryforward

V2.8.17A classified the previous failure as `blocked_token_target_ambiguous`.

Carryforward facts:

- Production target: `swa-ice-static-staging`.
- Resource group: `rg-ice-static-staging`.
- Production domains: `iceskatingrinkrentals.com`, `www.iceskatingrinkrentals.com`.
- Domain status in V2.8.17A: `Ready`.
- V2.8.17A did not send a corrective deployment retry.
- V2.8.17A stopped because a corrected non-deploying dry-run rejected the token as invalid.

V2.8.17B replaced the ambiguous-token blocker with an operator-confirmed replacement token, then consumed the one approved corrective deployment attempt.

