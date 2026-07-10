# V2.8.61OSF Carryforward

Verified commit: `6d5f89cdd2bc2221dc621e99939b094a372cb1dd`.

OSF established the Party Pros submit-key pipeline and created FormEntry `43dcad71-0f9c-47b2-97db-69374ee9560f`. Before the OSI form POST, fresh SuperAdmin proof confirmed:

- Party Pros list endpoint: HTTP 200;
- OSF entry under Party Pros: HTTP 200;
- tenant and form identity matched;
- consent accepted: true;
- same OSF entry ID under Ice: HTTP 404;
- FormDefinition readback: HTTP 200, 9 fields, required consent.

OSI did not mutate submit-key registration or starter appsettings.

