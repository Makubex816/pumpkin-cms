# Worker, slot, and artifact reconciliation

Production remained on deployment `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86` and package SHA-256 `8f5db9c9...35f59f8`. The plan was and remains S1 capacity 2.

The retained slot deployment was `ede798d4-e2d6-4337-b574-4dbb96068019`. Corrected deployment `cb31ebcf-0b01-4215-9521-af10d4edd8d1` uses canonical package SHA-256 `04edf05c...72b482c` (56 entries, no appsettings). The slot is stopped and dual-write is disabled.

Plan telemetry during repeated proof reached 99% CPU for consecutive minutes and 86% maximum memory. S2 capacity 2 is the minimum requested cost-bearing change.
