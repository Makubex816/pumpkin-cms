# Risk And Open Decisions

Open blocker:

- Isolated POST still returns 404 after one app plus API deployment.

Most likely remaining deployment-shape issue:

- Managed Functions trigger discovery did not load the ESM root entrypoint as a POST route.

Prepared but not deployed:

- CommonJS generated-style v4 registration file at `src/functions/static-contact.js`.

Risks:

- The next candidate still requires isolated live proof.
- Azure managed Functions logs were not inspected in this phase.
- Strict static validators continue to fail on known non-contact media-origin policy findings.

