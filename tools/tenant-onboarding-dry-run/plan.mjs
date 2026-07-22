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
  const context = {
    tenantUid: input.tenant.uid,
    tenantSlug: input.tenant.slug,
    staticWebAppName: input.azure.staticWebAppName,
    apexDomain: input.domains.apex,
    wwwDomain: input.domains.www,
    staticArtifactSha256: input.staticArtifact.sha256,
  };
  const operations = [
    op("tenant.upsert", "tenant", "plan", ["approval.identityTenantMutation"], context, {
      intent: input.tenant.intent,
      displayName: input.tenant.displayName,
    }),
    op("tenant-admin.membership.upsert", "identity", "plan", ["tenant.upsert", "approval.identityTenantMutation"], context, {
      tenantAdminReference: input.tenantAdmin.reference,
      emailHash: input.tenantAdmin.emailHash,
    }),
    op("contact-settings.upsert", "shared-api", "plan", ["tenant.upsert", "approval.identityTenantMutation"], context, input.contact),
    op("static-artifact.verify", "static-build", "read-only", [], context, input.staticArtifact),
    op("azure.resource-group.ensure", "azure", "mutation-requires-approval", ["approval.azureResourceMutation"], context, {
      subscriptionAlias: input.azure.subscriptionAlias,
      resourceGroup: input.azure.resourceGroup,
      region: input.azure.region,
    }),
    op("azure.static-web-app.ensure", "azure", "mutation-requires-approval", ["azure.resource-group.ensure", "approval.azureResourceMutation", "approval.paidPlan"], context, {
      staticWebAppName: input.azure.staticWebAppName,
      region: input.azure.region,
      environment: input.azure.environment,
    }),
    op("static-artifact.deploy", "azure", "mutation-requires-approval", ["static-artifact.verify", "azure.static-web-app.ensure", "approval.azureResourceMutation"], context, {
      artifactId: input.staticArtifact.id,
      artifactSha256: input.staticArtifact.sha256,
    }),
    op("api.transport.configure", "shared-api", "mutation-requires-approval", ["approval.apiBackendLinking"], context, input.transport),
    op("domain.custom-binding.plan", "azure", "mutation-requires-approval", ["azure.static-web-app.ensure", "approval.domainDnsNameserverTlsMutation"], context, {
      apex: input.domains.apex,
      www: input.domains.www,
    }),
    op("dns.records.plan", "dns", "mutation-requires-approval", ["domain.custom-binding.plan", "approval.domainDnsNameserverTlsMutation"], context, {
      dnsProvider: input.domains.dnsProvider,
      records: [
        { type: "CNAME", name: "www", value: `${input.azure.staticWebAppName}.azurestaticapps.net` },
        { type: "TXT", name: "@", value: "provider-validation-token-pending-readback" },
      ],
    }),
    op("nameserver.delegation.plan", "registrar", "mutation-requires-approval", ["dns.records.plan", "approval.domainDnsNameserverTlsMutation"], context, {
      registrarProvider: input.domains.registrarProvider,
      mode: input.domains.nameserverDelegationMode,
    }),
    op("tls.readiness.plan", "azure", "read-only-after-approved-mutation", ["domain.custom-binding.plan"], context, {
      apex: input.domains.apex,
      www: input.domains.www,
    }),
    op("preflight.no-write", "validation", "read-only", ["static-artifact.deploy", "api.transport.configure"], context, {
      checks: ["static routes", "headers", "API origin", "form shell", "tenant isolation markers"],
    }),
    op("form.persistence-proof.gate", "shared-api", "blocked-until-approval", ["preflight.no-write", "approval.formPersistenceProof"], context, {
      publicFormMode: input.transport.publicFormMode,
      captchaMode: input.transport.captchaMode,
    }),
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
  const approvals = {
    identityTenantMutation: "not-approved",
    azureResourceMutation: input.approvals.azureResourceMutation,
    paidPlan: input.approvals.paidPlan,
    apiBackendLinking: input.approvals.apiBackendLinking,
    domainDnsNameserverTlsMutation: input.approvals.domainDnsNameserverTlsMutation,
    formPersistenceProof: input.approvals.formPersistenceProof,
  };
  return {
    planKind: "pumpkin-tenant-onboarding-dry-run",
    dryRunOnly: true,
    liveMutation: false,
    providerCredentialsRequired: false,
    context,
    approvals,
    operations,
    operationCount: operations.length,
    operationKeys: operations.map((entry) => entry.key),
    idempotencyKey: sha256(stableStringify({ context, operationKeys: operations.map((entry) => entry.key) })),
  };
}

function op(key, provider, mode, dependsOn, context, details) {
  return {
    key,
    idempotencyKey: sha256(stableStringify({ key, context })),
    provider,
    mode,
    dependsOn,
    details,
    mutationAuthorized: false,
  };
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
    "domains.apex",
    "domains.www",
    "domains.registrarProvider",
    "domains.dnsProvider",
    "domains.nameserverDelegationMode",
    "transport.apiTransportMode",
    "transport.publicFormMode",
    "transport.captchaMode",
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
