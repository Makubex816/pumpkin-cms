# Starter Build and Redeploy Result

Source changes were limited to the Party Pros theme and starter rendering components for catalog cards, item details, blogs, and the quote cart.

Validation before deployment:

- `npm run type-check`: passed;
- `npm run build`: passed;
- existing `pumpkin-ts-models` browser-side `fs` warning: non-fatal and unchanged in nature;
- local exhaustive proof: 301/301 pages and 509/509 media URLs passed;
- local responsive proof: 35/35 passed.

Deployment package:

- shape: Next standalone output plus static assets, public assets, and the OSJ Party Pros fixture;
- bytes: `6398673`;
- SHA-256: `f18e5e949cc276d12705b5791eb2e1fc33b0df646ea5a3e2f2339ad584934056`;
- normalized entries: 2,212;
- backslash, unsafe, duplicate, protected-config, appsettings, and environment entries: 0.

Exactly one of one approved starter deployment attempts was used. Azure deployment `12558d4a-6bc5-4cb9-a7cc-ad33ff92955d` completed with `RuntimeSuccessful`, one successful instance, and zero failed instances.

No deployment ZIP or standalone output was staged. No API, Admin UI, Ice, or Airstrip deployment occurred.
