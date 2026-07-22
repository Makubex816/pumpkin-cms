# Downstream preservation and compatibility result

Checkpoint preservation rules:

- keep unrelated dirty work unstaged;
- avoid current dirty admin, ice-rink-web, and pumpkin-ts-models dist paths in INT-10 source commits unless separately reconciled;
- preserve downstream tenant isolation, identity authorization, FormEntry persistence, and existing page/block serialization;
- make public tenant output static and deterministic from recorded inputs.
