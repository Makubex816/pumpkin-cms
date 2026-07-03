# Pumpkin Airstrip Storage RBAC Repair V2.8.58B

V2.8.58B repaired the Airstrip media upload blocker by assigning or confirming Storage Blob Data Contributor for the current signed-in operator principal at the iceskatingmedia storage-account scope only.

Data-plane proof passed on attempt 1 using Azure RBAC login. The proof blob was uploaded, read, listed, downloaded, and deleted. No keys/listKeys/SAS/connection strings were used.

The role assignment remains in place for operator review. It was not removed automatically.
