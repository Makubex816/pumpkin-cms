
# Determinism result

Disposition: `QUALIFIED_WITH_HOLDS`

Run1/run2 initial source inventories identical: true

Run1/run2 post-command inventories identical when excluding node_modules/.next/coverage but retaining build outputs: false

Initial tree digests:

- Run1: `25695992fcf9fdaafe8aa9b0cad43915c397036efef6abd3c90f3826540e6f56`
- Run2: `25695992fcf9fdaafe8aa9b0cad43915c397036efef6abd3c90f3826540e6f56`

Post-command tree digests:

- Run1: `d2a2e64a6de114b6fb1168280d9f1bcc2ef00bae7ca4f9c9ac00ae597de231c0`
- Run2: `a194d2baf30f10ed7d16f76e407e0297f47976aaece30dbe0021782df9617f6c`

Post-command differences:

- Added: 0
- Removed: 0
- Changed: 45

Full build determinism is not accepted as proven because block-views/starter locked restore/build proof remains incomplete and generated build outputs are outside the integration boundary.
