using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.SharedExpenses.Domain.Errors;

public static class SharedExpensesErrors
{
    public static readonly Error GroupNotFound =
        new("SharedExpenses.GroupNotFound", "Group not found.", ErrorType.NotFound);

    public static readonly Error GroupAccessDenied =
        new("SharedExpenses.GroupAccessDenied", "You are not a member of this group.", ErrorType.Forbidden);

    public static readonly Error OnlyOwnerCanManageGroup =
        new("SharedExpenses.OnlyOwnerCanManageGroup", "Only the group owner can perform this action.", ErrorType.Forbidden);

    public static readonly Error ExpenseNotFound =
        new("SharedExpenses.ExpenseNotFound", "Shared expense not found.", ErrorType.NotFound);

    public static readonly Error InvalidSplitTotal =
        new("SharedExpenses.InvalidSplitTotal", "Split amounts must equal the total expense amount.", ErrorType.Validation);

    public static readonly Error MemberNotInGroup =
        new("SharedExpenses.MemberNotInGroup", "One or more split members are not in the group.", ErrorType.Validation);
}
