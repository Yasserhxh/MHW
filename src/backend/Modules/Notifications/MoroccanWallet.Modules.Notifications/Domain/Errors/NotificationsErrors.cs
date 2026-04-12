using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Notifications.Domain.Errors;

public static class NotificationsErrors
{
    public static readonly Error NotificationNotFound =
        new("Notifications.NotFound", "Notification not found.", ErrorType.NotFound);

    public static readonly Error NotificationAccessDenied =
        new("Notifications.AccessDenied", "You do not have access to this notification.", ErrorType.Forbidden);
}
