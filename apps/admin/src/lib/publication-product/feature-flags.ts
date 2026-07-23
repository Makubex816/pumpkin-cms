export interface PublicationProductFlags {
  uiEnabled: boolean
  customerExecutionEnabled: boolean
  apiBaseUrl: string
}

export function getPublicationProductFlags(): PublicationProductFlags {
  return {
    uiEnabled: process.env.NEXT_PUBLIC_PUBLICATION_PRODUCT_UI_ENABLED === 'true',
    customerExecutionEnabled:
      process.env.NEXT_PUBLIC_PUBLICATION_CUSTOMER_EXECUTION_ENABLED === 'true',
    apiBaseUrl: (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, ''),
  }
}
