# Audit, Rollback, And Publishing Impact QA Result

Applied local/fake cases verified:

- audit IDs present
- rollback plan ID present
- before and after hashes present
- publishing impact present
- affected page IDs present where applicable
- affected instance IDs present where applicable

Sample evidence:

- approve review: 3 audit IDs, rollback `olrp_b05fc9bbbad6`, 1 affected page, 1 affected instance
- policy update: 3 audit IDs, rollback `olrp_8082c48ff9ab`, 2 affected pages, 2 affected instances
- scan run: 3 audit IDs, rollback `olrp_10f9f06511e4`, 2 affected pages, 5 affected instances
- bulk domain disable: 3 audit IDs, rollback `olrp_11a5f483f592`, 2 affected pages, 3 affected instances

Rollback plans remain local evidence artifacts only.
