# Responsive Cart Visual Proof

Chrome proof used these viewports:

- 375 by 812;
- 390 by 844;
- 768 by 1024;
- 1366 by 900.

Routes covered at all four sizes were home, contact, catalog, representative category, representative item, blog listing, and representative blog article. The same seven explicit preview routes were checked at desktop size.

| Proof | Passed | HTTP errors | Failed requests | Broken images | Pending images | Overflow | POST checks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local | 35/35 | 0 | 0 | 0 | 0 | 0 | 0 |
| Live | 35/35 | 0 | 0 | 0 | 0 | 0 | 0 |

Cart interactions passed 15/15 locally and 15/15 live. Screenshots were stored outside the repository and were visually reviewed for catalog, item, blog listing, blog article, contact, and mobile cart behavior.

The expanded mobile cart is an intentional bottom-sheet overlay. It remained within viewport width, exposed close/remove/clear controls, and did not submit or navigate.
