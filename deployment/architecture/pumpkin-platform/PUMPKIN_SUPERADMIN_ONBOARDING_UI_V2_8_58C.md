# Pumpkin SuperAdmin Onboarding UI V2.8.58C

Status: implemented and deployed.

Admin UI route:

- `/dashboard/onboarding`

Navigation:

- `Onboarding` is visible only to `SuperAdmin`.
- TenantAdmin users do not see the nav entry.

Authorization:

- Direct route access by non-SuperAdmin users renders an access-restricted state.
- Backend tenant creation and TenantAdmin creation routes remain SuperAdmin-protected.

Deployment:

- Isolated Admin UI deployment: `a7d23f29-685c-44ad-bc0b-d065c1152548`.
- Production Admin UI deployment: `c151495a-4b5e-4dd6-aaa9-c25bb38de354`.

