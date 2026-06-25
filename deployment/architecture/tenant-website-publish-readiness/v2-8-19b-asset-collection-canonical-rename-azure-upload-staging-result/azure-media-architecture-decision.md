# Azure Media Architecture Decision

Decision:

Image binaries should live in Azure media storage, not as long-term repo source of truth.

Repo responsibilities:

- Store page/source references.
- Store media manifests and future Azure paths.
- Store alt text and route bindings.
- Store validation and approval docs.

Azure media responsibilities:

- Store actual image binaries.
- Serve future public media paths after upload/readback approval.

V2.8.19B did not upload to Azure. The staging folder exists only to prepare a later scoped Azure upload/readback phase.
