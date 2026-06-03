# Service Areas Preview Behavior

## Public Route

`http://localhost:3002/service-areas`

Validation result: `404`

This is expected because `/service-areas` remains draft/needs_review and has not been promoted to live CMS content.

## Preview Route

`http://localhost:3002/draft-preview/ice-rink-rentals/service-areas`

Validation result: `200`

## Preview Alias

`http://localhost:3002/__preview/ice-rink-rentals/service-areas`

Validation result: `200`

## Draft Data Loading

The preview page loads a local draft preview shell first. After an admin JWT is entered in the browser, the shared client requests the service-areas draft from the local Pumpkin API and renders it with `PageRenderer`.

No terminal-side token submission was performed for this report, and no secrets were printed.
