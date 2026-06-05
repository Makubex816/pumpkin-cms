# Function Deployment Result

Generated: 2026-06-05

## Final Function App

```text
func-ice-static-contact-20260605
```

## Deployed Route

```text
/api/static-contact
```

Azure reported the indexed function:

```text
func-ice-static-contact-20260605/static-contact
```

Invoke URL:

```text
https://func-ice-static-contact-20260605.azurewebsites.net/api/static-contact
```

## Deployment Method

The package was deployed with Azure CLI zip deployment to the Windows Consumption Function App.

Successful deployment status:

```text
status=4
active=true
complete=true
deploymentId=df61dfca6ad24e7ba9bd670747fe2afe
```

## Local Source Fix During Deployment

The first deployed package indexed the route but returned HTTP 500 for `OPTIONS`.

Cause fixed locally:

```text
azure-function-adapter.mjs returned jsonBody on a 204 preflight response.
```

Fix:

```text
204 responses now omit jsonBody.
```

Local tests were updated to assert the 204 response has no `jsonBody`, then the package was redeployed successfully.

## Not Deployed

No `/api/contact` public Function route was deployed.

No static site artifacts were deployed.

No production website artifacts were deployed.
