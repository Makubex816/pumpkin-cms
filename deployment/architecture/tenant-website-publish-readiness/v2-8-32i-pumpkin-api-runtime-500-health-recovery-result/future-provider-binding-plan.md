# Future Provider Binding Plan

Provider/contact binding remains deferred.

Required order:

1. Approve a deploy-only follow-up for the locally validated null-safe JWT fix.
2. Deploy exactly once to the selected Central US Web App.
3. GET exactly `/health` and `/api/health`.
4. Promote `https://app-pumpkin-api-prod-centralus-001.azurewebsites.net` as future `PUMPKIN_API_URL` only if both health routes return success.
5. Request a separate provider/contact secret-binding approval.
6. Request a separate contact POST validation approval after provider binding is complete.

No provider/contact secret was bound in I.
