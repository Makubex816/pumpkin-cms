# Known Limitations

- local sandbox simulation only
- Admin UI does not execute action simulations
- production API write routes remain blocked or absent
- rollback plans are not executable against live systems
- action result validation is structural, not a full JSON Schema engine
- live-readonly and live-write provider wiring remain future work
- production conflict handling and durable audit persistence remain future work
