# Homepage Draft Preview Checklist

## Before Review

- Restart the Ice frontend on port 3002 so the new app route and next.config.js rewrite are active.
- Confirm http://localhost:3002/ still shows the published homepage.
- Open http://localhost:3002/__preview/ice-rink-rentals/home.
- Paste a valid local admin JWT into the preview page.
- Load the draft and verify the draft banner remains visible.

## During Review

- Confirm homepage draft content renders through PageRenderer.
- Confirm the preview banner is visible.
- Confirm media paths show a passing media check.
- Confirm images render from /media/ice-rink-rentals/... without external URLs or base64.
- Do not submit quote/contact forms from preview; preview forms are configured inert.

## After Review

- Clear the preview token from the page.
- Do not publish or import anything unless separately authorized.
- Keep public / published-only until homepage approval and cutover are explicitly authorized.
