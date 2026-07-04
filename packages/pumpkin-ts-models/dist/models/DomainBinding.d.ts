export interface DomainBinding {
    id: string;
    tenantId: string;
    domain: string;
    wwwDomain: string;
    canonical: boolean;
    provider: string;
    hostingTarget: DomainBindingHostingTarget;
    dnsRecords: DomainBindingDnsRecord[];
    dnsValidationStatus: string;
    azureHostnameStatus: string;
    tlsStatus: string;
    runtimeStatus: string;
    promotionStatus: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    auditEvents: DomainBindingAuditEvent[];
}
export interface DomainBindingHostingTarget {
    type: string;
    resourceGroup: string;
    appName: string;
    defaultHost: string;
    defaultHostUrl: string;
    inboundIpAddress: string;
    customDomainVerificationId: string;
}
export interface DomainBindingDnsRecord {
    type: string;
    host: string;
    name: string;
    value: string;
    purpose: string;
    status: string;
    observedValues: string[];
    lastCheckedAt?: string | null;
}
export interface DomainBindingAuditEvent {
    id: string;
    at: string;
    actor: string;
    action: string;
    fromStatus: string;
    toStatus: string;
    summary: string;
}
//# sourceMappingURL=DomainBinding.d.ts.map