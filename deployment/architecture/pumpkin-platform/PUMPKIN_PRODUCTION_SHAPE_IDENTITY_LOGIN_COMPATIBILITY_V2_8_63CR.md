# Production-shape identity login compatibility V2.8.63CR

Legacy credential verification remains the availability authority. Additive identity reads and writes must be bounded, partition-aware, shape-tolerant, and unable to turn valid credentials into a 500 or hang. Session-version compatibility supports missing, null, numeric, and explicitly convertible historical strings. Additive failure creates an idempotent reconciliation record keyed by the request correlation identifier.
