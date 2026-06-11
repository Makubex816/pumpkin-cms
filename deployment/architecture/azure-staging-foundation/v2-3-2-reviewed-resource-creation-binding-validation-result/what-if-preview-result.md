# What-If Preview Result

Azure what-if was skipped.

Reason: V2.3.2 stopped before mutation because the deployment target is not finalized and the candidate resource group does not exist. Running a resource-group what-if against a missing, candidate-only group would not satisfy the reviewed-target gate.

No `az deployment group what-if`, `az deployment sub what-if`, `az deployment group create`, `az deployment sub create`, or `az group create` command was run.

Required before future what-if:

- Final reviewed resource group name.
- Final reviewed subscription/tenant target.
- Final non-example parameter file or exact parameter set.
- Removal of placeholder tag values.
- Resolution of naming differences between the naming plan and Bicep-derived values.

