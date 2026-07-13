# Deterministic Fixture Hash Proof

A clean independent output-directory rebuild from the same pinned inputs matched the primary fixture and generated registry byte-for-byte.

## Hashes

- Deterministic payload SHA-256: `843606019ed622fe9653c5ea6964c037896b62c0045bf6a11ea2db6f51e11484`.
- Repository fixture file SHA-256: `2CB1656A4C46F3C496DB48375D51244439AC1F217305A859FD80A15520A4A986`.
- Generation report SHA-256: `47CA40AC6517FEF7C359322D0063805CB46BB33FF96E96F8B160F867CA5359C6`.
- Parity scorecard SHA-256: `D7D77808CBCE33011540B69E373A9FB903077C88F3E2E7F42C3C89B856A3A6D7`.
- Generated registry SHA-256: `055037801235FFB2CD25EF835D10BADC8A2EB5FF0741C9E642A169EA563E911D`.

## Determinism Rules

- The hashed fixture contains no generated timestamp.
- The fixture self-hash excludes only its own hash field.
- The same source tree, compiler source, schema, and evidence hashes produced identical bytes.
