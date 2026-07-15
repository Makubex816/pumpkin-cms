# FormEntry Notification Delivery Separation Standard V2.8.62L

Validate, persist FormEntry, and return lead-capture success before optional notification work. Delivery state is independent and limited to `not_configured`, `pending`, `sent`, `failed`, `suppressed_test`, or `dead_lettered`. Delivery failure must not roll back, duplicate, or hide a persisted lead.
