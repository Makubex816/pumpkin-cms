import fs from "node:fs";
import crypto from "node:crypto";

const args = parseArgs(process.argv.slice(2));
const input = readJson(args.input ?? "tools/tenant-onboarding-dry-run/synthetic-onboarding-input.json");
validate(input);

const plan = buildPlan(input);
const serialized = `${stableStringify(plan)}\n`;
if (args.out) {
  fs.mkdirSync(dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, serialized);
}
process.stdout.write(serialized);

function buildPlan(input) {
  const current = input.currentState ?? {};
  const approvals = {
    identityTenantMutation: normalizeApproval(input.approvals.identityTenantMutation),
    azureResourceMutation: normalizeApproval(input.approvals.azureResourceMutation),
    freePlan: normalizeApproval(input.approvals.freePlan),
    apiDeployment: normalizeApproval(input.approvals.apiDeployment),
    staticDeployment: normalizeApproval(input.approvals.staticDeployment),
    publicPublicationMutation: normalizeApproval(input.approvals.publicPublicationMutation),
    domainDnsNameserverTlsMutation: normalizeApproval(input.approvals.domainDnsNameserverTlsMutation),
    formPersistenceProof: normalizeApproval(input.approvals.formPersistenceProof),
  };
  const context = {
    tenantUid: input.tenant.uid,
    tenantSlug: input.tenant.slug,
    publicationId: input.publication?.id ?? "",
    releaseId: input.publication?.releaseId ?? "",
    staticWebAppName: input.azure.staticWebAppName,
    staticWebAppSku: input.azure.sku ?? "Free",
    apexDomain: input.domains.apex,
    wwwDomain: input.domains.www,
    staticArtifactSha256: input.staticArtifact.sha256,
  };
  const operations = [
    op("tenant.upsert", "tenant", "plan", ["approval.identityTenantMutation"], context, {
      intent: input.tenant.intent,
      displayName: input.tenant.displayName,
    }, current.tenantExists === true ? "verify" : "create", approvals.identityTenantMutation),
    op("tenant-admin.membership.upsert", "identity", "plan", ["tenant.upsert", "approval.identityTenantMutation"], context, {
      tenantAdminReference: input.tenantAdmin.reference,
      emailHash: input.tenantAdmin.emailHash,
    }, current.tenantAdminMembershipExists === true ? "verify" : "create", approvals.identityTenantMutation),
    op("contact-settings.upsert", "shared-api", "plan", ["tenant.upsert", "approval.identityTenantMutation"], context, input.contact),
    op("static-artifact.verify", "static-build", "read-only", [], context, input.staticArtifact),
    op("azure.resource-group.ensure", "azure", "mutation-requires-approval", ["approval.azureResourceMutation"], context, {
      subscriptionAlias: input.azure.subscriptionAlias,
      resourceGroup: input.azure.resourceGroup,
      region: input.azure.region,
    }, current.resourceGroupExists === true ? "verify" : "create", approvals.azureResourceMutation),
    op("azure.static-web-app.ensure", "azure", "mutation-requires-approval", ["azure.resource-group.ensure", "approval.azureResourceMutation", "approval.freePlan"], context, {
      staticWebAppName: input.azure.staticWebAppName,
      region: input.azure.region,
      environment: input.azure.environment,
      sku: input.azure.sku ?? "Free",
    }, current.staticWebAppExists === true ? "verify" : "create", approvals.azureResourceMutation === "approved" && approvals.freePlan === "approved" ? "approved" : "not-approved"),
    op("api.public-form-contract.deploy", "shared-api", "mutation-requires-approval", ["approval.apiDeployment"], context, {
      transportMode: input.transport.apiTransportMode,
      linkedBackend: false,
    }, current.apiDeploymentMatches === true ? "verify" : "update", approvals.apiDeployment),
    op("publication.record.ensure", "shared-api", "mutation-requires-approval", ["tenant.upsert", "api.public-form-contract.deploy", "approval.publicPublicationMutation"], context, input.publication ?? {}, current.publicationMatches === true ? "verify" : current.publicationExists === true ? "update" : "create", approvals.publicPublicationMutation),
    op("publication.origin.register", "shared-api", "mutation-requires-approval", ["publication.record.ensure", "azure.static-web-app.ensure", "approval.publicPublicationMutation"], context, {
      source: "static-web-app-default-host-readback",
      exactOriginOnly: true,
    }, current.publicationOriginRegistered === true ? "verify" : "update", approvals.publicPublicationMutation),
    op("static-artifact.deploy", "azure", "mutation-requires-approval", ["static-artifact.verify", "azure.static-web-app.ensure", "publication.origin.register", "approval.staticDeployment"], context, {
      artifactId: input.staticArtifact.id,
      artifactSha256: input.staticArtifact.sha256,
    }, current.deployedArtifactMatches === true ? "verify" : "update", approvals.staticDeployment),
    op("domain.custom-binding.plan", "azure", "mutation-requires-approval", ["azure.static-web-app.ensure", "approval.domainDnsNameserverTlsMutation"], context, {
      apex: input.domains.apex,
      www: input.domains.www,
    }, "held", approvals.domainDnsNameserverTlsMutation),
    op("dns.records.plan", "dns", "mutation-requires-approval", ["domain.custom-binding.plan", "approval.domainDnsNameserverTlsMutation"], context, {
      dnsProvider: input.domains.dnsProvider,
      records: [
        { type: "CNAME", name: "www", value: `${input.azure.staticWebAppName}.azurestaticapps.net` },
        { type: "TXT", name: "@", value: "provider-validation-token-pending-readback" },
      ],
    }, "held", approvals.domainDnsNameserverTlsMutation),
    op("nameserver.delegation.plan", "registrar", "mutation-requires-approval", ["dns.records.plan", "approval.domainDnsNameserverTlsMutation"], context, {
      registrarProvider: input.domains.registrarProvider,
      mode: input.domains.nameserverDelegationMode,
    }, "held", approvals.domainDnsNameserverTlsMutation),
    op("tls.readiness.plan", "azure", "read-only-after-approved-mutation", ["domain.custom-binding.plan"], context, {
      apex: input.domains.apex,
      www: input.domains.www,
    }, "held", "not-approved"),
    op("preflight.no-write", "validation", "read-only", ["static-artifact.deploy", "publication.record.ensure"], context, {
      checks: ["static routes", "noindex headers", "API origin", "ticket issuance", "origin denial", "tenant isolation markers"],
    }),
    op("form.persistence-proof.gate", "shared-api", "blocked-until-approval", ["preflight.no-write", "approval.formPersistenceProof"], context, {
      publicFormMode: input.transport.publicFormMode,
      captchaMode: input.transport.captchaMode,
    }, Number(current.logicalSubmissionCount ?? 0) === 1 ? "verify" : "create", approvals.formPersistenceProof),
    op("tenant-isolation.gate", "validation", "read-only", ["preflight.no-write"], context, {
      tenantUid: input.tenant.uid,
      tenantSlug: input.tenant.slug,
    }),
    op("rollback.plan", "rollback", "plan", ["static-artifact.verify"], context, input.rollback),
    op("resumption-state.record", "atlas", "plan", ["rollback.plan"], context, {
      resumeAfter: "owner approval for live pilot mutation classes",
    }),
    op("atlas-register.update.plan", "atlas", "plan", ["resumption-state.record"], context, {
      staticArtifact: input.staticArtifact,
      tenant: input.tenant,
    }),
  ];
  const mutationOperations = operations.filter((entry) => entry.mutationRequired);
  return {
    planKind: "pumpkin-tenant-onboarding-dry-run",
    planSchemaVersion: "2.0",
    dryRunOnly: true,
    liveMutation: false,
    providerCredentialsRequired: false,
    context,
    approvals,
    operations,
    operationCount: operations.length,
    operationKeys: operations.map((entry) => entry.key),
    reconciliationStatus: mutationOperations.length === 0 ? "noop" : "changes-planned",
    mutationRequiredCount: mutationOperations.length,
    unauthorizedMutationCount: mutationOperations.filter((entry) => !entry.mutationAuthorized).length,
    currentStateObserved: Object.keys(current).length > 0,
    idempotencyKey: sha256(stableStringify({ context, operationKeys: operations.map((entry) => entry.key) })),
  };
}

function op(key, provider, mode, dependsOn, context, details, plannedAction = "verify", approval = "not-required") {
  const mutationRequired = ["create", "update", "delete"].includes(plannedAction);
  return {
    key,
    idempotencyKey: sha256(stableStringify({ key, context })),
    provider,
    mode,
    dependsOn,
    details,
    plannedAction,
    mutationRequired,
    mutationAuthorized: mutationRequired && approval === "approved",
  };
}

function normalizeApproval(value) {
  return value === "approved" || value === true ? "approved" : "not-approved";
}

function validate(input) {
  const requiredPaths = [
    "tenant.uid",
    "tenant.slug",
    "tenant.displayName",
    "tenantAdmin.reference",
    "contact.notificationMode",
    "contentPackage.sha256",
    "theme.sha256",
    "staticArtifact.id",
    "staticArtifact.sha256",
    "azure.subscriptionAlias",
    "azure.resourceGroup",
    "azure.staticWebAppName",
    "azure.region",
    "azure.environment",
    "azure.sku",
    "domains.apex",
    "domains.www",
    "domains.registrarProvider",
    "domains.dnsProvider",
    "domains.nameserverDelegationMode",
    "transport.apiTransportMode",
    "transport.publicFormMode",
    "transport.captchaMode",
    "publication.id",
    "publication.releaseId",
    "rollback.artifactId",
    "approvals.azureResourceMutation",
  ];
  for (const dottedPath of requiredPaths) {
    if (get(input, dottedPath) === undefined) throw new Error(`Missing onboarding input: ${dottedPath}`);
  }
  const credentialKeyPattern = new RegExp(
    ["password", `client${"Secret"}`, `private${"Key"}`, `connection${"String"}`, `Account${"Key"}`].join("|"),
    "i",
  );
  if (credentialKeyPattern.test(JSON.stringify(input))) {
    throw new Error("Onboarding dry-run input contains a forbidden credential-like key.");
  }
}

function get(value, dottedPath) {
  return dottedPath.split(".").reduce((current, part) => current?.[part], value);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith("--")) continue;
    result[argv[index].slice(2)] = argv[index + 1];
    index += 1;
  }
  return result;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function dirname(file) {
  const index = file.replaceAll("\\", "/").lastIndexOf("/");
  return index === -1 ? "." : file.slice(0, index);
}
