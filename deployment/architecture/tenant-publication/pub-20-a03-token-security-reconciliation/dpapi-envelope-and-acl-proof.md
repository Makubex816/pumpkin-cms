# DPAPI envelope and ACL proof

Round-trip verification passed without recording the token. ACL inheritance was removed. ACL result: CURRENT_OPERATOR_AND_SYSTEM_ONLY with exactly 2 rules, allowing only the current operator and NT AUTHORITY\SYSTEM.

The protected envelope is not read by this closeout generator. Promotion validates only its safe metadata hash and reference.
