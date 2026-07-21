# Authorize.Net Upstream Intake Checklist

- [ ] Exact snapshot SHA and changed paths
- [ ] Tenant config fields
- [ ] Public client key versus secrets
- [ ] Secret references/storage
- [ ] Sandbox/production separation
- [ ] Per-tenant/platform merchant-account topology
- [ ] Accept Hosted / Accept.js / raw API approach
- [ ] Raw PAN/CVV server/log exposure scan
- [ ] Payment intent/order/booking linkage
- [ ] Platform and provider duplicate controls
- [ ] Webhook endpoint and X-ANET-Signature validation
- [ ] Event deduplication and authoritative transaction readback
- [ ] Auth/capture/settlement/void/refund state model
- [ ] Admin configuration and response sanitization
- [ ] Tests and deployment requirements
- [ ] Merchant underwriting/acceptable-use gate
- [ ] Adopt/adapt/wrap/reject decision
- [ ] Atlas and migration updates
