# Status Change Simulation

Status simulation supports link and instance changes through local action fixtures.

Link status requests use `set_link_status` with a target domain, normalized URL, or link id plus an approved local status. Instance status requests use `set_instance_status` with an instance id or stable instance target such as domain.

The simulator writes changed fields only into the sandbox store. It preserves the input store unchanged, writes a rollback plan with previous values, and emits publishing impact so operators can see which pages would need review before any future production action.

Supported link and instance status values are inherited from `src/store/store-files.mjs`.
