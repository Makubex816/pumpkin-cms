# Contact Preview Behavior

The contact preview route uses the shared draft preview client with:

- `pageSlug="contact"`
- `previewScope="Ice contact draft only"`
- `publicPath="/contact"`
- `storageKey="pumpkin_ice_contact_preview_jwt"`
- tenant `ice-rink-rentals`

Behavior:

- The preview page renders a local draft preview banner.
- The browser user must paste a local admin JWT into the preview form before the draft page is fetched.
- The draft fetch targets the admin API page endpoint for tenant `ice-rink-rentals` and slug `contact`.
- The preview uses `PageRenderer`, matching the public page renderer path.
- The preview route is noindex/nofollow and is disabled in static render mode.

Public `/contact` remains the public route and is not changed by this task.
