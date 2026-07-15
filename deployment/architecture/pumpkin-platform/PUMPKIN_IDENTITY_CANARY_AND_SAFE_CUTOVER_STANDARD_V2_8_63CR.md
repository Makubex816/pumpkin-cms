# Identity canary and safe cutover standard V2.8.63CR

Every identity login-path package must first pass an isolated production-shaped runtime with management off, invalid and approved-role logins, bounded timing, dual-write/audit count proof, and package-hash identity. Production begins management-off and dual-write-off. A failed bounded login disables the stage and triggers the verified rollback; blind retries are prohibited. Temporary canaries have no domains or traffic and are removed at closeout.
