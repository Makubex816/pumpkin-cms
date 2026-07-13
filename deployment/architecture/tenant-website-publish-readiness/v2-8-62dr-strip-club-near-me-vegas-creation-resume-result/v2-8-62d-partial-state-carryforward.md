# V2.8.62D Partial-State Carryforward

V2.8.62D commit `e4d9702b7462ae02092096466b98a216b5fa8a93` was present at entry. Its tenant and media state were treated as immutable carryforward: one Vegas tenant, no imported CMS records, and 302 canonical blobs totaling 28,343,976 bytes.

The tenant and container were not recreated. No blob was uploaded or deleted.
