# Outbound Link Manager Import Carryforward

OLM refs must include:

- OLM package/run ref;
- route/content linkage ref;
- validation status;
- write boundary state;
- rollback/abort note.

Rules:

- OLM evidence can be referenced for route/content readiness.
- Additional OLM writes remain closed.
- Outbound live link checks and crawls remain closed.
- OLM import carryforward must not contain provider credentials or write instructions.
