# Risk And Open Decisions

## Risks

- A future gate could incorrectly treat `200 ok:true` as proof of Admin persistence. V2.8.29 shows this is not valid for dry-run/no-email or graph-only modes.
- If production is graph-only, leads may reach email but remain absent from Admin by design.
- If production is dry-run/no-email, leads are accepted by the API but not delivered anywhere persistent.
- If production is intended to be Pumpkin API forwarding, missing or mismatched protected binding would block Admin visibility.
- If Admin reads a different Pumpkin API/backend than production static contact writes to, the submission can be persisted somewhere else and still not appear in the checked Admin view.

## Open Decisions

- Should Admin `FormEntry` persistence be the required source of truth for production leads?
- Should email notification be enough to close backend delivery, or must Admin also show every accepted submission?
- Should the compat endpoint implement dual delivery?
- Should future verification require one approved production POST only after binding is confirmed?
- Which team/operator owns protected config binding and inbox/provider confirmation?

