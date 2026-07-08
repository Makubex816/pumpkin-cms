# Do-Not-Delete Confirmation

Default state: all protected resources remain protected.

Production do-not-delete:

- Pumpkin API production App Service.
- Admin UI production App Service.
- Shared production App Service plan.
- Ice production Static Web App.
- Production Cosmos account.
- Production media storage.
- Production observability workspace, action group, and metric alerts.

Airstrip do-not-delete:

- Airstrip production App Service.
- Airstrip isolated preview App Service.
- Airstrip media container.

Isolated/proof do-not-delete:

- Admin UI isolated App Service.
- Ice isolated Static Web App.

Protected until dependency proof:

- Legacy static contact Function App, storage, and plan.
- Outbound-link-manager staging resources.

V2.8.61L authorizes no deletion.
