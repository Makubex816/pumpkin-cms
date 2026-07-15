/**
 * Represents metadata associated with a form submission
 */
export interface FormEntryMetadata {
  submissionId?: string;
  correlationId?: string;
  idempotentReplay?: boolean;
  source: string;
  referrer: string;
  status: string;
  tags: string[];
  spamStatus?: 'clean' | 'suspected-spam';
  consentAccepted?: boolean;
  leadRecipientRef?: string;
  staticEndpointRef?: string;
}

/**
 * Represents a form submission entry stored in the FormEntry container
 */
export interface FormEntry {
  id: string;
  submissionId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  tenantId: string;
  siteKey?: string;
  formId: string;
  formKey?: string;
  pageSlug: string;
  sourcePage?: string;
  leadType?: string;
  status?: string;
  spamStatus?: 'clean' | 'suspected-spam';
  consentAccepted?: boolean;
  honeypotFilled?: boolean;
  formData: Record<string, any>;
  submittedAt: string; // ISO 8601 date string
  ipAddress: string;
  userAgent: string;
  metadata: FormEntryMetadata;
}
