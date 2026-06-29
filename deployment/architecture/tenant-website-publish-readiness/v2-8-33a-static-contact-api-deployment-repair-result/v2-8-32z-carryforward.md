# V2.8.32Z Carryforward

V2.8.32Z classification:

`static_contact_delivery_failed_http_502_after_normalized_key_repair_no_retry`

Relevant carryforward:

- Static contact payload contract was corrected in V2.8.32Y.
- Static contact appsetting key normalization was repaired in V2.8.32Z.
- Production `/api/static-contact` still returned HTTP 502 after that repair.
- No production retry was available in V2.8.32Z.
- V2.8.33A was approved to deploy the current source-side compat API package first to isolated staging, then production only if isolated POST/readback succeeded.
