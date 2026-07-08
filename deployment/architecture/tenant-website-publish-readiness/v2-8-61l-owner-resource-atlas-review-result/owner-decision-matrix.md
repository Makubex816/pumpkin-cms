# Owner Decision Matrix

| decisionLane | defaultDecision | riskIfExecuted | requiredApproval | futurePhase | blockedActionsNow |
| --- | --- | --- | --- | --- | --- |
| Airstrip DNS/custom-domain cutover | hold_demo_only | public domain outage, DNS/TLS misbinding, premature promotion | Bluehost DNS, Azure hostname binding, managed TLS, DomainBinding promotion, custom-domain runtime proof | V2.8.62 Airstrip custom-domain cutover through Domain Manager | DNS mutation, Azure hostname binding, TLS, nameserver changes, indexing |
| Authenticated Admin/CMS workflow proof | recommended_before_full_publish_readiness | hidden login/API/role breakage remains unknown | authenticated read-only proof approval | V2.8.61M Authenticated Admin/CMS workflow proof | content writes, publish writes, tenant/user/role mutation |
| Diagnostic settings reconciliation | plan_only_until_owner_approves_mutation | monitoring gaps may persist if not reconciled | read-only inventory first; separate mutation approval later | V2.8.61N Diagnostic settings reconciliation plan/proof | diagnostic setting mutation |
| Legacy static-contact dependency proof | do_not_delete | deleting active dependency or rollback path | dependency proof approval; deletion approval later | V2.8.61O Legacy static-contact dependency proof | resource deletion |
| OLM staging dependency proof | do_not_delete | deleting hidden staging/dependency data | dependency proof approval; deletion approval later | V2.8.61P OLM staging dependency proof | resource deletion |
| Starter app sandbox proof | local_only_until_separate_approval | disrupting existing isolated resources or confusing admin boundaries | existing-resource sandbox approval, backup/rollback | V2.8.61Q Starter app existing-resource sandbox proof | deploy, resource replacement, Airstrip sandbox use |
| General cleanup/rationalization | do_not_delete | irreversible data/resource loss | per-resource dependency proof and deletion approval | future cleanup proof phase | deletion, destructive cleanup |

Decision rule:

- A lane can move only when the owner approves that lane by name.
- Approval for one lane does not approve any other lane.
