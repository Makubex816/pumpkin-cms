# V2.8.61OSF Carryforward

OSF is committed at `6d5f89cdd2bc2221dc621e99939b094a372cb1dd`.

Valid carryforward:

- Party Pros submit-key provisioning succeeded;
- starter tenant and API key appsettings were set without exposing values;
- exactly one OSF synthetic POST returned HTTP 201;
- FormEntry `43dcad71-0f9c-47b2-97db-69374ee9560f` read back in tenant `party-pros-philadelphia`;
- FormDefinition `party-pros-quote-request` read back with nine fields;
- the same entry id returned 404 in the Ice tenant partition;
- no active external mail sender was found in the exercised source path;
- no real customer inquiry or external customer email occurred.

OSH confirmed the starter tenant id still matches Party Pros and the API URL/key settings remain configured without printing values. OSH did not create a replacement FormEntry because the required custom-header Admin preflight returned 401.

