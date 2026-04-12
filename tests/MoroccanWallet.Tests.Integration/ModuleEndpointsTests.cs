using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using MoroccanWallet.Modules.GroceryPrices.Domain.Entities;
using MoroccanWallet.Modules.HouseholdBudget.Domain.Entities;
using MoroccanWallet.Modules.Notifications.Domain.Entities;
using MoroccanWallet.Modules.Reminders.Domain.Entities;
using MoroccanWallet.Modules.SharedExpenses.Domain.Entities;

namespace MoroccanWallet.Tests.Integration;

public sealed class ModuleEndpointsTests
{
    [Fact]
    public async Task Users_ProfileAndPreferences_RoundTrip()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        var auth = await RegisterVerifyAndLoginAsync(factory, client, "profile@example.com");

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var updateProfile = await client.PutAsJsonAsync("/api/v1/users/profile", new
        {
            displayName = "Amina Wallet",
            avatarUrl = "https://cdn.example.com/avatar.png",
            language = "fr",
            timezone = "Africa/Casablanca"
        });
        updateProfile.StatusCode.Should().Be(HttpStatusCode.OK);

        var updatePreferences = await client.PutAsJsonAsync("/api/v1/users/preferences", new
        {
            locale = "fr-MA",
            preferredCurrency = "MAD",
            timezone = "Africa/Casablanca",
            monthlyBudgetPreference = 6500,
            salaryDay = 28,
            householdMode = "family"
        });
        updatePreferences.StatusCode.Should().Be(HttpStatusCode.OK);

        var profile = await client.GetAsync("/api/v1/users/profile");
        profile.StatusCode.Should().Be(HttpStatusCode.OK);
        var profileJson = await profile.Content.ReadAsStringAsync();
        profileJson.Should().Contain("Amina Wallet");

        var preferences = await client.GetAsync("/api/v1/users/preferences");
        preferences.StatusCode.Should().Be(HttpStatusCode.OK);
        var preferencesJson = await preferences.Content.ReadAsStringAsync();
        preferencesJson.Should().Contain("family");
        preferencesJson.Should().Contain("6500");
    }

    [Fact]
    public async Task Budget_Endpoints_Enforce_User_Isolation()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterVerifyAndLoginAsync(factory, client, "budget@example.com");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var otherUserId = Guid.NewGuid();
        var otherWalletId = Guid.NewGuid();
        var otherExpenseId = Guid.NewGuid();

        await factory.MutateBudgetDbAsync(async db =>
        {
            var wallet = Wallet.Create(otherUserId, "Other Wallet", WalletType.Bank, "MAD", 1000, null, null);
            typeof(Wallet).GetProperty(nameof(Wallet.Id))!.SetValue(wallet, otherWalletId);
            db.Wallets.Add(wallet);

            var expense = Expense.Create(otherUserId, null, otherWalletId, 90, "MAD", TransactionType.Expense, "card", "Other expense", null, DateTime.UtcNow, false, null);
            typeof(Expense).GetProperty(nameof(Expense.Id))!.SetValue(expense, otherExpenseId);
            db.Expenses.Add(expense);
            await Task.CompletedTask;
        });

        var createWallet = await client.PostAsJsonAsync("/api/v1/wallets", new
        {
            name = "Main Wallet",
            type = 1,
            currency = "MAD",
            currentBalance = 2500,
            color = "#0f766e",
            icon = "wallet"
        });
        createWallet.StatusCode.Should().Be(HttpStatusCode.Created);

        var foreignWallet = await client.GetAsync($"/api/v1/wallets/{otherWalletId}");
        foreignWallet.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var foreignExpense = await client.GetAsync($"/api/v1/transactions/{otherExpenseId}");
        foreignExpense.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Reminders_Support_Snooze_And_Block_Foreign_Access()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterVerifyAndLoginAsync(factory, client, "reminders@example.com");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var createResponse = await client.PostAsJsonAsync("/api/v1/reminders", new
        {
            title = "Pay rent",
            description = "Landlord transfer",
            type = 0,
            amount = 3200,
            dueDate = DateTime.UtcNow.AddDays(2),
            frequency = 3
        });
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await createResponse.Content.ReadFromJsonAsync<CreatedIdResponse>();
        var snoozeUntil = DateTime.UtcNow.AddDays(5);
        var snoozeResponse = await client.PostAsJsonAsync($"/api/v1/reminders/{created!.Id}/snooze", new { until = snoozeUntil });
        snoozeResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getOwn = await client.GetAsync($"/api/v1/reminders/{created.Id}");
        getOwn.StatusCode.Should().Be(HttpStatusCode.OK);
        (await getOwn.Content.ReadAsStringAsync()).Should().Contain("Rent");

        var otherReminderId = Guid.NewGuid();
        await factory.MutateRemindersDbAsync(async db =>
        {
            var other = Reminder.Create(Guid.NewGuid(), "Other", null, ReminderType.Custom, null, DateTime.UtcNow.AddDays(1), ReminderFrequency.Once);
            typeof(Reminder).GetProperty(nameof(Reminder.Id))!.SetValue(other, otherReminderId);
            db.Reminders.Add(other);
            await Task.CompletedTask;
        });

        var foreignReminder = await client.GetAsync($"/api/v1/reminders/{otherReminderId}");
        foreignReminder.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Notifications_Only_Expose_Current_User_Data()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterVerifyAndLoginAsync(factory, client, "notifications@example.com");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var foreignNotificationId = Guid.NewGuid();
        await factory.MutateNotificationsDbAsync(async db =>
        {
            db.Notifications.Add(Notification.Create(auth.UserId, "system", "Own notification"));
            var foreign = Notification.Create(Guid.NewGuid(), "system", "Foreign notification");
            typeof(Notification).GetProperty(nameof(Notification.Id))!.SetValue(foreign, foreignNotificationId);
            db.Notifications.Add(foreign);
            await Task.CompletedTask;
        });

        var unreadCount = await client.GetAsync("/api/v1/notifications/unread-count");
        unreadCount.StatusCode.Should().Be(HttpStatusCode.OK);
        (await unreadCount.Content.ReadAsStringAsync()).Should().Contain("1");

        var markForeign = await client.PostAsync($"/api/v1/notifications/{foreignNotificationId}/read", null);
        markForeign.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        var markAll = await client.PostAsync("/api/v1/notifications/mark-all-read", null);
        markAll.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task SharedExpenses_And_GroceryPrices_Expose_New_Routes()
    {
        await using var factory = new AuthIntegrationFactory();
        using var client = factory.CreateClient();
        var auth = await RegisterVerifyAndLoginAsync(factory, client, "shared@example.com");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);

        var createGroup = await client.PostAsJsonAsync("/api/v1/shared-expenses/groups", new
        {
            name = "Home",
            description = "Roommates",
            currency = "MAD"
        });
        createGroup.StatusCode.Should().Be(HttpStatusCode.Created);
        var group = await createGroup.Content.ReadFromJsonAsync<CreatedIdResponse>();

        var createSharedExpense = await client.PostAsJsonAsync("/api/v1/shared-expenses", new
        {
            groupId = group!.Id,
            amount = 300,
            currency = "MAD",
            description = "Groceries",
            date = DateTime.UtcNow,
            splitType = 0,
            splits = new[]
            {
                new { userId = auth.UserId, amount = 300m }
            }
        });
        createSharedExpense.StatusCode.Should().Be(HttpStatusCode.Created);
        var sharedExpense = await createSharedExpense.Content.ReadFromJsonAsync<CreatedIdResponse>();

        var getSharedExpense = await client.GetAsync($"/api/v1/shared-expenses/{sharedExpense!.Id}");
        getSharedExpense.StatusCode.Should().Be(HttpStatusCode.OK);

        var settlement = await client.PostAsJsonAsync("/api/v1/shared-expenses/settlements", new
        {
            groupId = group.Id,
            fromUserId = auth.UserId,
            toUserId = auth.UserId,
            amount = 50,
            currency = "MAD",
            settledOn = DateTime.UtcNow,
            notes = "Manual correction"
        });
        settlement.StatusCode.Should().Be(HttpStatusCode.Created);

        var createProduct = await client.PostAsJsonAsync("/api/v1/grocery-prices/products", new
        {
            name = "Milk",
            category = "Dairy",
            unit = "1L",
            barcode = "1234567890"
        });
        createProduct.StatusCode.Should().Be(HttpStatusCode.Created);
        var product = await createProduct.Content.ReadFromJsonAsync<CreatedIdResponse>();

        var addEntry = await client.PostAsJsonAsync("/api/v1/grocery-prices/entries", new
        {
            productId = product!.Id,
            price = 14.5,
            currency = "MAD",
            storeName = "Marjane",
            storeLocation = "Casablanca",
            observedAt = DateTime.UtcNow
        });
        addEntry.StatusCode.Should().Be(HttpStatusCode.Created);

        var history = await client.GetAsync($"/api/v1/grocery-prices/products/{product.Id}/history");
        history.StatusCode.Should().Be(HttpStatusCode.OK);

        var addFavorite = await client.PostAsync($"/api/v1/grocery-prices/favorites/{product.Id}", null);
        addFavorite.StatusCode.Should().Be(HttpStatusCode.OK);

        var removeFavorite = await client.DeleteAsync($"/api/v1/grocery-prices/favorites/{product.Id}");
        removeFavorite.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private static async Task<AuthLoginResponse> RegisterVerifyAndLoginAsync(AuthIntegrationFactory factory, HttpClient client, string email)
    {
        var registerResponse = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email,
            password = "Password123"
        });
        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var verifyToken = factory.EmailSender.GetLatestToken("Verify your email: ");
        var verifyResponse = await client.PostAsJsonAsync("/api/v1/auth/verify-email", new { token = verifyToken });
        verifyResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var loginResponse = await client.PostAsJsonAsync("/api/v1/auth/login", new
        {
            email,
            password = "Password123"
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        return (await loginResponse.Content.ReadFromJsonAsync<AuthLoginResponse>())!;
    }

    private sealed record AuthLoginResponse(string AccessToken, string RefreshToken, DateTime AccessTokenExpiresAt, Guid UserId, string Email);
    private sealed record CreatedIdResponse(Guid Id);
}
