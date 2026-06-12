# Future Staging Publish Approval Boundary

V2.8.6 does not approve staging publish execution.

A future staging publish approval may approve only:

- using the latest sanitized no-dotenv static output
- deploying to one exact approved staging target
- using an approved deployment auth mode that does not require keys/listKeys, connection strings, or SAS
- validating the deployed staging package under the future phase boundaries

A future staging publish approval must not imply:

- DNS changes
- Search Console/indexing
- live/publication cutover
- CMS writes
- MediaAsset writes
- provider data writes
- Azure infrastructure creation or mutation
- RBAC assignment
- protected config reads
- secret export
- external crawling beyond explicitly approved staging checks
