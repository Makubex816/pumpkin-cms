# Missing Nonrecoverable Secrets Summary

Categories recorded in the outside hardcopy:

| Category | Status |
| --- | --- |
| `bluehost_login_credentials` | Not present in approved local hardcopy; operator-held or missing. |
| `google_workspace_email_dns_credentials` | Not in scope and not recovered. |
| `non_current_user_plaintext_passwords` | Nonrecoverable unless present in approved hardcopy; reset required. |
| `customer_form_entry_payloads` | Not copied to master hardcopy to avoid unnecessary PII. |
| `live_restore_adapter` | Not approved and not available for execution. |
| `airstrip_custom_domain_binding` | Not cut over; pending owner DNS and later binding/TLS approval. |

Key Vault secret values were not included because the existing vault was RBAC inaccessible to the current operator.
