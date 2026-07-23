using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Publications;

public interface IPublicationProductStore
{
    Task<PublicPublication?> GetAsync(string publicationId, CancellationToken cancellationToken);
    Task<IReadOnlyList<PublicPublication>> ListAsync(string? tenantUid, CancellationToken cancellationToken);
    Task<PublicPublication> UpdateAsync(
        PublicPublication publication,
        long expectedRevision,
        CancellationToken cancellationToken);
}

/// <summary>
/// Provider-neutral product registry over the existing PublicPublication
/// container/collection. Provider-specific atomicity remains in
/// CosmosDataConnection and MongoDataConnection; no new live container is
/// required.
/// </summary>
public sealed class PublicPublicationProductStore : IPublicationProductStore
{
    private readonly IDatabaseService _database;

    public PublicPublicationProductStore(IDatabaseService database)
    {
        _database = database;
    }

    public Task<PublicPublication?> GetAsync(string publicationId, CancellationToken cancellationToken) =>
        _database.GetPublicPublicationAsync(publicationId, cancellationToken);

    public async Task<IReadOnlyList<PublicPublication>> ListAsync(
        string? tenantUid,
        CancellationToken cancellationToken) =>
        await _database.ListPublicPublicationsAsync(tenantUid, cancellationToken);

    public Task<PublicPublication> UpdateAsync(
        PublicPublication publication,
        long expectedRevision,
        CancellationToken cancellationToken) =>
        _database.UpdatePublicPublicationAsync(publication, expectedRevision, cancellationToken);
}
