using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.HouseholdBudget.Domain.Errors;

public static class HouseholdBudgetErrors
{
    public static readonly Error ExpenseNotFound =
        new("Budget.ExpenseNotFound", "Expense not found.", ErrorType.NotFound);

    public static readonly Error CategoryNotFound =
        new("Budget.CategoryNotFound", "Expense category not found.", ErrorType.NotFound);

    public static readonly Error DefaultCategoryCannotBeDeleted =
        new("Budget.DefaultCategoryCannotBeDeleted", "Default categories cannot be deleted.", ErrorType.Forbidden);

    public static readonly Error ExpenseAccessDenied =
        new("Budget.ExpenseAccessDenied", "You do not have access to this expense.", ErrorType.Forbidden);

    public static readonly Error CategoryAccessDenied =
        new("Budget.CategoryAccessDenied", "You do not have access to this category.", ErrorType.Forbidden);
}
