# Pumpkin Tenant Website Publish Readiness V2.8.62FR Report

Status: `partial_preview_deployed_live_fidelity_failed_no_second_deploy`.

## Outcome

V2.8.62FR successfully opened anonymous read access for known objects in only the Vegas media container, while preserving denied anonymous listing. All 302 media objects, 28,343,976 bytes, and 473 aliases passed. The deterministic fixture remained byte-identical, local 172-render fidelity passed, the standalone ZIP passed security checks, and the single approved starter deployment reached `RuntimeSuccessful` as deployment `e0c6a833-ad50-4a8d-9ade-85475a529ea1`.

Live Vegas proof itself was strong: 43/43 routes, all three redirects, 172/172 responsive renders, 302 media, 473 aliases, 65 form instances, 1,108 controls, the session age gate, and 45 Airstrip hrefs passed with zero POSTs, zero Airstrip requests, zero overflow, and zero broken or pending images.

## Hard Stop

The deployment package omitted Party Pros' external runtime fixture. Because clean extraction removed the prior copy, Party Pros public checks regressed from 16/16 to 0/16 and preview checks regressed from 8/8 to 0/8. The starter also returns 404 for `/themes/party-pros-orange-slate-v1.css`. Full runtime no-regression is 60/85.

The approved deployment count was one and is exhausted. No second deployment, destructive rollback, Party Pros mutation, appsetting change, form POST, DNS/TLS action, or Airstrip action occurred. A recoverable Party Pros fixture remains outside the deployment package at SHA-256 `2e19d8c084a9cbcb6d5897e1ed7da0380274e96ee7e2662e4210a0c28459dd26`.

## Decision

Vegas media delivery may remain at `blob`; anonymous listing is still unavailable. The live phase cannot be marked complete because shared-host cross-tenant fidelity failed. V2.8.62FRR requires separate approval to restore the Party Pros fixture and theme alias and to perform a new recovery deployment. V2.8.62G remains locked, and V2.8.63A remains the future identity and TenantAdmin-transfer architecture phase.
