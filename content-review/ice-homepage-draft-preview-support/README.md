# Ice Homepage Draft Preview Support

This package documents the local-only draft preview route and media proxy added for IceSkatingRinkRentals.com.

- Public / remains published-only.
- Draft preview is separate from public routing.
- No CMS Page, Theme, or MediaAsset records were changed.
- No contact or service-area page content was changed.
- No static packages were regenerated and no deployment/DNS/email/provider action was taken.
- RollerRinkRentals.com remains paused.

Preview URL after the Ice frontend is restarted on port 3002:

- http://localhost:3002/__preview/ice-rink-rentals/home

Validation URL used because 3002 was already occupied:

- http://localhost:3004/__preview/ice-rink-rentals/home
