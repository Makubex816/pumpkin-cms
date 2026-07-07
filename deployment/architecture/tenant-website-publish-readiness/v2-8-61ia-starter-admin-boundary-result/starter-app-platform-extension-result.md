# Starter App Platform Extension Result

Status: documented and minimally enforced.

The starter app remains the immutable partner tenant-site base. Downstream Pumpkin capabilities are extensions around it, not replacements of partner assumptions.

Extension model:

- starter app owns tenant-site public rendering and tenant-local admin workflows;
- Pumpkin API owns shared data contracts and persistence;
- standalone Admin UI owns platform/SuperAdmin operations;
- DomainBinding, Backup Manager, Package Intake, resource/hardcopy, users/admins, and cross-tenant management stay outside starter `/admin`;
- starter `/admin` can later consume read-only platform metadata where explicitly approved.
