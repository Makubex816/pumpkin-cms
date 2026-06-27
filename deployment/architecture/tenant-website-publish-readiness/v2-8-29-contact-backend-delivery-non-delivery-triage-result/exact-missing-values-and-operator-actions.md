# Exact Missing Values And Operator Actions

V2.8.29 did not read protected config. The following are the exact missing facts needed before real remediation.

## Non-Secret Operator Decisions

- Choose expected backend delivery model: Admin persistence, email notification only, or dual delivery.
- Confirm which Admin environment was checked: production Admin, staging Admin, or local Admin.
- Confirm whether Admin should read the same production Pumpkin API backend used by the public static contact endpoint.
- Confirm whether the V2.8.26 result should be treated as dry-run/no-email accepted, Graph notification accepted, or unknown accepted until config is inspected by an approved operator.

## Protected Or Operator-Only Binding Facts

Do not paste secret values into docs or chat. Operators may provide public-safe yes/no/present/missing statements.

- Current static function delivery mode: `FORM_DELIVERY_MODE` or legacy `STATIC_FORM_FORWARD_MODE`.
- If Admin persistence is expected:
  - `PUMPKIN_API_URL` configured for the static function.
  - `ICE_RINK_RENTALS_API_KEY` configured for the static function.
  - Production Pumpkin API has the Ice tenant/API key and `FormEntry` store available.
  - Admin points to the same Pumpkin API backend/provider.
- If email-only delivery is expected:
  - Graph delivery mode active.
  - Graph tenant/client/sender/recipient settings present.
  - Operator-only inbox/provider confirmation path available.

## Operator Actions Before V2.8.30 Implementation

1. Select the delivery model.
2. Provide public-safe current-mode and binding status, without secret values.
3. Approve either a no-deploy implementation plan or a separately gated config/deploy/POST phase.

