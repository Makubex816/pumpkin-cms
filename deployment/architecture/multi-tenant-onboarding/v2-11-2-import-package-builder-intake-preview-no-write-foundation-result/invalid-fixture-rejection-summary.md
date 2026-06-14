# Invalid Fixture Rejection Summary

Invalid builder fixtures reject:

- missing tenant key;
- missing site key;
- missing owner approval;
- missing Backup Center proof;
- missing Resource Registry refs;
- missing Provider Profile refs;
- missing Runtime QA refs;
- protected config reference;
- secret-like marker;
- production mutation request;
- indexing request;
- paused Roller resume request without approval.

Invalid manifest fixtures carried forward reject:

- missing tenant key;
- missing owner approval;
- missing Backup Center proof;
- production mutation request;
- protected config reference;
- secret-like marker;
- paused tenant resume without approval.
