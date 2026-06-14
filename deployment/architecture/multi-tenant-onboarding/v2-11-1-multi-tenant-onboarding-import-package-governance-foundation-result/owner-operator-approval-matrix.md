# Owner Operator Approval Matrix

| Gate | Required approver | V2.11.1 status |
| --- | --- | --- |
| Candidate package creation | Operator | Modeled only |
| Local package validation | Operator | Validator foundation created |
| Owner content approval | Owner/operator | Required before future execution |
| Backup prerequisite | Operator | Required ref |
| Resource Registry / Provider Profile binding | Operator | Required refs |
| Runtime QA readiness | Operator | Required ref |
| Paused tenant resume | Owner/operator explicit approval | Not approved |
| CMS/provider write | Explicit future approval | Not approved |
| Deployment/redeployment | Explicit future approval | Not approved |
| DNS/custom-domain mutation | Explicit future approval | Not approved |
| Contact POST | Explicit future approval | Not approved |
| Google/Search Console/indexing | Explicit future approval | Deferred hard stop |

Approvals must name tenant, site, target system, action, rollback/abort owner, and exclusions.
