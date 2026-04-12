using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Reminders.Domain.Errors;

public static class RemindersErrors
{
    public static readonly Error ReminderNotFound =
        new("Reminders.NotFound", "Reminder not found.", ErrorType.NotFound);

    public static readonly Error ReminderAccessDenied =
        new("Reminders.AccessDenied", "You do not have access to this reminder.", ErrorType.Forbidden);
}
