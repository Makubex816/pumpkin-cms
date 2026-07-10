# Responsive Visual Proof

Browser method: headless Chromium DevTools Protocol with GET-only navigation and progressive scrolling to trigger lazy media.

Required viewports:

- 375 x 812;
- 390 x 844;
- 768 x 1024;
- 1366 x 900.

The apex and `www` home, contact, and service-area routes produced 24 required checks. Three desktop preview checks brought the total to 27.

| Check | Result |
| --- | ---: |
| Route/viewport checks | 27 |
| Non-200 documents | 0 |
| Horizontal overflows | 0 |
| Broken image checks | 0 |
| Pending image checks | 0 |
| Failed request checks | 0 |
| HTTP error checks | 0 |
| POST request checks | 0 |

Full matrix screenshots are outside the repo at `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61osg\screenshots-live-responsive`.

Six owner-facing top-of-page captures are outside the repo at `C:\Users\User\AppData\Local\Temp\pumpkin-v2-8-61osg\owner-acceptance-screenshots`. Chrome was used for the matrix. Edge Chromium was used for the final 375-pixel contact capture because Chrome produced a headless compositor-only black tile; both browsers reported a 375-pixel client and scroll width, no overflow, no broken visible image, and no POST request.
