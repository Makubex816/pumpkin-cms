# Roller Tenant Precheck

Roller tenant creation is not approved in V2.8.50.

Before a Roller tenant package dry run:

- Provide a public package that follows V1.
- Provide a separate approved secure handoff.
- Confirm target tenant ID.
- Confirm owner contact and TenantAdmin list.
- Confirm public domains and DNS timing.
- Confirm media source inventory.
- Confirm Theme and FormDefinition baseline requirements.
- Confirm whether contact/form submissions are in scope.
- Confirm publish/static deploy profile.
- Confirm monitoring and runbook expectations.

Hard stops:

- No Roller tenant creation without separate approval.
- No DNS/indexing without separate approval.
- No secrets in the public package.
