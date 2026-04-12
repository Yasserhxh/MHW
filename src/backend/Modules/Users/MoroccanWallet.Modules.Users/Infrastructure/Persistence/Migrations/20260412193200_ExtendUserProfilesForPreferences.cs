using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoroccanWallet.Modules.Users.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ExtendUserProfilesForPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "household_mode",
                schema: "users",
                table: "user_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "locale",
                schema: "users",
                table: "user_profiles",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "monthly_budget_preference",
                schema: "users",
                table: "user_profiles",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "salary_day",
                schema: "users",
                table: "user_profiles",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "household_mode",
                schema: "users",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "locale",
                schema: "users",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "monthly_budget_preference",
                schema: "users",
                table: "user_profiles");

            migrationBuilder.DropColumn(
                name: "salary_day",
                schema: "users",
                table: "user_profiles");
        }
    }
}
