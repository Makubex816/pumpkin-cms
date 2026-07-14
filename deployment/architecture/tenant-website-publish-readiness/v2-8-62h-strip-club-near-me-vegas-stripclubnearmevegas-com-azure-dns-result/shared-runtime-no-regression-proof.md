# Shared Runtime No-Regression Proof

The committed FRR target inventory was run before Azure mutation and again after final DNS readback. The final sweep completed at `2026-07-14T00:17:43Z`.

| Surface | Final result |
| --- | ---: |
| Ice | 8/8 |
| Pumpkin API | 2/2 |
| Admin UI | 4/4 |
| starter core | 3/3 |
| Party Pros public | 16/16 |
| Party Pros preview | 8/8 |
| Vegas preview | 43/43 |
| Party Pros theme asset | 1/1 |
| Total | 85/85 |

The target builder rejected any non-GET method or Airstrip hostname before requests were sent.

- runtime/form POST requests: 0;
- Airstrip requests: 0;
- failed targets: 0;
- application deployment: 0.

The one SuperAdmin authentication POST used for required Pumpkin metadata readback is separately accounted and was not part of the runtime matrix or a customer/form POST.
