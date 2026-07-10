# Next Phase Prompt

Approve V2.8.61OR Party Pros Managed TLS Completion and HTTPS Runtime Proof.

Goal:

- Re-read current App Service hostname bindings for `partyrentalphiladelphia.com` and `www.partyrentalphiladelphia.com`.
- Re-read public DNS for apex A, `www` CNAME, `asuid`, and `asuid.www`.
- Attempt App Service managed certificate creation/binding for both Party Pros hostnames once each, or read back any already-created certificate if Azure completed it after OQ.
- Bind SNI TLS only if Azure returns valid managed certificate thumbprints.
- If TLS binds for both hostnames, prove HTTPS GET routes for `/`, `/contact`, and `/service-areas` on apex and `www`.
- Enable HTTPS-only only after both custom hostnames have TLS bound and default-host proof remains good.
- Run GET-only non-Airstrip no-regression.
- Produce repo-safe closeout docs.

Still not approved:

- No Bluehost/client registrar login.
- No registrar DNS mutation.
- No nameserver change.
- No starter source change or redeploy unless separately approved.
- No Pumpkin API deploy.
- No Admin UI deploy.
- No Ice deploy/mutation.
- No Airstrip action.
- No Party Pros CMS mutation or publish.
- No contact POST, form submission, or customer-facing POST proof.
- No storage keys/listKeys/SAS.
- No secret/token/cookie printing.
