# Normalized Package Redirect Accounting Result

Status: `not_reconciled_noop_condition_failed`.

The source declarations and route-map evidence were preserved unchanged. Expected persisted count was not rewritten from 3 to 1, no canonical no-op dispositions were added, and no package fidelity record was removed or silently downgraded.

The existing repaired package still passes V1 validation with 0 errors and 0 warnings. The stronger semantic validator separately fails closed with 1 persisted redirect and 2 meaningful unsupported redirects. Generic V1 validity does not override that semantic failure.
