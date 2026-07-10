# Tenant Isolation Proof

Positive tenant readback:

- tenant: `party-pros-philadelphia`;
- entry: `92f04673-9427-401a-b569-eca3b5b8089f`;
- Admin API status: HTTP 200;
- entry tenant identity matched: true.

Negative cross-tenant readback:

- tenant checked: `ice-rink-rentals`;
- same entry ID;
- Admin API status: HTTP 404;
- classification: entry absent from the Ice FormEntry partition.

Ice form submissions and Ice mutations: 0. Airstrip tenant checks: 0.

