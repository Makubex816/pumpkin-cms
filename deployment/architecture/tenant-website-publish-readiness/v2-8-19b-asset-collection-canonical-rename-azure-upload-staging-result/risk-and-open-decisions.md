# Risk and Open Decisions

## Risks

- The three original contact AI image binaries remain missing.
- Contact replacement candidates are staged but not owner-approved.
- Party Pros East Coast logo remains unresolved.
- Several route slots reuse the same original source image under different canonical blob names.
- Azure target/provider details still need an explicit upload/readback phase.
- Production-bound deploy remains blocked.

## Open Decisions

- Should contact replacement candidates be uploaded, or should the owner provide the original contact AI images?
- What exact file should serve as `party-pros-east-coast-logo.png`?
- Should future implementation reuse one Azure blob across duplicate slots or keep the route-specific canonical copies staged here?
- Should source integration wait until after Azure readback confirms all media URLs?
- Should isolated staging remain blocked until owner approves contact/PPEC decisions?
