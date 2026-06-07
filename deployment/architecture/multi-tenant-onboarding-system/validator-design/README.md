# Validator Design

Validators are the safety system for tenant onboarding. They should catch bad packages, wrong routes, unsafe media, form mistakes, secrets, generated artifacts, and premature indexing before any external mutation.

Validators must default to read-only or local-only behavior.

