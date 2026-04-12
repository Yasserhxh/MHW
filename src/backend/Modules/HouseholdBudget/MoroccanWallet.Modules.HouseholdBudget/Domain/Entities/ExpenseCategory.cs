using MoroccanWallet.Shared.Kernel.Primitives;

namespace MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;

public sealed class ExpenseCategory : AggregateRoot
{
    private ExpenseCategory() { }

    public Guid UserId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Color { get; private set; } = "#6366f1";
    public string Icon { get; private set; } = "tag";
    public bool IsDefault { get; private set; }

    public static ExpenseCategory Create(Guid userId, string name, string color, string icon)
    {
        return new ExpenseCategory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name.Trim(),
            Color = color,
            Icon = icon,
            IsDefault = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static ExpenseCategory CreateDefault(Guid userId, string name, string color, string icon)
    {
        var category = Create(userId, name, color, icon);
        category.IsDefault = true;
        return category;
    }

    public void Update(string name, string color, string icon)
    {
        Name = name.Trim();
        Color = color;
        Icon = icon;
        Touch();
    }
}
