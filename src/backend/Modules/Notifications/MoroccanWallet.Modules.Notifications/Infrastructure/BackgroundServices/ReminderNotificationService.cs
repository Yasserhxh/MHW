using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MoroccanWallet.Modules.Notifications.Application.Services;
using MoroccanWallet.Modules.Notifications.Infrastructure.Persistence;

namespace MoroccanWallet.Modules.Notifications.Infrastructure.BackgroundServices;

/// <summary>
/// Polls for reminders that are due and haven't had a notification sent yet.
/// Runs every 5 minutes.
/// </summary>
public sealed class ReminderNotificationService(
    IServiceScopeFactory scopeFactory,
    ILogger<ReminderNotificationService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("ReminderNotificationService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDueRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing due reminders.");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task ProcessDueRemindersAsync(CancellationToken cancellationToken)
    {
        await using AsyncServiceScope scope = scopeFactory.CreateAsyncScope();
        var notificationsDb = scope.ServiceProvider.GetRequiredService<NotificationsDbContext>();
        var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

        // We load reminders using raw SQL to avoid a project reference to the Reminders module.
        // Instead, read from the reminders.reminders table directly.
        var now = DateTime.UtcNow;
        var windowEnd = now.AddMinutes(10);

        var dueReminders = await notificationsDb.Database
            .SqlQueryRaw<DueReminderRow>(
                """
                SELECT id, user_id, title, description, due_date
                FROM reminders.reminders
                WHERE is_completed = false
                  AND notification_sent = false
                  AND due_date <= {0}
                LIMIT 100
                """,
                windowEnd)
            .ToListAsync(cancellationToken);

        if (dueReminders.Count == 0)
            return;

        foreach (DueReminderRow reminder in dueReminders)
        {
            await notificationService.SendAsync(
                reminder.user_id,
                "reminder",
                $"Reminder: {reminder.title}",
                reminder.description,
                new { reminderId = reminder.id },
                cancellationToken);

            // Mark notification_sent = true
            await notificationsDb.Database.ExecuteSqlRawAsync(
                "UPDATE reminders.reminders SET notification_sent = true, updated_at = {0} WHERE id = {1}",
                DateTime.UtcNow, reminder.id, cancellationToken);

            logger.LogInformation(
                "Reminder notification sent for reminder {ReminderId} to user {UserId}.",
                reminder.id, reminder.user_id);
        }
    }

    private sealed record DueReminderRow(
        Guid id,
        Guid user_id,
        string title,
        string? description,
        DateTime due_date);
}
