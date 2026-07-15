# Production-parity root cause and artifact proof

The prior canary hash `d5d298f0...6578e6` differed from the rollback hash `8f5db9c9...59f8`; promotion by separately deployed packages is classified as artifact drift. The CRR build produced two 56-file manifest-identical publishes. The selected 67-entry POSIX ZIP excludes appsettings and hashes to `f746544d49ee8ebf8cfe70f8a28147f8d9e7cb054681bc008ee6038a38c278f6`.

Production and validation used the same App Service, plan, .NET 10 stack, startup command, connection-setting hashes, provider, database, feature-setting hashes, outbound IP set, and no managed identity or VNet integration. The plan was safely scaled from B1 to S1 to support slots. Instrumentation localizes the unresolved wait to the legacy Cosmos email lookup; the lookup begins but does not complete inside the request budget.
