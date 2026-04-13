using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoroccanWallet.Modules.Identity.Infrastructure.Persistence.Migrations;

public partial class RepairLegacyIdentityTables : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            CREATE SCHEMA IF NOT EXISTS identity;
            """);

        migrationBuilder.Sql(
            """
            CREATE TABLE IF NOT EXISTS identity.users
            (
                id uuid NOT NULL PRIMARY KEY,
                email character varying(320) NOT NULL,
                email_normalized character varying(320),
                password_hash text NOT NULL,
                email_verified boolean NOT NULL DEFAULT FALSE,
                is_active boolean NOT NULL DEFAULT TRUE,
                created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                updated_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS email character varying(320);
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS email_normalized character varying(320);
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS password_hash text;
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS email_verified boolean;
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS is_active boolean;
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
            ALTER TABLE identity.users ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
            """);

        migrationBuilder.Sql(
            """
            UPDATE identity.users
            SET email_normalized = UPPER(BTRIM(email))
            WHERE email IS NOT NULL
              AND (
                    email_normalized IS NULL
                 OR BTRIM(email_normalized) = ''
                 OR email_normalized <> UPPER(BTRIM(email))
              );

            UPDATE identity.users SET email_verified = FALSE WHERE email_verified IS NULL;
            UPDATE identity.users SET is_active = TRUE WHERE is_active IS NULL;
            UPDATE identity.users SET created_at = NOW() WHERE created_at IS NULL;
            UPDATE identity.users SET updated_at = COALESCE(updated_at, created_at, NOW()) WHERE updated_at IS NULL;

            ALTER TABLE identity.users ALTER COLUMN email SET NOT NULL;
            ALTER TABLE identity.users ALTER COLUMN email_normalized SET NOT NULL;
            ALTER TABLE identity.users ALTER COLUMN password_hash SET NOT NULL;
            ALTER TABLE identity.users ALTER COLUMN email_verified SET NOT NULL;
            ALTER TABLE identity.users ALTER COLUMN is_active SET NOT NULL;
            ALTER TABLE identity.users ALTER COLUMN created_at SET NOT NULL;
            ALTER TABLE identity.users ALTER COLUMN updated_at SET NOT NULL;
            """);

        migrationBuilder.Sql(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
            ON identity.users (email_normalized);
            """);

        migrationBuilder.Sql(
            """
            CREATE TABLE IF NOT EXISTS identity.email_verification_tokens
            (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                token_hash text NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                used_at timestamp with time zone NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                updated_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE identity.email_verification_tokens ADD COLUMN IF NOT EXISTS user_id uuid;
            ALTER TABLE identity.email_verification_tokens ADD COLUMN IF NOT EXISTS token_hash text;
            ALTER TABLE identity.email_verification_tokens ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
            ALTER TABLE identity.email_verification_tokens ADD COLUMN IF NOT EXISTS used_at timestamp with time zone;
            ALTER TABLE identity.email_verification_tokens ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
            ALTER TABLE identity.email_verification_tokens ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

            UPDATE identity.email_verification_tokens
            SET created_at = NOW()
            WHERE created_at IS NULL;

            UPDATE identity.email_verification_tokens
            SET updated_at = COALESCE(updated_at, created_at, NOW())
            WHERE updated_at IS NULL;

            ALTER TABLE identity.email_verification_tokens ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE identity.email_verification_tokens ALTER COLUMN token_hash SET NOT NULL;
            ALTER TABLE identity.email_verification_tokens ALTER COLUMN expires_at SET NOT NULL;
            ALTER TABLE identity.email_verification_tokens ALTER COLUMN created_at SET NOT NULL;
            ALTER TABLE identity.email_verification_tokens ALTER COLUMN updated_at SET NOT NULL;
            """);

        migrationBuilder.Sql(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_evtoken
            ON identity.email_verification_tokens (token_hash);

            CREATE INDEX IF NOT EXISTS idx_evtoken_user
            ON identity.email_verification_tokens (user_id);
            """);

        migrationBuilder.Sql(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_email_verification_tokens_users_user_id'
                ) THEN
                    ALTER TABLE identity.email_verification_tokens
                    ADD CONSTRAINT "FK_email_verification_tokens_users_user_id"
                    FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE CASCADE;
                END IF;
            END
            $$;
            """);

        migrationBuilder.Sql(
            """
            CREATE TABLE IF NOT EXISTS identity.password_reset_tokens
            (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                token_hash text NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                used_at timestamp with time zone NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                updated_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE identity.password_reset_tokens ADD COLUMN IF NOT EXISTS user_id uuid;
            ALTER TABLE identity.password_reset_tokens ADD COLUMN IF NOT EXISTS token_hash text;
            ALTER TABLE identity.password_reset_tokens ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
            ALTER TABLE identity.password_reset_tokens ADD COLUMN IF NOT EXISTS used_at timestamp with time zone;
            ALTER TABLE identity.password_reset_tokens ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
            ALTER TABLE identity.password_reset_tokens ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

            UPDATE identity.password_reset_tokens
            SET created_at = NOW()
            WHERE created_at IS NULL;

            UPDATE identity.password_reset_tokens
            SET updated_at = COALESCE(updated_at, created_at, NOW())
            WHERE updated_at IS NULL;

            ALTER TABLE identity.password_reset_tokens ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE identity.password_reset_tokens ALTER COLUMN token_hash SET NOT NULL;
            ALTER TABLE identity.password_reset_tokens ALTER COLUMN expires_at SET NOT NULL;
            ALTER TABLE identity.password_reset_tokens ALTER COLUMN created_at SET NOT NULL;
            ALTER TABLE identity.password_reset_tokens ALTER COLUMN updated_at SET NOT NULL;
            """);

        migrationBuilder.Sql(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_prtoken
            ON identity.password_reset_tokens (token_hash);
            """);

        migrationBuilder.Sql(
            """
            CREATE INDEX IF NOT EXISTS "IX_password_reset_tokens_user_id"
            ON identity.password_reset_tokens (user_id);
            """);

        migrationBuilder.Sql(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_password_reset_tokens_users_user_id'
                ) THEN
                    ALTER TABLE identity.password_reset_tokens
                    ADD CONSTRAINT "FK_password_reset_tokens_users_user_id"
                    FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE CASCADE;
                END IF;
            END
            $$;
            """);

        migrationBuilder.Sql(
            """
            CREATE TABLE IF NOT EXISTS identity.refresh_tokens
            (
                id uuid NOT NULL PRIMARY KEY,
                user_id uuid NOT NULL,
                token_hash text NOT NULL,
                family_id uuid NOT NULL,
                expires_at timestamp with time zone NOT NULL,
                revoked_at timestamp with time zone NULL,
                revoke_reason character varying(50) NULL,
                replaced_by_id uuid NULL,
                device_hint character varying(200) NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW(),
                updated_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS user_id uuid;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS token_hash text;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS family_id uuid;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS revoke_reason character varying(50);
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS replaced_by_id uuid;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS device_hint character varying(200);
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
            ALTER TABLE identity.refresh_tokens ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

            UPDATE identity.refresh_tokens
            SET family_id = id
            WHERE family_id IS NULL;

            UPDATE identity.refresh_tokens
            SET created_at = NOW()
            WHERE created_at IS NULL;

            UPDATE identity.refresh_tokens
            SET updated_at = COALESCE(updated_at, created_at, NOW())
            WHERE updated_at IS NULL;

            ALTER TABLE identity.refresh_tokens ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE identity.refresh_tokens ALTER COLUMN token_hash SET NOT NULL;
            ALTER TABLE identity.refresh_tokens ALTER COLUMN family_id SET NOT NULL;
            ALTER TABLE identity.refresh_tokens ALTER COLUMN expires_at SET NOT NULL;
            ALTER TABLE identity.refresh_tokens ALTER COLUMN created_at SET NOT NULL;
            ALTER TABLE identity.refresh_tokens ALTER COLUMN updated_at SET NOT NULL;
            """);

        migrationBuilder.Sql(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_rtoken
            ON identity.refresh_tokens (token_hash);

            CREATE INDEX IF NOT EXISTS idx_rtoken_user
            ON identity.refresh_tokens (user_id);

            CREATE INDEX IF NOT EXISTS idx_rtoken_family
            ON identity.refresh_tokens (family_id);
            """);

        migrationBuilder.Sql(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_refresh_tokens_users_user_id'
                ) THEN
                    ALTER TABLE identity.refresh_tokens
                    ADD CONSTRAINT "FK_refresh_tokens_users_user_id"
                    FOREIGN KEY (user_id) REFERENCES identity.users (id) ON DELETE CASCADE;
                END IF;
            END
            $$;
            """);

        migrationBuilder.Sql(
            """
            CREATE TABLE IF NOT EXISTS identity.auth_audit_logs
            (
                id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                user_id uuid NULL,
                event_type character varying(50) NOT NULL,
                ip_address character varying(45) NULL,
                user_agent text NULL,
                metadata jsonb NULL,
                created_at timestamp with time zone NOT NULL DEFAULT NOW()
            );
            """);

        migrationBuilder.Sql(
            """
            ALTER TABLE identity.auth_audit_logs ADD COLUMN IF NOT EXISTS user_id uuid;
            ALTER TABLE identity.auth_audit_logs ADD COLUMN IF NOT EXISTS event_type character varying(50);
            ALTER TABLE identity.auth_audit_logs ADD COLUMN IF NOT EXISTS ip_address character varying(45);
            ALTER TABLE identity.auth_audit_logs ADD COLUMN IF NOT EXISTS user_agent text;
            ALTER TABLE identity.auth_audit_logs ADD COLUMN IF NOT EXISTS metadata jsonb;
            ALTER TABLE identity.auth_audit_logs ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;

            UPDATE identity.auth_audit_logs
            SET created_at = NOW()
            WHERE created_at IS NULL;

            ALTER TABLE identity.auth_audit_logs ALTER COLUMN event_type SET NOT NULL;
            ALTER TABLE identity.auth_audit_logs ALTER COLUMN created_at SET NOT NULL;
            """);

        migrationBuilder.Sql(
            """
            CREATE INDEX IF NOT EXISTS idx_auth_audit_user
            ON identity.auth_audit_logs (user_id);

            CREATE INDEX IF NOT EXISTS idx_auth_audit_event
            ON identity.auth_audit_logs (event_type);

            CREATE INDEX IF NOT EXISTS idx_auth_audit_created
            ON identity.auth_audit_logs (created_at DESC);
            """);

        migrationBuilder.Sql(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'FK_auth_audit_logs_users_user_id'
                ) THEN
                    ALTER TABLE identity.auth_audit_logs
                    ADD CONSTRAINT "FK_auth_audit_logs_users_user_id"
                    FOREIGN KEY (user_id) REFERENCES identity.users (id);
                END IF;
            END
            $$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Intentionally no-op. This migration repairs legacy Identity schemas in place.
    }
}
