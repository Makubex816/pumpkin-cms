# Frontend Preview Checklist

Route checks performed:

| URL | Status | Raw HTML contains PPEC | Note |
| --- | ---: | --- | --- |
| http://localhost:3002/__preview/ice-rink-rentals/home | 200 | no | Raw HTML is the client-side JWT-gated draft preview shell. |
| http://localhost:3002/contact | 200 | no | Public contact route raw HTML, not authenticated draft readback. |
| http://localhost:5064/ | 200 | no | API root reachability only. |

Interpretation:

- The homepage `__preview` route responds, but raw terminal HTML is not authenticated draft content. It is the client-side preview shell.
- Public `/contact` responds, but it is not proof of draft contact content.
- The renderer supports `PrimaryCTA` and should render the PPEC block when the draft page JSON is loaded with admin JWT in the browser session.

Manual browser check after import:

1. Add a fresh admin JWT to the preview UI when prompted.
2. Open `http://localhost:3002/__preview/ice-rink-rentals/home`.
3. Confirm the `Planning more than the rink?` partner CTA appears.
4. After contact draft import support/readback is available, confirm `Need more than an ice rink?` and the PPEC FAQ appear in draft contact data.
