using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence;
using MoroccanWallet.Modules.HouseholdBudget.Infrastructure.Persistence;
using MoroccanWallet.Modules.Identity.Infrastructure.Persistence;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;
using MoroccanWallet.Modules.Reminders.Infrastructure.Persistence;
using MoroccanWallet.Modules.SharedExpenses.Infrastructure.Persistence;
using MoroccanWallet.Modules.Users.Infrastructure.Persistence;
using MoroccanWallet.Shared.Infrastructure.Email;

namespace MoroccanWallet.Tests.Integration;

public sealed class AuthIntegrationFactory : WebApplicationFactory<Program>
{
    private static readonly ServiceProvider InMemoryEfProvider = new ServiceCollection()
        .AddEntityFrameworkInMemoryDatabase()
        .BuildServiceProvider();
    private readonly string _databaseName = $"identity-tests-{Guid.NewGuid():N}";
    private readonly string _usersDatabaseName = $"users-tests-{Guid.NewGuid():N}";
    private readonly string _budgetDatabaseName = $"budget-tests-{Guid.NewGuid():N}";
    private readonly string _remindersDatabaseName = $"reminders-tests-{Guid.NewGuid():N}";
    private readonly string _notificationsDatabaseName = $"notifications-tests-{Guid.NewGuid():N}";
    private readonly string _sharedExpensesDatabaseName = $"shared-tests-{Guid.NewGuid():N}";
    private readonly string _groceryPricesDatabaseName = $"grocery-tests-{Guid.NewGuid():N}";

    public FakeEmailSender EmailSender { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:SecretKey"] = "integration-test-secret-key-with-32-characters!",
                ["Jwt:Issuer"] = "integration-tests",
                ["Jwt:Audience"] = "integration-clients",
                ["ConnectionStrings:Default"] = "Host=localhost;Port=5432;Database=ignored;Username=postgres;Password=ignored"
            });
        });

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IHostedService>();
            services.AddHostedService<NoOpHostedService>();

            services.RemoveAll<DbContextOptions<IdentityDbContext>>();
            services.RemoveAll<IdentityDbContext>();
            services.AddDbContext<IdentityDbContext>(options =>
            {
                options.UseInternalServiceProvider(InMemoryEfProvider);
                options.UseInMemoryDatabase(_databaseName);
            });

            ReplaceDbContext<UsersDbContext>(services, _usersDatabaseName);
            ReplaceDbContext<HouseholdBudgetDbContext>(services, _budgetDatabaseName);
            ReplaceDbContext<RemindersDbContext>(services, _remindersDatabaseName);
            ReplaceDbContext<NotificationsDbContext>(services, _notificationsDatabaseName);
            ReplaceDbContext<SharedExpensesDbContext>(services, _sharedExpensesDatabaseName);
            ReplaceDbContext<GroceryPricesDbContext>(services, _groceryPricesDatabaseName);

            services.RemoveAll<IEmailSender>();
            services.AddSingleton(EmailSender);
            services.AddSingleton<IEmailSender>(EmailSender);
        });
    }

    public async Task MutateIdentityDbAsync(Func<IdentityDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    public async Task MutateUsersDbAsync(Func<UsersDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<UsersDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    public async Task MutateBudgetDbAsync(Func<HouseholdBudgetDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<HouseholdBudgetDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    public async Task MutateRemindersDbAsync(Func<RemindersDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<RemindersDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    public async Task MutateNotificationsDbAsync(Func<NotificationsDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NotificationsDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    public async Task MutateSharedExpensesDbAsync(Func<SharedExpensesDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SharedExpensesDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    public async Task MutateGroceryPricesDbAsync(Func<GroceryPricesDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<GroceryPricesDbContext>();
        await action(db);
        await db.SaveChangesAsync();
    }

    private static void ReplaceDbContext<TContext>(IServiceCollection services, string databaseName)
        where TContext : DbContext
    {
        services.RemoveAll<DbContextOptions<TContext>>();
        services.RemoveAll<TContext>();
        services.AddDbContext<TContext>(options =>
        {
            options.UseInternalServiceProvider(InMemoryEfProvider);
            options.UseInMemoryDatabase(databaseName);
        });
    }

    private sealed class NoOpHostedService : IHostedService
    {
        public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;
        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}

public sealed class FakeEmailSender : IEmailSender
{
    private readonly List<EmailMessage> _messages = [];

    public IReadOnlyList<EmailMessage> Messages => _messages;

    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        _messages.Add(message);
        return Task.CompletedTask;
    }

    public string GetLatestToken(string prefix)
    {
        var matchingMessage = _messages.LastOrDefault(message =>
        {
            var body = message.PlainTextBody ?? message.HtmlBody;
            return body?.Contains(prefix, StringComparison.Ordinal) == true;
        });

        if (matchingMessage is null)
        {
            throw new InvalidOperationException($"No captured email body contained the prefix '{prefix}'.");
        }

        var body = matchingMessage.PlainTextBody ?? matchingMessage.HtmlBody!;
        var index = body.LastIndexOf(prefix, StringComparison.Ordinal);
        return body[(index + prefix.Length)..].Trim();
    }
}
