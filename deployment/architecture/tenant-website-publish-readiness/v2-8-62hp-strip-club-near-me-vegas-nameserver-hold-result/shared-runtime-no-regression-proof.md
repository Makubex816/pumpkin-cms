# Shared Runtime No-Regression Proof

HPR ran the exact committed 85-target matrix from a new outside-repository HPR helper. It used committed Vegas fixture data, GET only, manual redirect handling, and an Airstrip-host block before each request.

Proof timestamp: `2026-07-14T02:06:49.271Z`.

| Surface | Result |
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

- failed targets: 0;
- POST requests: 0;
- Airstrip requests: 0;
- unsafe redirects followed: 0;
- runtime mutations: 0;
- deployments initiated by HPR: 0.
