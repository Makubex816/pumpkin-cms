# Identity login timing and availability standard V2.8.63CRR

Log safe correlation IDs and elapsed milliseconds around lookup, credential verification, legacy accounting, identity write/audit, token creation, and serialization. Never log credentials or tokens. Storage calls require cancellation and a committed request budget. A stage-start without stage-complete is a deployment blocker.
