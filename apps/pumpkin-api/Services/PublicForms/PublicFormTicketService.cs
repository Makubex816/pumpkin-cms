using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace pumpkin_api.Services.PublicForms;

public sealed class PublicFormTicketService
{
    private readonly PublicFormOptions _options;
    private readonly TimeProvider _timeProvider;
    private readonly JwtSecurityTokenHandler _handler = new() { MapInboundClaims = false };

    public PublicFormTicketService(IOptions<PublicFormOptions> options, TimeProvider timeProvider)
    {
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public bool IsConfigured => TryGetSigningKey(out _);

    public PublicFormIssuedTicket Issue(PublicFormTicketClaims ticketClaims, int requestedTtlSeconds)
    {
        if (!TryGetSigningKey(out var key))
            throw new InvalidOperationException("public_form_ticket_key_unavailable");

        var now = _timeProvider.GetUtcNow();
        var expires = now.AddSeconds(_options.BoundTicketTtl(requestedTtlSeconds));
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new Claim("pub", ticketClaims.PublicationId),
            new Claim("tuid", ticketClaims.TenantUid),
            new Claim("map", ticketClaims.FormMappingId),
            new Claim("def", ticketClaims.FormDefinitionId),
            new Claim("fcv", ticketClaims.FieldContractVersion),
            new Claim("rel", ticketClaims.ReleaseId),
            new Claim("org", ticketClaims.Origin),
            new Claim("sid", ticketClaims.SubmissionId),
            new Claim("cid", ticketClaims.CorrelationId),
            new Claim("idi", ticketClaims.IdempotencyIdentity)
        };
        var token = new JwtSecurityToken(
            issuer: _options.TicketIssuer,
            audience: _options.TicketAudience,
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expires.UtcDateTime,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        token.Header[JwtHeaderParameterNames.Kid] = _options.TicketKeyId;
        return new PublicFormIssuedTicket(_handler.WriteToken(token), expires);
    }

    public PublicFormTicketValidationResult Validate(string? token)
    {
        if (!TryGetSigningKey(out var key))
            return new(PublicFormTicketValidationStatus.ConfigurationUnavailable);
        if (string.IsNullOrWhiteSpace(token) || token.Length > 8192 || !_handler.CanReadToken(token))
            return new(PublicFormTicketValidationStatus.Invalid);

        try
        {
            var now = _timeProvider.GetUtcNow().UtcDateTime;
            // The untrusted expiration is used only to classify a denial. Signature,
            // issuer, audience, algorithm, key id, and lifetime are still validated below.
            var readable = _handler.ReadJwtToken(token);
            if (readable.ValidTo != DateTime.MinValue && readable.ValidTo < now.AddSeconds(-15))
                return new(PublicFormTicketValidationStatus.Expired);
            var parameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _options.TicketIssuer,
                ValidateAudience = true,
                ValidAudience = _options.TicketAudience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                RequireSignedTokens = true,
                RequireExpirationTime = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(15),
                ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },
                LifetimeValidator = (notBefore, expires, _, _) =>
                    expires.HasValue &&
                    expires.Value >= now.AddSeconds(-15) &&
                    (!notBefore.HasValue || notBefore.Value <= now.AddSeconds(15))
            };
            var principal = _handler.ValidateToken(token, parameters, out var validatedToken);
            if (validatedToken is not JwtSecurityToken jwt ||
                !string.Equals(jwt.Header.Alg, SecurityAlgorithms.HmacSha256, StringComparison.Ordinal) ||
                !string.Equals(jwt.Header.Kid, _options.TicketKeyId, StringComparison.Ordinal))
                return new(PublicFormTicketValidationStatus.Invalid);

            string Read(string name) => principal.FindFirst(name)?.Value ?? string.Empty;
            var claims = new PublicFormTicketClaims(
                Read("pub"), Read("tuid"), Read("map"), Read("def"), Read("fcv"), Read("rel"), Read("org"),
                Read("sid"), Read("cid"), Read("idi"));
            if (new[]
                {
                    claims.PublicationId, claims.TenantUid, claims.FormMappingId, claims.FormDefinitionId, claims.FieldContractVersion,
                    claims.ReleaseId, claims.Origin, claims.SubmissionId, claims.CorrelationId,
                    claims.IdempotencyIdentity
                }.Any(string.IsNullOrWhiteSpace))
                return new(PublicFormTicketValidationStatus.Invalid);
            return new(PublicFormTicketValidationStatus.Valid, claims);
        }
        catch (SecurityTokenExpiredException)
        {
            return new(PublicFormTicketValidationStatus.Expired);
        }
        catch (SecurityTokenException)
        {
            return new(PublicFormTicketValidationStatus.Invalid);
        }
        catch (ArgumentException)
        {
            return new(PublicFormTicketValidationStatus.Invalid);
        }
    }

    private bool TryGetSigningKey(out SymmetricSecurityKey key)
    {
        key = null!;
        if (string.IsNullOrWhiteSpace(_options.TicketSigningKeyBase64) ||
            string.IsNullOrWhiteSpace(_options.TicketKeyId))
            return false;
        try
        {
            var bytes = Convert.FromBase64String(_options.TicketSigningKeyBase64);
            if (bytes.Length < 32)
                return false;
            key = new SymmetricSecurityKey(bytes) { KeyId = _options.TicketKeyId };
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
