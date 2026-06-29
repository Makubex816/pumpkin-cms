# Direct Valid Write Probe Result

Probe type:

Direct valid Pumpkin API FormEntry write probe using the approved static contact API key.

Execution:

- Approved max direct valid write probes: 1.
- Actual direct valid write probes: 1.
- HTTP status: 401.
- Entry created: no.
- Admin readback polling attempts: 5.
- Admin readback statuses: 200, 200, 200, 200, 200.
- Admin readback found direct probe trace: no.
- Secret values printed: no.

Classification:

`direct_valid_write_failed_401`

Meaning:

The static contact key did not validate against the live Pumpkin API tenant auth path before repair.
