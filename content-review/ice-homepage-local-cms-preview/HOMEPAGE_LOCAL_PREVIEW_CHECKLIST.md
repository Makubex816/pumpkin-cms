# Homepage Local Preview Checklist

Use this after a future approved local draft import or dedicated file-preview flow.

## Current Local Route

- URL: `http://localhost:3002/`
- Current status: responds with existing local/CMS/fallback homepage.
- New candidate status: not visible yet.

## Visual Review Items

- Confirm hero content, CTA, and quote form are visible.
- Confirm homepage route remains `/`.
- Confirm canonical remains `https://iceskatingrinkrentals.com/`.
- Confirm no fake image URLs, base64 images, or external placeholder images render.
- Confirm unresolved media slots are visually obvious enough for review or have approved local MediaAsset replacements.
- Confirm form block renders as Pumpkin `formBlock`, not raw Contact Form 7 HTML.
- Confirm no public email address appears until public display policy is approved.
- Confirm no unapproved phone/legal/business values appear.
- Confirm service-area copy remains generic or approved.
- Confirm mobile and desktop layout do not have obvious overlap or unreadable text.

## Form Behavior

Do not submit a real lead during visual preview unless a separate dry-run form test is explicitly requested.

Pumpkin app email sending remains dry-run/not configured.

