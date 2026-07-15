# Slot login, dual-write, and promotion

Stage A passed invalid 401, SuperAdmin 200, and Vegas TenantAdmin 200. Stage B successful requests produced one audit each; an observed audit-count delta of 7 to 10 matched three successful requests.

Corrected candidate repetition produced eight consecutive 200 responses, but cold restart repetition later produced two responses exceeding 30 seconds. Logs showed lookup under one second and the delay in BCrypt verification while plan CPU saturated. The gate therefore remains worker-capacity dependent.

No production promotion occurred. The rollback artifact remains immediately available.
