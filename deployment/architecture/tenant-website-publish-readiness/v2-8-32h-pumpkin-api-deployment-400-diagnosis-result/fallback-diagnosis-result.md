# Fallback Diagnosis Result

The Central US fallback target selected in V2.8.32G remains the active selected target for H.

H did not create or select any new fallback target.

The prior deployment failure on the Central US target was not caused by:

- Subscription mismatch
- Missing selected Web App
- Wrong App Service plan name
- Wrong runtime stack metadata
- Missing publish-root application files

The failure was caused by ZIP entry names containing backslashes. Correcting the artifact packaging resolved the Azure deployment failure.
