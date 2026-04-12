using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoroccanWallet.Modules.Reminders.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExtendRemindersForSnoozeAndType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "amount",
                schema: "reminders",
                table: "reminders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "snoozed_until",
                schema: "reminders",
                table: "reminders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "type",
                schema: "reminders",
                table: "reminders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "amount",
                schema: "reminders",
                table: "reminders");

            migrationBuilder.DropColumn(
                name: "snoozed_until",
                schema: "reminders",
                table: "reminders");

            migrationBuilder.DropColumn(
                name: "type",
                schema: "reminders",
                table: "reminders");
        }
    }
}
