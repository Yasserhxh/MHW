using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Users.Domain.Errors;

public static class UsersErrors
{
    public static readonly Error ProfileNotFound =
        new("Users.ProfileNotFound", "User profile not found.", ErrorType.NotFound);

    public static readonly Error ProfileAlreadyExists =
        new("Users.ProfileAlreadyExists", "User profile already exists.", ErrorType.Conflict);
}
