using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Users.Domain.Entities;
using MoroccanWallet.Modules.Users.Domain.Errors;
using MoroccanWallet.Modules.Users.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Users.Application.Commands;

public sealed record UpdateProfileCommand(
    Guid UserId,
    string DisplayName,
    string? AvatarUrl,
    string PreferredCurrency,
    string Language,
    string Timezone) : ICommand<UserProfileUpdatedResponse>;

public sealed record UserProfileUpdatedResponse(Guid UserId, string DisplayName);

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];
    private static readonly HashSet<string> SupportedLanguages = ["fr", "ar", "en"];

    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AvatarUrl).MaximumLength(2048).When(x => x.AvatarUrl is not null);
        RuleFor(x => x.PreferredCurrency).NotEmpty().Must(c => SupportedCurrencies.Contains(c))
            .WithMessage("Currency must be one of: MAD, EUR, USD, GBP.");
        RuleFor(x => x.Language).NotEmpty().Must(l => SupportedLanguages.Contains(l))
            .WithMessage("Language must be one of: fr, ar, en.");
        RuleFor(x => x.Timezone).NotEmpty().MaximumLength(100);
    }
}

public sealed class UpdateProfileCommandHandler(UsersDbContext db)
    : ICommandHandler<UpdateProfileCommand, UserProfileUpdatedResponse>
{
    public async Task<Result<UserProfileUpdatedResponse>> Handle(
        UpdateProfileCommand request,
        CancellationToken cancellationToken)
    {
        var profile = await db.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, cancellationToken);

        if (profile is null)
        {
            // Create profile on first update (lazy creation)
            profile = UserProfile.Create(request.UserId, request.DisplayName);
            db.UserProfiles.Add(profile);
        }

        profile.Update(
            request.DisplayName,
            request.AvatarUrl,
            request.PreferredCurrency,
            request.Language,
            request.Timezone);

        await db.SaveChangesAsync(cancellationToken);

        return new UserProfileUpdatedResponse(profile.UserId, profile.DisplayName);
    }
}
