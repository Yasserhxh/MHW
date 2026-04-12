using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MoroccanWallet.Modules.GroceryPrices.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "grocery_prices");

            migrationBuilder.CreateTable(
                name: "favorite_products",
                schema: "grocery_prices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    added_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_favorite_products", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "price_entries",
                schema: "grocery_prices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    product_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    currency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    store_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    store_location = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    observed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_price_entries", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "products",
                schema: "grocery_prices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    barcode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_favorite_products_user_product",
                schema: "grocery_prices",
                table: "favorite_products",
                columns: new[] { "user_id", "product_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_price_entries_product_date",
                schema: "grocery_prices",
                table: "price_entries",
                columns: new[] { "product_id", "observed_at" });

            migrationBuilder.CreateIndex(
                name: "ix_price_entries_product_id",
                schema: "grocery_prices",
                table: "price_entries",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_products_barcode",
                schema: "grocery_prices",
                table: "products",
                column: "barcode");

            migrationBuilder.CreateIndex(
                name: "ix_products_name",
                schema: "grocery_prices",
                table: "products",
                column: "name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "favorite_products",
                schema: "grocery_prices");

            migrationBuilder.DropTable(
                name: "price_entries",
                schema: "grocery_prices");

            migrationBuilder.DropTable(
                name: "products",
                schema: "grocery_prices");
        }
    }
}
