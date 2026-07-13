# Contact-Page Payload Contract Comparison

| Contract surface | Original | Repaired |
| --- | --- | --- |
| Tenant / ID / slug | valid | unchanged |
| Source-backed visible form | present inside Blog HTML | preserved once |
| Content block types | `Blog` | `Blog`, disabled `formBlock` bridge |
| Embedded FormDefinitions | 0 | 0 |
| Canonical FormDefinition reference | absent from guard shape | `strip-club-near-me-vegas-fidelity-15` |
| Canonical instance | source HTML only | `/contact#form-1` bridge reference |
| Submit behavior | preview/no-post | preview/no-post |
| Email sending | disabled | disabled |
| Guard result | 1 error | 0 errors, 0 warnings |

The bridge uses guard key `default-contact`, is explicitly disabled, and adds no second visible form. It adapts representation only; source labels, fields, content, controls, validation intent, and accepted deviations remain unchanged.
