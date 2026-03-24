using backend.DatabaseContext;
using backend.Logic;
using Microsoft.AspNetCore.Authorization;

namespace backend.Authorization;

public sealed class NotBlockedAuthorizationHandler : AuthorizationHandler<NotBlockedRequirement>
{
    private readonly DatabaseManager _databaseManager;
    private readonly JwtHelper _jwtHelper;

    public NotBlockedAuthorizationHandler(DatabaseManager databaseManager, JwtHelper jwtHelper)
    {
        _databaseManager = databaseManager;
        _jwtHelper = jwtHelper;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        NotBlockedRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
            return;

        var email = _jwtHelper.GetEmail(context.User);
        if (string.IsNullOrEmpty(email))
        {
            context.Fail();
            return;
        }

        if (await _databaseManager.IsUserBlocked(email))
        {
            context.Fail();
            return;
        }

        context.Succeed(requirement);
    }
}
