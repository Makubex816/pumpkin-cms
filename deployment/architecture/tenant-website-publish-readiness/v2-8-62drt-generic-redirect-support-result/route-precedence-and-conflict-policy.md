# Route Precedence And Conflict Policy

Active TenantRedirect resolution precedes normal page rendering.

If an active source path matches an existing page route, validation requires `pageShadowMode: redirect_precedes_page`. The persisted record captures the shadowed page ID and slug. An inactive redirect does not shadow a page and stores `pageShadowMode: none`; later activation must revalidate and explicitly accept precedence.

Conflict policy:

- reject duplicate active tenant redirect sources;
- reject collision with an existing page-owned redirect source;
- require explicit page-shadow intent for an active page source;
- reject source-path rename on PUT;
- reject self-loop and any active graph cycle;
- reject unresolved internal targets unless explicitly pending and inactive;
- keep external targets explicitly classified and HTTP(S)-only.

The starter middleware calls the generic resolver before page rendering, then falls through normally on no match, invalid response, timeout, unsafe location, or same-request loop.
