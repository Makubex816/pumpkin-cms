# URL Normalization Result

Implemented behavior:

- preserves `original_url`;
- lowercases scheme and host;
- removes default ports;
- strips fragments from `normalized_url`;
- preserves path and query string;
- rejects embedded credentials;
- ignores relative internal links;
- ignores `mailto:` and `tel:` as contact links rather than outbound web links;
- does not follow redirects;
- does not perform DNS lookups.

Covered by tests:

- uppercase scheme/host normalization;
- fragment stripping;
- path/query preservation;
- relative URL ignore;
- contact link ignore;
- embedded credential rejection.
