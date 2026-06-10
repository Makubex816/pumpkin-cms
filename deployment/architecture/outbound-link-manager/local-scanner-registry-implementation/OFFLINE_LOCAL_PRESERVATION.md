# Offline Local Preservation

Local/offline behavior remains the default. The local package continues to work from fixtures and `.tmp` stores, and the Admin UI continues to render from local mock data.

Future production work must preserve:

- fake fixture mode for unit tests
- offline-bundle mode for tenant package validation
- local-simulation mode for operator rehearsals
- local-api-fake-provider mode for Admin/API integration tests

No future live provider should replace these modes or make them dependent on protected configuration.
