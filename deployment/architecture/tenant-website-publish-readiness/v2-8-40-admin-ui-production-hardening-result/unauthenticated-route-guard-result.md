# Unauthenticated Route Guard Result

Unauthenticated route guard proof passed on isolated and production.

Isolated:

- `/dashboard` final path: `/login`
- `/dashboard/pages` final path: `/login`
- Login form visible: true
- Protected dashboard/page text visible before auth: false

Production:

- `/dashboard` final path: `/login`
- `/dashboard/pages` final path: `/login`
- Login form visible: true
- Protected dashboard/page text visible before auth: false

Result: protected Admin UI routes did not render protected tenant/content data to unauthenticated browser sessions.

