# Pumpkin Starter App Platform Extension V2.8.61IA

The upstream starter app is the immutable partner base for future Pumpkin tenant websites.

Pumpkin downstream systems extend around the starter app:

- Pumpkin API provides pages, themes, forms, form entries, media, and tenant-scoped data contracts.
- Standalone Admin UI provides platform/SuperAdmin operations.
- Package Compiler prepares tenant package V1 artifacts for controlled import/proof.
- DomainBinding supplies read-only domain/runtime metadata until separately approved mutation phases.
- Backup Manager and operator systems remain platform-side workflows.

The starter app may consume these contracts but must not own platform operations.
