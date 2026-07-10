# Tenant Visual Fidelity Standard Update

OSH adopts these decision-level requirements for later implementation:

- collect the owner's visual reference before declaring a tenant publish-ready;
- inventory uploaded static packages without executing package JavaScript;
- map brand chrome, typography, color, spacing, layout, navigation, cards, forms, footer, media, and responsive behavior;
- compile structured CMS blocks and tenant theme data rather than arbitrary reference HTML;
- preserve safe media provenance and reject local/source paths in runtime output;
- prove exact title/H1 requirements and representative content counts;
- test narrow mobile, standard mobile, tablet, and desktop widths for overflow and image failures;
- keep preview forms no-post and test live forms through the actual rendered controls;
- require explicit consent rendering whenever the FormDefinition requires consent;
- obtain owner acceptance before CMS persistence or publish transition;
- retain a reversible runtime baseline until persisted CMS output reaches parity.

This is a documentation decision only. OSH did not change compiler output or CMS records.

