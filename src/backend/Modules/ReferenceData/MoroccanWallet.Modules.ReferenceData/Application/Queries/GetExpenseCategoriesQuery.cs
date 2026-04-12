using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.ReferenceData.Application.Queries;

public sealed record GetExpenseCategoriesQuery : IQuery<IReadOnlyList<DefaultCategoryDto>>;

public sealed record DefaultCategoryDto(string Name, string Color, string Icon);

public sealed class GetExpenseCategoriesQueryHandler
    : IQueryHandler<GetExpenseCategoriesQuery, IReadOnlyList<DefaultCategoryDto>>
{
    private static readonly IReadOnlyList<DefaultCategoryDto> Categories =
    [
        new("Alimentation", "#22c55e", "shopping-cart"),
        new("Transport", "#3b82f6", "car"),
        new("Logement", "#8b5cf6", "home"),
        new("Santé", "#ef4444", "heart-pulse"),
        new("Éducation", "#f59e0b", "graduation-cap"),
        new("Loisirs", "#ec4899", "gamepad-2"),
        new("Vêtements", "#14b8a6", "shirt"),
        new("Restauration", "#f97316", "utensils"),
        new("Épargne", "#6366f1", "piggy-bank"),
        new("Factures", "#64748b", "zap"),
        new("Divers", "#9ca3af", "circle-ellipsis")
    ];

    public Task<Result<IReadOnlyList<DefaultCategoryDto>>> Handle(
        GetExpenseCategoriesQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success<IReadOnlyList<DefaultCategoryDto>>(Categories));
}
