using MediatR;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.ReferenceData.Application.Queries;

public sealed record GetCurrenciesQuery : IQuery<IReadOnlyList<CurrencyDto>>;

public sealed record CurrencyDto(string Code, string Name, string Symbol);

public sealed class GetCurrenciesQueryHandler : IQueryHandler<GetCurrenciesQuery, IReadOnlyList<CurrencyDto>>
{
    private static readonly IReadOnlyList<CurrencyDto> Currencies =
    [
        new("MAD", "Moroccan Dirham", "MAD"),
        new("EUR", "Euro", "€"),
        new("USD", "US Dollar", "$"),
        new("GBP", "British Pound", "£"),
        new("SAR", "Saudi Riyal", "ر.س"),
        new("AED", "UAE Dirham", "د.إ"),
        new("CAD", "Canadian Dollar", "CA$"),
        new("CHF", "Swiss Franc", "CHF")
    ];

    public Task<Result<IReadOnlyList<CurrencyDto>>> Handle(
        GetCurrenciesQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success<IReadOnlyList<CurrencyDto>>(Currencies));
}
