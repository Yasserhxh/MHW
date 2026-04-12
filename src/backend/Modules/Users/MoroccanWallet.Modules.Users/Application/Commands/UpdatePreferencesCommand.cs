using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MoroccanWallet.Modules.Users.Domain.Entities;
using MoroccanWallet.Modules.Users.Infrastructure.Persistence;
using MoroccanWallet.Shared.Kernel.Application;
using MoroccanWallet.Shared.Kernel.Errors;

namespace MoroccanWallet.Modules.Users.Application.Commands;

public sealed record UpdatePreferencesCommand(
    Guid UserId,
    string Locale,
    string PreferredCurrency,
    string Timezone,
    decimal? MonthlyBudgetPreference,
    int? SalaryDay,
    string HouseholdMode) : ICommand<UserPreferencesUpdatedResponse>;

public sealed record UserPreferencesUpdatedResponse(Guid UserId);

public sealed class UpdatePreferencesCommandValidator : AbstractValidator<UpdatePreferencesCommand>
{
    private static readonly HashSet<string> SupportedCurrencies = ["MAD", "EUR", "USD", "GBP"];
    private static readonly HashSet<string> SupportedHouseholdModes = ["just-me", "family", "roommates"];

    public UpdatePreferencesCommandValidator()
    {
        RuleFor(x => x.Locale).NotEmpty().MaximumLength(20);
        RuleFor(x => x.PreferredCurrency)
            .NotEmpty()
            .Must(c => SupportedCurrencies.Contains(c))
            .WithMessage("Currency must be one of: MAD, EUR, USD, GBP.");
        RuleFor(x => x.Timezone).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MonthlyBudgetPreference)
            .GreaterThan(0)
            .When(x => x.MonthlyBudgetPreference.HasValue);
        RuleFor(x => x.SalaryDay)
            .InclusiveBetween(1, 31)
            .When(x => x.SalaryDay.HasValue);
        RuleFor(x => x.HouseholdMode)
            .Must(mode => SupportedHouseholdModes.Contains(mode))
            .WithMessage("Household mode must be one of: just-me, family, roommates.");
    }
}

public sealed class UpdatePreferencesCommandHandler(UsersDbContext db)
    : ICommandHandler<UpdatePreferencesCommand, UserPreferencesUpdatedResponse>
{
    public async Task<Result<UserPreferencesUpdatedResponse>> Handle(
        UpdatePreferencesCommand request,
        CancellationToken cancellationToken)
    {
        var profile = await db.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, cancellationToken);

        if (profile is null)
        {
            profile = UserProfile.Create(request.UserId, "My Profile");
            db.UserProfiles.Add(profile);
        }

        profile.UpdatePreferences(
            request.Locale,
            request.PreferredCurrency,
            request.Timezone,
            request.MonthlyBudgetPreference,
            request.SalaryDay,
            request.HouseholdMode);

        await db.SaveChangesAsync(cancellationToken);
        return new UserPreferencesUpdatedResponse(profile.UserId);
    }
}
