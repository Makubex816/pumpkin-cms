# Render Decision Model Result

Implemented model file:

- `src/rendering/render-decision-model.mjs`

Decision fields include:

- tenant and site scope;
- page id;
- instance id;
- outbound link id;
- original and normalized URL;
- domain;
- anchor text;
- link status;
- instance status;
- policy status;
- render action;
- rendered output;
- reason code;
- safe `rel`;
- safe `target`;
- fallback URL.

Supported actions:

- `active_anchor`
- `plain_text`
- `hidden`
- `disabled_span`
- `fallback_anchor`
- `pending_review_plain_text`
- `domain_blocked_plain_text`
