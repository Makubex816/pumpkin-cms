# Rollback And Abort Plan

## Abort Before Provisioning

Abort if:

- owner scope is incomplete;
- resource names are ambiguous;
- backup policy is undecided;
- RBAC cannot avoid keys/listKeys/SAS;
- tenant isolation model is unresolved;
- metadata endpoint contract is not accepted;
- seed/migration source of truth is unclear.

## Abort During Future Provisioning

Future provisioning execution must abort if:

- created resource name differs from approved name;
- backup policy differs from approved decision;
- RBAC assignment fails;
- network/security posture differs from approved plan;
- command would reveal or require secrets.

## Rollback After Future Provisioning

Rollback plan must include:

- capture created resources;
- remove only resources created by that approved execution if rollback is explicitly approved;
- keep evidence package and audit log;
- do not delete any existing external resource not created by the provisioning execution.

## No Rollback Needed In 2F-12E

No resources are created in this phase, so no live rollback action is needed.
