# Contact Binding Plan

Status: plan only, not executed.

Contact/form strategy:

- Primary Airstrip lead flow is the `airstrip-reservation` FormDefinition candidate.
- Static contact credential is present in secure handoff by boolean only.
- Lead recipient is present in secure handoff by boolean only.
- No contact POST or form submission occurred.

V2.8.58 plan:

1. Create tenant contact binding metadata using secure handoff values at runtime.
2. Create `airstrip-reservation` FormDefinition from normalized package fields.
3. Preserve V2.8.53S external-compatible submit route strategy for tenant-scoped aliases.
4. Read back FormDefinition and binding metadata through Admin routes.
5. Stop before any live contact POST or form submission.

V2.8.59 plan:

Verify UI wiring and route availability without submitting forms.

V2.8.60 plan:

Contact POST or form submission remains excluded unless a later prompt explicitly approves it.

