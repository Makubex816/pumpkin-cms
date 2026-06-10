export const cosmosSeedContractVersion = '0.1.0';
export const cosmosSeedPartitionKeyPath = '/tenantKey';

export const approvedCosmosContainers = Object.freeze([
  Object.freeze({ name: 'tenants', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['tenant']) }),
  Object.freeze({ name: 'sites', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['site']) }),
  Object.freeze({ name: 'pages', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['page']) }),
  Object.freeze({ name: 'routes', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['route']) }),
  Object.freeze({ name: 'forms', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['form']) }),
  Object.freeze({ name: 'mediaAssets', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['mediaAsset']) }),
  Object.freeze({ name: 'themes', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['theme']) }),
  Object.freeze({ name: 'publishRuns', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['publishRun']) }),
  Object.freeze({ name: 'importRuns', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['importRun']) }),
  Object.freeze({ name: 'users', partitionKeyPath: cosmosSeedPartitionKeyPath, documentTypes: Object.freeze(['user']) })
]);

const containerNames = new Set(approvedCosmosContainers.map((container) => container.name));
const documentTypeToContainer = new Map(
  approvedCosmosContainers.flatMap((container) =>
    container.documentTypes.map((documentType) => [documentType, container.name])
  )
);

export function listApprovedCosmosContainerNames() {
  return approvedCosmosContainers.map((container) => container.name);
}

export function routeDocumentTypeToContainer(documentType) {
  const containerName = documentTypeToContainer.get(documentType);
  if (!containerName) {
    throw new Error(`unsupported Cosmos seed document type: ${documentType}`);
  }
  return containerName;
}

export function isApprovedCosmosContainer(containerName) {
  return containerNames.has(containerName);
}

export function assertApprovedCosmosContainer(containerName) {
  if (!isApprovedCosmosContainer(containerName)) {
    throw new Error(`unapproved Cosmos seed container: ${containerName}`);
  }
}

export function getContainerDefinition(containerName) {
  const definition = approvedCosmosContainers.find((container) => container.name === containerName);
  if (!definition) {
    throw new Error(`unknown Cosmos seed container: ${containerName}`);
  }
  return definition;
}
