# Tenant Source Behavior Adaptation Runbook V2.8.62CR

Do not trust or execute uploaded JavaScript during intake. Hash files and statically inspect selectors, data hooks, listeners, DOM writes, navigation, storage, fetch targets, media fallbacks, forms, downloads, and dormant branches.

For each behavior class:

1. identify whether matching source hooks exist;
2. classify active, dormant, disabled, unsafe, or backend-dependent intent;
3. preserve safe native behavior or recreate active behavior in audited Pumpkin code;
4. keep dormant code dormant unless the owner approves activation;
5. replace unsafe persistence or backend behavior only through explicit owner direction;
6. remove inline executable handlers after carrying their data into inert attributes and trusted listeners;
7. prove each active interaction in a network-contained browser;
8. fail closed for unclassified or visibly inert controls.

Structured data may remain nonexecuting. Presentation runtimes should be compiled locally where practical. Proof must separately account for source code analysis, adapted implementation, browser behavior, network requests, storage, and POST activity.
