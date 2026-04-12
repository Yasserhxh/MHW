using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Domain.Errors;

public static class GroceryPricesErrors
{
    public static readonly Error ProductNotFound =
        new("GroceryPrices.ProductNotFound", "Product not found.", ErrorType.NotFound);

    public static readonly Error PriceEntryNotFound =
        new("GroceryPrices.PriceEntryNotFound", "Price entry not found.", ErrorType.NotFound);
}
