# V2.8.61OL Carryforward

Commit readback:

```text
10a2ef9f Add V2.8.61OL form pipeline DNS packet
```

Carryforward:

- Shared Pumpkin form pipeline exists in source.
- Authenticated E2E FormEntry creation/readback proof remains held pending safe submit/readback auth and email-safety approval.
- Safe no-auth submit probes returned `400 API key is required` before write.
- Unauthenticated Admin readback returned `401`.
- Party Pros preview remains no-post.
- OL documented that no Azure DNS zone existed yet.
- OL did not mutate DNS, nameservers, registrar state, custom-domain bindings, deploys, forms, Party Pros publish state, Ice, or Airstrip.

ON changed only the approved Azure DNS-side resources.
