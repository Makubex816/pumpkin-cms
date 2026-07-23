using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Reflection;
using Microsoft.Extensions.Options;
using pumpkin_api.Services;
using pumpkin_api.Services.PublicForms;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class PublicFormPublicationTestRunner
{
    public static async Task RunAsync()
    {
        var tests = new (string Name, Func<Task> Run)[]
        {
            ("exact origin enforcement", TestOriginsAsync),
            ("ticket tamper and expiry", TestTicketsAsync),
            ("strict payload consent honeypot and canonical digest", TestCanonicalizationAsync),
            ("provider-neutral atomic concurrency and conflicts", TestConcurrencyAsync),
            ("submission service authority and non-disclosure gates", TestSubmissionServiceAsync),
            ("Cosmos and Mongo provider source contracts", TestProviderSourcesAsync),
            ("request DTOs reject unmapped fields", TestUnmappedFieldsAsync)
        };
        foreach (var test in tests)
        {
            await test.Run();
            Console.WriteLine($"PASS {test.Name}");
        }
        Console.WriteLine($"PASS pub-20-a02 public form foundation ({tests.Length} groups)");
    }

    private static Task TestOriginsAsync()
    {
        Assert(PublicOriginPolicy.TryReadExactOrigin(new[] { "https://Example.COM:443" }, false, out var origin), "valid HTTPS origin");
        Assert(origin == "https://example.com", "origin canonicalized");
        Assert(!PublicOriginPolicy.TryReadExactOrigin(Array.Empty<string>(), false, out _), "missing denied");
        Assert(!PublicOriginPolicy.TryReadExactOrigin(new[] { "null" }, false, out _), "null denied");
        Assert(!PublicOriginPolicy.TryReadExactOrigin(new[] { "https://example.com", "https://evil.test" }, false, out _), "multiple denied");
        Assert(!PublicOriginPolicy.TryReadExactOrigin(new[] { "https://example.com, https://evil.test" }, false, out _), "combined denied");
        Assert(!PublicOriginPolicy.TryCanonicalize("https://example.com/path", false, out _), "path denied");
        Assert(!PublicOriginPolicy.TryCanonicalize("https://sub.example.com", false, out var sub) || sub != "https://example.com", "subdomain never suffix-matches");
        Assert(!PublicOriginPolicy.TryCanonicalize("http://example.com", false, out _), "HTTP denied");
        Assert(PublicPublicationService.IsBoundedIdentifier("publication_synth_static_0002"), "publisher publication ID grammar accepted");
        Assert(PublicPublicationService.IsBoundedIdentifier("mapping_orchard_request_0002"), "publisher mapping ID grammar accepted");
        return Task.CompletedTask;
    }

    private static Task TestTicketsAsync()
    {
        var time = new MutableTimeProvider(new DateTimeOffset(2026, 7, 22, 12, 0, 0, TimeSpan.Zero));
        var options = Options.Create(TestOptions());
        var tickets = new PublicFormTicketService(options, time);
        var claims = new PublicFormTicketClaims(
            "pub-test", "tenant-uid-test", "contact-form", "definition-1", "v1", "release-1",
            "https://example.com", Guid.NewGuid().ToString("D"), Guid.NewGuid().ToString("D"), new string('a', 64));
        var issued = tickets.Issue(claims, 60);
        var valid = tickets.Validate(issued.Token);
        Assert(valid.Status == PublicFormTicketValidationStatus.Valid, "issued ticket validates");
        Assert(valid.Claims?.TenantUid == "tenant-uid-test", "ticket binds tenant UID");
        var last = issued.Token[^1] == 'a' ? 'b' : 'a';
        var tampered = issued.Token[..^1] + last;
        Assert(tickets.Validate(tampered).Status != PublicFormTicketValidationStatus.Valid, "tampered ticket denied");
        time.Advance(TimeSpan.FromSeconds(76));
        Assert(tickets.Validate(issued.Token).Status != PublicFormTicketValidationStatus.Valid, "expired ticket denied");
        return Task.CompletedTask;
    }

    private static Task TestCanonicalizationAsync()
    {
        var canonicalizer = new PublicFormCanonicalizer(Options.Create(TestOptions()));
        var fixture = Fixture();
        var submissionId = Guid.NewGuid().ToString("D");
        var first = canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition,
            Request(submissionId, Guid.NewGuid().ToString("D"), "hello", consent: true));
        Assert(first.Valid, "valid public payload accepted");
        var firstPrepared = first.Prepared!;
        Assert(PublicFormPersistenceContract.IsValidCandidate(firstPrepared.Entry), "candidate invariants hold");

        var freshCorrelation = canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition,
            Request(submissionId, Guid.NewGuid().ToString("D"), "hello", consent: true));
        Assert(freshCorrelation.Valid, "fresh correlation accepted");
        Assert(firstPrepared.PayloadDigest == freshCorrelation.Prepared!.PayloadDigest, "correlation excluded from payload digest");
        Assert(firstPrepared.Entry.Id == freshCorrelation.Prepared.Entry.Id, "canonical submission storage ID stable");

        var changed = canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition,
            Request(submissionId, Guid.NewGuid().ToString("D"), "changed", consent: true));
        Assert(changed.Valid && changed.Prepared!.PayloadDigest != firstPrepared.PayloadDigest, "payload change changes digest");
        var changedPrepared = changed.Prepared!;
        Assert(PublicFormPersistenceContract.ResolveDuplicate(firstPrepared.Entry, changedPrepared.Entry).Status == PublicFormEntryCreateStatus.Conflict,
            "same identity changed payload conflicts");

        var missingConsent = canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition,
            Request(Guid.NewGuid().ToString("D"), Guid.NewGuid().ToString("D"), "hello", consent: false));
        Assert(!missingConsent.Valid, "false consent denied");
        var honeypot = Request(Guid.NewGuid().ToString("D"), Guid.NewGuid().ToString("D"), "hello", consent: true);
        honeypot.FormData["website"] = Json("robot");
        Assert(!canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition, honeypot).Valid, "honeypot denied without write");
        var nested = Request(Guid.NewGuid().ToString("D"), Guid.NewGuid().ToString("D"), "hello", consent: true);
        nested.FormData["message"] = JsonElement("{\"nested\":true}");
        Assert(!canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition, nested).Valid, "nested values denied");
        var staleContract = Request(Guid.NewGuid().ToString("D"), Guid.NewGuid().ToString("D"), "hello", consent: true);
        staleContract.FieldContractVersion = "stale";
        Assert(!canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition, staleContract).Valid, "stale field contract denied");
        return Task.CompletedTask;
    }

    private static async Task TestConcurrencyAsync()
    {
        var canonicalizer = new PublicFormCanonicalizer(Options.Create(TestOptions()));
        var fixture = Fixture();
        var submissionId = Guid.NewGuid().ToString("D");
        var prepared = canonicalizer.Prepare(fixture.Publication, fixture.Mapping, fixture.Definition,
            Request(submissionId, Guid.NewGuid().ToString("D"), "hello", consent: true)).Prepared!;
        var store = new ConcurrentDictionary<string, FormEntry>(StringComparer.Ordinal);
        PublicFormEntryCreateResult Insert(FormEntry entry)
        {
            if (store.TryAdd(entry.Id, entry)) return new(PublicFormEntryCreateStatus.Created, entry);
            return PublicFormPersistenceContract.ResolveDuplicate(store[entry.Id], entry);
        }

        var outcomes = await Task.WhenAll(Enumerable.Range(0, 100)
            .Select(_ => Task.Run(() => Insert(prepared.Entry))));
        Assert(outcomes.Count(result => result.Status == PublicFormEntryCreateStatus.Created) == 1, "exactly one create");
        Assert(outcomes.Count(result => result.Status == PublicFormEntryCreateStatus.Replay) == 99, "remaining concurrent attempts replay");

        var otherMapping = new PublicPublicationFormMapping
        {
            FormMappingId = "other-form",
            FormDefinitionId = fixture.Mapping.FormDefinitionId,
            FormKey = fixture.Mapping.FormKey,
            FieldContractVersion = fixture.Mapping.FieldContractVersion,
            SiteKey = fixture.Mapping.SiteKey,
            PageSlug = fixture.Mapping.PageSlug,
            Active = true,
            SubmitMode = "public-ticket"
        };
        var other = canonicalizer.Prepare(fixture.Publication, otherMapping, fixture.Definition,
            Request(submissionId, Guid.NewGuid().ToString("D"), "hello", consent: true)).Prepared!;
        Assert(other.Entry.Id == prepared.Entry.Id, "submission ID is unique across mappings in tenant");
        Assert(Insert(other.Entry).Status == PublicFormEntryCreateStatus.Conflict, "same submission across mappings conflicts");

        var otherTenantPublication = ClonePublication(fixture.Publication);
        otherTenantPublication.TenantId = "tenant-b";
        otherTenantPublication.TenantUid = "tenant-uid-b";
        var otherTenant = canonicalizer.Prepare(otherTenantPublication, fixture.Mapping, fixture.Definition,
            Request(submissionId, Guid.NewGuid().ToString("D"), "hello", consent: true)).Prepared!;
        Assert(otherTenant.Entry.Id != prepared.Entry.Id, "tenant UID scopes storage identity");
    }

    private static Task TestUnmappedFieldsAsync()
    {
        AssertThrows<JsonException>(() => JsonSerializer.Deserialize<PublicFormPreflightRequest>(
            "{\"clientIdempotencySeed\":\"00000000-0000-0000-0000-000000000001\",\"email\":\"blocked@example.test\"}"));
        AssertThrows<JsonException>(() => JsonSerializer.Deserialize<PublicFormSubmissionRequest>(
            "{\"submissionId\":\"00000000-0000-0000-0000-000000000001\",\"correlationId\":\"00000000-0000-0000-0000-000000000002\",\"formData\":{},\"tenantId\":\"attacker\"}"));
        return Task.CompletedTask;
    }

    private static async Task TestSubmissionServiceAsync()
    {
        var fixture = Fixture();
        var database = DispatchProxy.Create<IDatabaseService, PublicFormDatabaseProxy>();
        var state = (PublicFormDatabaseProxy)(object)database;
        state.Publication = fixture.Publication;
        state.Definition = fixture.Definition;
        state.Tenant = new Tenant
        {
            Id = fixture.Publication.TenantId,
            TenantId = fixture.Publication.TenantId,
            TenantUid = fixture.Publication.TenantUid,
            Status = "active",
            Settings = new TenantSettings { Features = new Features { Forms = true } }
        };
        var time = new MutableTimeProvider(new DateTimeOffset(2026, 7, 22, 12, 0, 0, TimeSpan.Zero));
        var options = Options.Create(TestOptions());
        var tickets = new PublicFormTicketService(options, time);
        var publications = new PublicPublicationService(database, options, tickets, time);
        var service = new PublicFormSubmissionService(
            database, publications, new PublicFormCanonicalizer(options), tickets, options, time);
        var seed = Guid.NewGuid().ToString("D");

        var preflight = await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" },
            new PublicFormPreflightRequest { ClientIdempotencySeed = seed }, CancellationToken.None);
        Assert(preflight.Status == PublicFormOperationStatus.Ready && preflight.Preflight != null, "active authority preflight ready");
        Assert(state.Entries.Count == 0, "preflight performs zero writes");
        var firstRequest = Request(preflight.Preflight!.SubmissionId, preflight.Preflight.CorrelationId, "hello", true);
        var created = await service.SubmitAsync("pub-test", "contact-form", new[] { "https://example.com" },
            preflight.Preflight.Ticket, firstRequest, "127.0.0.1", "test", CancellationToken.None);
        Assert(created.Status == PublicFormOperationStatus.Created, "valid ticket creates");

        var second = await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" },
            new PublicFormPreflightRequest { ClientIdempotencySeed = seed }, CancellationToken.None);
        var replayRequest = Request(second.Preflight!.SubmissionId, second.Preflight.CorrelationId, "hello", true);
        var replay = await service.SubmitAsync("pub-test", "contact-form", new[] { "https://example.com" },
            second.Preflight.Ticket, replayRequest, "127.0.0.1", "test", CancellationToken.None);
        Assert(replay.Status == PublicFormOperationStatus.Replay, "fresh ticket same seed and payload replays");

        var third = await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" },
            new PublicFormPreflightRequest { ClientIdempotencySeed = seed }, CancellationToken.None);
        var changedRequest = Request(third.Preflight!.SubmissionId, third.Preflight.CorrelationId, "changed", true);
        var conflict = await service.SubmitAsync("pub-test", "contact-form", new[] { "https://example.com" },
            third.Preflight.Ticket, changedRequest, "127.0.0.1", "test", CancellationToken.None);
        Assert(conflict.Status == PublicFormOperationStatus.Conflict, "fresh ticket same seed changed payload conflicts");

        var wrongPath = await service.SubmitAsync("pub-test", "other-form", new[] { "https://example.com" },
            third.Preflight.Ticket, changedRequest, "127.0.0.1", "test", CancellationToken.None);
        Assert(wrongPath.Status == PublicFormOperationStatus.TicketInvalid, "ticket path mismatch denied");
        var wrongOrigin = await service.SubmitAsync("pub-test", "contact-form", new[] { "https://evil.test" },
            third.Preflight.Ticket, changedRequest, "127.0.0.1", "test", CancellationToken.None);
        Assert(wrongOrigin.Status == PublicFormOperationStatus.TicketInvalid, "ticket origin mismatch denied");

        fixture.Publication.Status = "revoked";
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "revoked publication not disclosed");
        fixture.Publication.Status = "active";
        fixture.Publication.ActiveFromUtc = time.GetUtcNow().AddMinutes(1);
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "future publication not disclosed");
        fixture.Publication.ActiveFromUtc = null;
        fixture.Publication.ActiveUntilUtc = time.GetUtcNow().AddSeconds(-1);
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "expired publication not disclosed");
        fixture.Publication.ActiveUntilUtc = null;
        fixture.Mapping.Active = false;
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "inactive mapping not disclosed");
        fixture.Mapping.Active = true;
        fixture.Mapping.SubmitMode = "private";
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "nonpublic mapping not disclosed");
        fixture.Mapping.SubmitMode = "public-ticket";
        state.Tenant.TenantUid = "wrong-tenant-uid";
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "tenant UID mismatch not disclosed");
        state.Tenant.TenantUid = fixture.Publication.TenantUid;
        state.Tenant.Settings.Features.Forms = false;
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "forms-disabled tenant not disclosed");
        state.Tenant.Settings.Features.Forms = true;
        state.Definition.Status = "inactive";
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "inactive definition not disclosed");
        state.Definition.Status = "active";
        state.Definition.TenantId = "wrong-tenant";
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "wrong-tenant definition not disclosed");
        state.Definition.TenantId = fixture.Publication.TenantId;
        state.Definition.SiteKey = "wrong-site";
        Assert((await service.PreflightAsync("pub-test", "contact-form", new[] { "https://example.com" }, new(), CancellationToken.None)).Status == PublicFormOperationStatus.PublicationUnavailable,
            "definition site mismatch not disclosed");
        Assert((await service.PreflightAsync("pub-test", "contact-form", Array.Empty<string>(), new(), CancellationToken.None)).Status == PublicFormOperationStatus.OriginNotAllowed,
            "missing origin denied before disclosure");
    }

    private static Task TestProviderSourcesAsync()
    {
        var root = FindRepositoryRoot();
        var cosmos = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var mongo = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "MongoDataConnection.cs"));
        var canonicalizer = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "PublicForms", "PublicFormCanonicalizer.cs"));
        var project = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "pumpkin-api.csproj"));
        var program = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Program.cs"));
        Assert(cosmos.Contains("CreatePublicFormEntryAsync", StringComparison.Ordinal) &&
            cosmos.Contains("container.CreateItemAsync", StringComparison.Ordinal) &&
            cosmos.Contains("container.ReadItemAsync<FormEntry>", StringComparison.Ordinal) &&
            cosmos.Contains("PublicFormPersistenceContract.ResolveDuplicate", StringComparison.Ordinal), "Cosmos create/conflict/read/compare contract present");
        Assert(canonicalizer.Contains("ComputeStorageId(publication.TenantUid, submissionId)", StringComparison.Ordinal), "tenant/submission deterministic storage ID present");
        Assert(mongo.Contains("collection.InsertOneAsync", StringComparison.Ordinal) &&
            mongo.Contains("ServerErrorCategory.DuplicateKey", StringComparison.Ordinal) &&
            mongo.Contains("ux_public_form_submission", StringComparison.Ordinal) &&
            mongo.Contains("ux_public_form_idempotency", StringComparison.Ordinal), "Mongo atomic insert and both unique indexes present");
        Assert(project.Contains("MongoDB.Driver", StringComparison.Ordinal) && project.Contains("USE_MONGODB", StringComparison.Ordinal), "real Mongo branch is compiled");
        var corsPosition = program.IndexOf("app.UseCors(\"AllowAll\")", StringComparison.Ordinal);
        var authenticationPosition = program.IndexOf("protectedBranch.UseAuthentication()", StringComparison.Ordinal);
        var limiterPosition = program.IndexOf("app.UseRateLimiter()", StringComparison.Ordinal);
        Assert(corsPosition >= 0 && authenticationPosition > corsPosition && limiterPosition > authenticationPosition,
            "CORS precedes the post-authentication limiter so public 429 CORS and identity claim partitioning are preserved");
        return Task.CompletedTask;
    }

    private static (PublicPublication Publication, PublicPublicationFormMapping Mapping, FormDefinition Definition) Fixture()
    {
        var mapping = new PublicPublicationFormMapping
        {
            FormMappingId = "contact-form",
            FormDefinitionId = "definition-1",
            FormKey = "contact",
            FieldContractVersion = "v1",
            SiteKey = "site-1",
            PageSlug = "contact",
            Active = true,
            SubmitMode = "public-ticket"
        };
        var publication = new PublicPublication
        {
            Id = "pub-test",
            PublicationId = "pub-test",
            TenantId = "tenant-a",
            TenantUid = "tenant-uid-a",
            ReleaseId = "release-1",
            ArtifactSha256 = new string('a', 64),
            Status = "active",
            IndexingState = "disabled",
            AllowedOrigins = new() { "https://example.com" },
            AllowedHostnames = new() { "example.com" },
            FormMappings = new() { mapping },
            TicketKeyId = "test-key",
            TicketTtlSeconds = 60
        };
        var definition = new FormDefinition
        {
            Id = "definition-1",
            TenantId = "tenant-a",
            SiteKey = "site-1",
            FormKey = "contact",
            Status = "active",
            Version = "v1",
            Fields = new()
            {
                new() { Id = "name", Name = "name", Required = true },
                new() { Id = "message", Name = "message", Required = true }
            },
            Consent = new() { Required = true, FieldName = "consent" },
            SpamProtection = new() { HoneypotFieldName = "website", MaxPayloadBytes = 20_000, MaxFieldLength = 4_000 }
        };
        return (publication, mapping, definition);
    }

    private static PublicFormSubmissionRequest Request(string submissionId, string correlationId, string message, bool consent) => new()
    {
        SubmissionId = submissionId,
        CorrelationId = correlationId,
        FieldContractVersion = "v1",
        FormData = new(StringComparer.Ordinal)
        {
            ["name"] = Json("Synthetic User"),
            ["message"] = Json(message),
            ["consent"] = Json(consent)
        }
    };

    private static PublicPublication ClonePublication(PublicPublication source) => new()
    {
        Id = source.Id,
        PublicationId = source.PublicationId,
        TenantId = source.TenantId,
        TenantUid = source.TenantUid,
        ReleaseId = source.ReleaseId,
        ArtifactSha256 = source.ArtifactSha256,
        Status = source.Status,
        IndexingState = source.IndexingState,
        AllowedOrigins = source.AllowedOrigins.ToList(),
        AllowedHostnames = source.AllowedHostnames.ToList(),
        FormMappings = source.FormMappings,
        TicketKeyId = source.TicketKeyId,
        TicketTtlSeconds = source.TicketTtlSeconds
    };

    private static PublicFormOptions TestOptions() => new()
    {
        TicketSigningKeyBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes("pub-20-a02-test-key-material-32-bytes-minimum")),
        TicketKeyId = "test-key",
        TicketTtlSeconds = 60,
        MinimumTicketTtlSeconds = 60,
        MaximumTicketTtlSeconds = 300
    };

    private static JsonElement Json<T>(T value) => JsonSerializer.SerializeToElement(value);
    private static JsonElement JsonElement(string json) => JsonDocument.Parse(json).RootElement.Clone();

    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException($"FAIL {message}");
    }

    private static void AssertThrows<TException>(Action action) where TException : Exception
    {
        try
        {
            action();
            throw new InvalidOperationException($"FAIL expected {typeof(TException).Name}");
        }
        catch (TException)
        {
        }
    }

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current != null)
        {
            if (Directory.Exists(Path.Combine(current.FullName, ".git")) || File.Exists(Path.Combine(current.FullName, ".git")))
                return current.FullName;
            current = current.Parent;
        }
        throw new DirectoryNotFoundException("Repository root not found.");
    }

    public class PublicFormDatabaseProxy : DispatchProxy
    {
        public PublicPublication Publication { get; set; } = null!;
        public Tenant Tenant { get; set; } = null!;
        public FormDefinition Definition { get; set; } = null!;
        public ConcurrentDictionary<string, FormEntry> Entries { get; } = new(StringComparer.Ordinal);

        protected override object? Invoke(MethodInfo? targetMethod, object?[]? args)
        {
            return targetMethod?.Name switch
            {
                nameof(IDatabaseService.GetPublicPublicationAsync) => Task.FromResult<PublicPublication?>(Publication),
                nameof(IDatabaseService.GetTenantAsync) => Task.FromResult<Tenant?>(Tenant),
                nameof(IDatabaseService.GetFormDefinitionAdminAsync) => Task.FromResult<FormDefinition?>(Definition),
                nameof(IDatabaseService.CreatePublicFormEntryAsync) => Task.FromResult(Insert((FormEntry)args![0]!)),
                _ => throw new NotSupportedException(targetMethod?.Name)
            };
        }

        private PublicFormEntryCreateResult Insert(FormEntry entry)
        {
            if (Entries.TryAdd(entry.Id, entry)) return new(PublicFormEntryCreateStatus.Created, entry);
            return PublicFormPersistenceContract.ResolveDuplicate(Entries[entry.Id], entry);
        }
    }

    private sealed class MutableTimeProvider : TimeProvider
    {
        private DateTimeOffset _utcNow;
        public MutableTimeProvider(DateTimeOffset utcNow) => _utcNow = utcNow;
        public override DateTimeOffset GetUtcNow() => _utcNow;
        public void Advance(TimeSpan value) => _utcNow = _utcNow.Add(value);
    }
}
