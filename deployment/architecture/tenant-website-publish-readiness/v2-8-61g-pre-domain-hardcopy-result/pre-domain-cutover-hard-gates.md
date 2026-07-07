# Pre-Domain Cutover Hard Gates

Do not proceed to Airstrip custom-domain cutover until all of these are true:

- Owner has applied the Bluehost DNS records from the V2.8.61 packet.
- DNS propagation confirms the expected apex A, apex TXT, www CNAME, and www TXT values.
- A separate approval explicitly authorizes Azure hostname binding and managed TLS.
- Airstrip default host remains HTTP 200 for `/`, `/request-booking`, `/packages`, and `/airstrip-the-club`.
- Pumpkin API `/health` and `/api/health` remain HTTP 200.
- Admin UI production `/` and `/login` remain HTTP 200.
- No content, media, user, role, tenant, DomainBinding, appsetting, or storage mutation is bundled into domain cutover.
- No indexing/Search Console/sitemap submission occurs until after runtime cutover is proven under separate approval.
