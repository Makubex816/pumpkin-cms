# Exactly-one FormEntry proof

No submission was sent and no FormEntry was created. Exactly-one persistence was not claimed. Existing persistence deduplicates the same submission ID because it becomes the record ID, but the Idempotency-Key is not independently unique if a caller changes the submission ID. The required public contract must bind the idempotency identity to the submission ID before a live proof.
