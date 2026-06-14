# Admin Consumer Compatibility Carryforward

V2.9.7 Admin still consumes the V2.9.6 read-only API envelope locally through the Admin contract adapter.

V2.9.9 does not switch Admin to the Pumpkin API runtime endpoint.

Admin bridge remains a future explicit boundary. The new API envelope uses the same shared fixture source and preserves the fields Admin needs for a future adapter update:

- summary;
- panels;
- warnings;
- blockers;
- next gates;
- security boundary;
- provider mode;
- tenant/site scope;
- trace/correlation IDs.

