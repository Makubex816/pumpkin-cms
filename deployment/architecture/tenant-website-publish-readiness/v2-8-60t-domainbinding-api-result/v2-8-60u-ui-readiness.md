# V2.8.60U UI Readiness

Status: ready for next approval.

Backend readiness for V2.8.60U:

- DomainBinding model exists.
- SuperAdmin-only API routes exist.
- Read/list/create/update are available.
- DNS packet generation is available.
- Read-only DNS validation is available.
- TenantAdmin denial is proven.
- Airstrip pending DNS record exists for UI display.

Recommended V2.8.60U scope:

- Add SuperAdmin-only Admin UI route `/dashboard/onboarding/domains`.
- Add DomainBinding API client methods.
- Add list/detail screens.
- Add DNS packet display.
- Add read-only validation action.
- Do not implement Azure hostname binding yet.

