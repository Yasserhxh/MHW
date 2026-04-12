using FluentValidation;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.GroceryPrices.Application.Commands;

public sealed record CreateProductCommand(
    Guid UserId,
    string Name,
    string? Category,
    string? Unit,
    string? Barcode) : ICommand<ProductCreatedResponse>;

public sealed record ProductCreatedResponse(Guid Id, string Name);

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Category).MaximumLength(100).When(x => x.Category is not null);
        RuleFor(x => x.Unit).MaximumLength(50).When(x => x.Unit is not null);
        RuleFor(x => x.Barcode).MaximumLength(50).When(x => x.Barcode is not null);
    }
}

public sealed class CreateProductCommandHandler(GroceryPricesDbContext db)
    : ICommandHandler<CreateProductCommand, ProductCreatedResponse>
{
    public async Task<Result<ProductCreatedResponse>> Handle(
        CreateProductCommand request,
        CancellationToken cancellationToken)
    {
        var product = Product.Create(
            request.UserId,
            request.Name,
            request.Category,
            request.Unit,
            request.Barcode);

        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);

        return new ProductCreatedResponse(product.Id, product.Name);
    }
}
