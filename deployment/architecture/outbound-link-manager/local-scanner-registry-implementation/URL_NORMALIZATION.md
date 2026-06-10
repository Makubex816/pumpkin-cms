# URL Normalization

Normalization is deterministic and local.

Rules:

- preserve `original_url` exactly as found after trimming outer whitespace;
- classify only absolute `http` and `https` URLs as outbound web links;
- lowercase scheme and host;
- remove default ports;
- strip fragments from `normalized_url`;
- preserve path and query string;
- reject embedded credentials;
- ignore relative URLs as internal;
- ignore `mailto:` and `tel:` as contact links, not outbound web links;
- do not follow redirects;
- do not perform DNS lookups.

The registry key is tenant id, site id, and `normalized_url`.
