# Pumpkin Resource Decision Matrix V2.8.61L

Status: completed.

| lane | default | future phase | approved now |
| --- | --- | --- | --- |
| Airstrip custom-domain cutover | hold_demo_only | V2.8.62 | no |
| Authenticated Admin/CMS proof | recommended_read_only_next | V2.8.61M | no execution, prompt only |
| Diagnostic settings reconciliation | read_only_plan_first | V2.8.61N | no |
| Legacy static-contact cleanup | do_not_delete | V2.8.61O | no |
| OLM staging cleanup | do_not_delete | V2.8.61P | no |
| Starter app sandbox proof | local_only | V2.8.61Q | no |
| General cleanup/rationalization | do_not_delete | future cleanup proof | no |

Approval separation rule:

- Each lane requires its own approval.
- Approval for one lane does not imply approval for any other lane.
- Decision packets do not execute live actions.
