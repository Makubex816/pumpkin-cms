# Operator Handoff Packet Scope

The operator handoff packet is a deterministic, read-only support and review artifact for onboarding/import governance evidence.

It must help an operator answer:

- Which tenant/site is represented.
- Which evidence is canonical.
- Whether Ice package, approval, execution, readback, and projection facts agree.
- Whether Roller remains paused/no-import/no-resume.
- Which hard stops and deferred gates remain closed.
- Which future consumer surfaces may read the packet.

It must not:

- Execute an import.
- Create or resume a tenant.
- Write CMS/provider/MediaAsset data.
- Trigger OLM staging writes.
- Deploy, mutate DNS, or run indexing.
- Read protected config or secret material.
- Create compressed handoff archives in the repo.

The packet is a contract and parity layer only.
