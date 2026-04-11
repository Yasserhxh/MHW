using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Identity.Domain.Errors;

public static class IdentityErrors
{
    public static readonly Error InvalidCredentials =
        Error.Unauthorized("Auth.InvalidCredentials", "Invalid email or password.");

    public static readonly Error EmailAlreadyExists =
        Error.Conflict("Auth.EmailExists", "An account with this email already exists.");

    public static readonly Error EmailNotVerified =
        Error.Unauthorized("Auth.EmailNotVerified", "Email address is not verified.");

    public static readonly Error AccountDisabled =
        Error.Unauthorized("Auth.AccountDisabled", "Account has been disabled.");

    public static readonly Error InvalidToken =
        Error.Unauthorized("Auth.InvalidToken", "The token is invalid or has expired.");

    public static readonly Error TokenAlreadyUsed =
        Error.Unauthorized("Auth.TokenUsed", "This token has already been used.");

    public static readonly Error RefreshTokenInvalid =
        Error.Unauthorized("Auth.RefreshInvalid", "Refresh token is invalid or expired.");

    public static readonly Error RefreshTokenFamilyCompromised =
        Error.Unauthorized("Auth.TokenCompromised", "Session integrity violation detected. Please log in again.");
}
