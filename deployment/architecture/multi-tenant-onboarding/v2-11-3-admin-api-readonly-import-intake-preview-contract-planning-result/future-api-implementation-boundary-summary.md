# Future API Implementation Boundary Summary

V2.11.4 may implement GET-only import-intake API endpoints if separately approved.

Still prohibited until later gates:

- import execution endpoint;
- POST/PUT/PATCH/DELETE import-intake routes;
- CMS/provider writes;
- tenant lifecycle mutation;
- live provider integration;
- Azure reads/writes/mutation;
- protected config reads;
- deployment or DNS mutation;
- indexing actions.

The future API must remain fixture-backed/read-only unless a later approval says otherwise.
