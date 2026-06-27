# Preflight Health Result

All approved health GET checks passed.

## Pumpkin API Root Health

- URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/health`
- Method: GET
- Status: HTTP `200`
- OK flag: true
- Content type: `application/json; charset=utf-8`
- Body length: `191`
- JSON properties observed: `ok`, `service`, `version`, `environment`, `providerConfigured`, `providerStatus`, `timestampUtc`

## Pumpkin API Function Health

- URL: `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net/api/health`
- Method: GET
- Status: HTTP `200`
- OK flag: true
- Content type: `application/json; charset=utf-8`
- Body length: `191`
- JSON properties observed: `ok`, `service`, `version`, `environment`, `providerConfigured`, `providerStatus`, `timestampUtc`

## Static Contact Health

- URL: `https://iceskatingrinkrentals.com/api/static-contact-health`
- Method: GET
- Status: HTTP `200`
- OK flag: true
- Content type: `application/json; charset=utf-8`
- Body length: `187`
- JSON properties observed: `ok`, `service`, `route`, `contactRoute`, `programmingModel`

Health verdict:

The health preflight passed. The phase did not stop for `health_preflight_failed` or `static_contact_health_failed`.
