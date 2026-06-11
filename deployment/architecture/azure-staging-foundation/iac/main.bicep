targetScope = 'resourceGroup'

@description('Azure region for the non-production staging foundation.')
param location string = 'eastus'

@description('Short environment code. Do not use production values.')
@allowed([
  'stg'
  'stage'
  'sandbox'
])
param environmentCode string = 'stg'

@description('Platform name used for tags and derived resource names.')
@minLength(3)
param platformName string = 'pumpkincms'

@description('Short suffix used to keep globally unique resource names out of production namespaces.')
@minLength(3)
param resourceNameSuffix string = 'olm01'

@description('Globally unique lowercase staging evidence storage account name. No production names.')
@minLength(3)
@maxLength(24)
param evidenceStorageAccountName string = 'pumpkincmsstgolm01'

@description('Non-secret deployment tags.')
param tags object = {
  project: 'PumpkinCMS'
  environment: 'staging'
  lane: 'OutboundLinkManager'
  liveWriteScope: 'staging-only'
  createdByPhase: 'future-approved-azure-creation-phase'
}

var normalizedSuffix = toLower(resourceNameSuffix)
var cosmosAccountName = 'cosmos-${platformName}-${environmentCode}-${normalizedSuffix}'
var databaseName = '${platformName}-olm-staging'
var storageAccountName = toLower(evidenceStorageAccountName)
var keyVaultName = take('kv-${platformName}-${environmentCode}-${normalizedSuffix}', 24)
var managedIdentityName = 'id-${platformName}-olm-${environmentCode}'
var logAnalyticsWorkspaceName = 'log-${platformName}-${environmentCode}-${normalizedSuffix}'
var appInsightsName = 'appi-${platformName}-${environmentCode}-${normalizedSuffix}'

var containers = [
  'outbound-links'
  'outbound-link-instances'
  'outbound-link-policies'
  'outbound-link-scan-runs'
  'outbound-link-audit-logs'
  'outbound-link-render-decisions'
  'outbound-link-review-decisions'
  'outbound-link-bulk-actions'
  'outbound-link-rollback-plans'
  'outbound-link-trace-logs'
]

var evidenceContainerNames = [
  'backup-center-staging'
  'resource-registry-staging'
  'runtime-qa-staging'
]

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosAccountName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: true
  }
}

resource olmDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: databaseName
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource olmContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [for containerName in containers: {
  parent: olmDatabase
  name: containerName
  properties: {
    resource: {
      id: containerName
      partitionKey: {
        paths: [
          '/tenantKey'
        ]
        kind: 'Hash'
      }
    }
  }
}]

resource evidenceStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: evidenceStorage
  name: 'default'
}

resource evidenceContainers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = [for containerName in evidenceContainerNames: {
  parent: blobService
  name: containerName
  properties: {
    publicAccess: 'None'
  }
}]

resource stagingKeyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    tenantId: tenant().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 30
  }
}

resource stagingIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: managedIdentityName
  location: location
  tags: tags
}

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

output stagingResourceGroupName string = resourceGroup().name
output stagingResourceGroupId string = resourceGroup().id
output cosmosAccountName string = cosmosAccount.name
output cosmosEndpoint string = cosmosAccount.properties.documentEndpoint
output cosmosDatabaseName string = olmDatabase.name
output cosmosContainerNames array = containers
output cosmosPartitionKey string = '/tenantKey'
output evidenceStorageAccountName string = evidenceStorage.name
output evidenceContainerNames array = evidenceContainerNames
output keyVaultName string = stagingKeyVault.name
output managedIdentityName string = stagingIdentity.name
output logAnalyticsWorkspaceName string = logAnalytics.name
output applicationInsightsName string = appInsights.name
