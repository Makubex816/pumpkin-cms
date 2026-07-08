# Airstrip Demo-Only Hold

Default state: hold.

Airstrip remains demo-only on the Azure production default host unless the owner later re-approves custom-domain cutover.

Current state from the atlas:

- Airstrip production App Service exists.
- Airstrip isolated preview App Service exists.
- Airstrip media container exists.
- Airstrip custom-domain DNS is not complete.
- Azure hostname binding and managed TLS are not complete.
- DomainBinding promotion is not complete.

V2.8.61L action:

- No Airstrip route probe.
- No DNS mutation.
- No Bluehost action.
- No Azure custom-domain action.
- No DomainBinding mutation.
- No form submission.
- No contact POST.
- No indexing.

Future phase if owner approves:

- V2.8.62 Airstrip custom-domain cutover through Domain Manager.

Required future approvals:

- Bluehost DNS mutation.
- Azure hostname binding.
- Managed TLS.
- DomainBinding canonical/live promotion.
- Custom-domain runtime proof.
