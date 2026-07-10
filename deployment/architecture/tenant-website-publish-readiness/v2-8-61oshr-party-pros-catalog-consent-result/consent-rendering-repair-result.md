# Consent Rendering Repair Result

`ContactFormBlock` now reads `FormDefinition.consent`, renders its configured text and field name, applies the required attribute, and excludes a same-named duplicate field if one exists.

Live custom-domain proof:

- consent controls: 1;
- required consent controls: 1;
- disabled consent controls: 0;
- enabled submit buttons: 1.

Explicit preview proof:

- consent controls: 1;
- required consent controls: 1;
- disabled consent controls: 1;
- enabled submit buttons: 0;
- disabled `Preview only` buttons: 1.

When checked, native `FormData` includes the configured field as `consent: "true"`. The browser's required-field validation runs before the React submit handler. No OSHR submission was used to test this because the authenticated readback gate did not pass.

