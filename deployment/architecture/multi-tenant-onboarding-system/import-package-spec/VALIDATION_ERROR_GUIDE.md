# Validation Error Guide

## Error Style

Errors should explain:

- what file has the issue
- what field is wrong
- why it matters
- how to fix it
- whether the issue blocks import, staging, production, or indexing

## Example

Bad:

```text
route invalid
```

Good:

```text
pages/contact.json uses route /contact-us/, but routes.json approves only /contact/. Change the page route or update the approved route list before import.
```

