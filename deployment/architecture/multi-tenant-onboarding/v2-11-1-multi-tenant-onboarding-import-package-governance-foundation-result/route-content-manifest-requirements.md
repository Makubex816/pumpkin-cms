# Route Content Manifest Requirements

Route/content manifests must include:

- tenant key and site key;
- canonical domain;
- route list;
- route source refs;
- content refs;
- content owner approval ref;
- static/dynamic route classification;
- blocked route notes;
- validation refs;
- rollback/abort refs.

Routes must not include:

- raw protected config;
- authentication material;
- runtime tokens;
- live crawl results;
- external link-follow results unless a future approval allows them.

Ice carryforward route baseline:

- `/`
- `/service-areas`
- `/contact`

Roller baseline:

- paused candidate only;
- no resume;
- no live route validation.
