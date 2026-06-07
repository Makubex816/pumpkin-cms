# Error Message Style Guide

Messages should be:

- specific
- calm
- actionable
- free of blame
- understandable without code knowledge

Use:

```text
The page /contact-us/ is not in the approved route list. Add it to routes.json or change the page route to /contact/.
```

Avoid:

```text
Invalid route.
```

For secret scan hits, do not print the secret. Print only file path, line number, detector name, and remediation guidance.

