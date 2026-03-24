using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace backend.Logic;

public class JwtHelper
{
    private readonly ILogger<JwtHelper> _logger;

    public JwtHelper(ILogger<JwtHelper> logger)
    {
        _logger = logger;
    }

    public string GetAuthorizationHeaderValue(HttpRequest req)
    {
        if (req.Headers.ContainsKey("Authorization"))
        {
            return req.Headers.Authorization.ToString();
        }

        _logger.LogError("Authorization header is missing");
        throw new ArgumentException("Authorization header is missing");
    }

    public string? GetEmail(ClaimsPrincipal user) => GetClaim(user, "email");

    public string? GetGoogleSubject(ClaimsPrincipal user) => GetClaim(user, "sub");

    public static string? GetClaim(ClaimsPrincipal user, string claimType) =>
        user.FindFirst(claimType)?.Value;
}
