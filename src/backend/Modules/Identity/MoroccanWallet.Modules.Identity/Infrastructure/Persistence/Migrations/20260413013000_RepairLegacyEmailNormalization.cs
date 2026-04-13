using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoroccanWallet.Modules.Identity.Infrastructure.Persistence.Migrations;

public partial class RepairLegacyEmailNormalization : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE identity.users
            ADD COLUMN IF NOT EXISTS email_normalized character varying(320);
            """);

        migrationBuilder.Sql(
            """
            UPDATE identity.users
            SET email_normalized = UPPER(BTRIM(email))
            WHERE email_normalized IS NULL
               OR BTRIM(email_normalized) = ''
               OR email_normalized <> UPPER(BTRIM(email));
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE identity.users
            ALTER COLUMN email_normalized SET NOT NULL;
            """);

        migrationBuilder.Sql(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
            ON identity.users (email_normalized);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Intentionally left as a no-op because this repair migration aligns legacy data
        // with the existing model and should not remove a required normalized email column.
    }
}
