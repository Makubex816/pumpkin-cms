# Notification and Persistence Separation

New FormEntries explicitly record `leadPersistenceStatus`, `notificationConfigured`, and `notificationDeliveryStatus`. Persistence completes and returns success before any optional future delivery. A recipient reference does not imply a provider; current entries therefore report persisted leads with delivery `not_configured`. No third-party provider was added and no email was sent.
