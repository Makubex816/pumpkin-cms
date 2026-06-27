# Deployment Log Diagnosis

## Prior Failed Deployment

V2.8.32G deployment id:

`4f072de2-9bec-4caf-81ee-23a4ebaa8c94`

Log summary:

- Deployer: `OneDeploy`
- Result: failed
- Failure phase: Linux Kudu rsync from `/tmp/zipdeploy/extracted/` to `/home/site/wwwroot/`
- Key message: `Rsync failed ... failed to stat "/home/site/wwwroot/runtimes\win-x64\native\vcruntime140.dll": Invalid argument (22)`
- Additional affected paths included `DataSample\page.json`, `DataSample\html-blocks.json`, and multiple `runtimes\...` entries.

Diagnosis: the package contained ZIP entry names with backslashes. On the Linux App Service deployment path, Kudu/rsync treated those as invalid target paths.

## Corrected Deployment

H deployment id:

`09a22446-d448-4cea-b77f-fb7dc256af9b`

Log summary:

- `Clean deploying to /home/site/wwwroot`
- `Build completed succesfully.`
- `Triggering container recycle for OneDeploy by adding/updating restartTrigger.txt to the site root path`
- `Deployment successful. deployer = OneDeploy deploymentPath = OneDeploy`

Azure deployment status:

- `RuntimeSuccessful`
- Successful instances: `1`
- Failed instances: `0`
