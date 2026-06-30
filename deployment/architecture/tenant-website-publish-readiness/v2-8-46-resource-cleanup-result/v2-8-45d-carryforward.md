# V2.8.45D Carryforward

V2.8.45D recovered static-contact managed API health after media-origin validator alignment.

Carryforward facts:

- Isolated `/api/static-contact-health`: HTTP 200.
- Production apex `/api/static-contact-health`: HTTP 200.
- Production www `/api/static-contact-health`: HTTP 200.
- Production default Static Web App `/api/static-contact-health`: HTTP 200.
- Production apex/www `/`, `/contact`, and `/service-areas`: HTTP 200.
- Pumpkin API `/health` and `/api/health`: HTTP 200.
- Admin UI production `/` and `/login`: HTTP 200.
- Monitoring/storage hardening remained preserved.
- No contact POST, content write, appsetting mutation, DNS/indexing, Pumpkin API/Admin UI deploy, diagnostic rollback, storage rollback, or secret operation occurred.
