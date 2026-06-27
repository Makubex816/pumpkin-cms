# Rollback Plan

## API host deployment rollback

Because the new API host is not public-contact-bound at first, initial rollback is low blast radius:

1. Stop before Admin/static contact binding if API health or provider checks fail.
2. Keep production `/api/static-contact` unchanged.
3. If the first API package fails, redeploy the prior known-good API package if one exists.
4. If no prior package exists, disable the new Web App or remove its public binding from downstream configs under separate approval.
5. Record the failed artifact hash and deployment id.

## Admin binding rollback

If Admin cannot read form entries after binding:

1. Restore previous `NEXT_PUBLIC_API_URL` value or remove the binding from the deployed Admin environment under approved config rollback.
2. Do not proceed to static contact binding.
3. Keep public contact in the previous non-persistence mode.

## Isolated static contact rollback

If isolated contact binding fails:

1. Revert isolated static contact settings to prior mode.
2. Remove or correct the isolated `PUMPKIN_API_URL` binding.
3. Do not promote to production.
4. Record whether any test `FormEntry` was created.

## Production static contact rollback

If production binding later fails:

1. Revert production static contact `FORM_DELIVERY_MODE` to the previous value.
2. Revert production `PUMPKIN_API_URL` and key selector bindings.
3. Keep DNS/custom domains unchanged.
4. Confirm production contact endpoint returns the prior accepted/non-persistence mode only if a separate validation approval exists.

## Do not use as rollback

- Do not mutate DNS/custom domains for this fix.
- Do not delete production Cosmos resources.
- Do not rotate tenant API keys unless a separate key-rotation approval exists.
- Do not send broad retry POSTs.
