# Resource Registry Binding Requirements

Resource Registry bindings must include:

- tenant key;
- site key;
- provider profile ref;
- resource registry entry ref;
- environment classification;
- local/read-only validation ref;
- owner/operator approval ref;
- open blocker list.

Rules:

- bindings reference registry evidence; they do not query Azure or mutate resources;
- ambiguous provider/profile bindings are no-go;
- missing Resource Registry binding is no-go;
- production resource changes remain separately gated.
