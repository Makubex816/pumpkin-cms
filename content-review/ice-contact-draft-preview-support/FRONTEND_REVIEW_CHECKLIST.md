# Frontend Review Checklist

Preview URLs:

- `http://localhost:3002/__preview/ice-rink-rentals/contact`
- `http://localhost:3002/draft-preview/ice-rink-rentals/contact`

Public URL:

- `http://localhost:3002/contact`

Probe results from this run:

| Route | Status | Result |
| --- | --- | --- |
| `/__preview/ice-rink-rentals/contact` | 200 | Preview shell served |
| `/draft-preview/ice-rink-rentals/contact` | 200 | Preview shell served |
| `/contact` | 200 | Public route served |

Manual browser review:

- Paste a local admin JWT into the preview route.
- Confirm the draft preview loads the final `/contact` draft.
- Confirm hero/content render.
- Confirm the quote form area renders as the Pumpkin `formBlock`.
- Confirm public `/contact` still shows the current public/live route until live CMS promotion.
