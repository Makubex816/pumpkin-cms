# Source Reference Comparison

| Surface | Static reference | Previous starter | OSG result |
| --- | --- | --- | --- |
| Site chrome | navy announcement bar, logo/subtitle, dense nav, orange CTA | plain white header with 3 links | catalog chrome with announcement, logo/subtitle, 5 safe routes, CTA |
| Home hero | navy split hero and `hero-bounce-house.webp` | orange gradient and arcade image | reference navy split hero and exact bounce image |
| Home body | 10 sections, 26 images, catalog/event grids | 3 shallow blocks, 9 images | 7 semantic sections, 26 images, category/event grids and CTA |
| Contact | exact H1, navy hero, two-column details/form | generic split hero and preview cards | exact H1, reference hero, two-column details/form, related links |
| Service areas | exact H1, corporate image, 6 sections, 7 H2s | 2 blocks, 1 H2 | 6 sections, 7 H2s, reference image and link hierarchy |
| Footer | 4-column dark footer | generic 2-column footer | 4-column catalog footer |
| Metadata | tenant titles without platform suffix | titles ended in `Pumpkin CMS` | exact reference titles through absolute metadata |

The repair uses the reference structure and text as evidence while keeping live links limited to routes that actually exist. Unsupported static-page links were mapped to safe home anchors, service areas, or contact GET query paths instead of creating broken routes.
