# Mobile sticky CTA clearance standard

Tenant pages with fixed bottom controls must measure the combined visible fixed-UI envelope and expose one shared clearance variable. Document bottom padding must include that clearance plus `env(safe-area-inset-bottom)`. Proof must center each form control before corner/center hit-testing, confirm no unrelated element intercepts it, and issue no navigation or POST.
