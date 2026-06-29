# Static Contact Preflight Result

Approved production GET preflights:

| Check | HTTP status | Result |
| --- | ---: | --- |
| Pumpkin health | 200 | passed |
| Pumpkin API health | 200 | passed |
| Static contact health | 200 | passed |
| Contact page | 200 | passed |

Contact page assertions:

- Contains `/api/static-contact`: yes.
- Contains `/api/contact`: no.
- Contains expected public email: yes.

Static contact health assertions:

- Contains `/api/static-contact`: yes.
- Contains `/api/contact`: no.

The corrected production POST gate opened after these checks passed.
