# Pumpkin Master Operator Recovery Runbook V2.8.61G

Status: current_pre_domain_recovery_reference

Use the V2.8.61G outside hardcopy for current recovery:

`C:\Users\User\Desktop\PumpkinCMS\secure-operator-handoff\v2-8-61g-pre-domain-cutover-master-operator-hardcopy`

Recovery order:

1. Confirm the hardcopy JSON hash matches `534c34addfd62948429b0eae94d0f053d2b4bee51e5daf567a25b1a55a9ab1a0`.
2. Use the current SuperAdmin credential from the outside hardcopy only.
3. Confirm Pumpkin API health before any recovery action.
4. Use tenant/API readback before deciding whether a restore is needed.
5. Use V2.8.61A backup and V2.8.61B restore dry-run for Airstrip restore planning.
6. Use V2.8.61F operator proof for backup/intake/compiler/validator parity.
7. Do not perform live restore, deploy, DNS/custom-domain binding, appsetting mutation, media mutation, content mutation, or indexing without a new exact-scope approval.

For Airstrip custom-domain work, first verify owner-applied Bluehost DNS values. Azure hostname binding and managed TLS require a separate approval.
