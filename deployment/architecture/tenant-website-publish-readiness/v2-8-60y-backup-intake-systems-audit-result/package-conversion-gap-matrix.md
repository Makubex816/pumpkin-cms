# Package Conversion Gap Matrix

| Capability | Current State | Target State | Gap | Priority |
| --- | --- | --- | --- | --- |
| ZIP upload | Not implemented as production wizard | Non-technical upload with quarantine | Build upload service/UI | P0 |
| File inventory | Manual/Codex for Airstrip | Automatic inventory and checksums | Build inventory scanner | P0 |
| Framework detection | Manual for Airstrip | Classify static, Next, Vite, React, Astro, hybrid, unknown | Build detector | P0 |
| Safe render/build | Manual copied workspace | Controlled copied workspace sandbox | Build runner policy and logs | P0 |
| Route discovery | Manual/source inspection | Automatic route map with confidence | Build route extractor | P0 |
| Media discovery | Manual for Airstrip | Media manifest with source refs | Build media scanner | P0 |
| Form discovery | Manual for Airstrip | FormDefinition map and uncertainty flags | Build form/endpoint analyzer | P0 |
| Theme extraction | Manual from source JSON/CSS | Brand/theme proposal with colors/logos/nav | Build theme analyzer | P1 |
| Tenant/domain normalization | Manual | Wizard prompt and normalized output | Build normalization step | P0 |
| Secret detection | Validator and manual source scan | Quarantine plus redacted source-secret report | Build source-package secret scanner | P0 |
| V1 package generation | Manual for Airstrip | Compiler output directory | Build package writer | P0 |
| Schema validation | Implemented | Integrated into wizard | Wire validator/API/UI | P1 |
| Responsive proof | Implemented checker | Mandatory gate in wizard | Wire proof status and blockers | P0 |
| Owner action packet | Manual reports | Generated packet with plain language | Build packet writer | P1 |
| Import execution | Separate and gated | Still separate and gated | Preserve boundary | P0 |

