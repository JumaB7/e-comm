using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using EcommWebApi.Data;

#nullable disable

namespace EcommWebApi.Data.Migrations
{
    [DbContext(typeof(ShopDbContext))]
    [Migration("20261104201000_OrderShopUserId")]
    public partial class OrderShopUserId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ShopUserId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_ShopUserId",
                table: "Orders",
                column: "ShopUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Users_ShopUserId",
                table: "Orders",
                column: "ShopUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Link existing orders to accounts that share the same email (guest → account claim).
            migrationBuilder.Sql(
                """
                UPDATE o
                SET o.ShopUserId = u.Id
                FROM Orders AS o
                INNER JOIN Users AS u ON LOWER(o.Email) = LOWER(u.Email)
                WHERE o.ShopUserId IS NULL
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Users_ShopUserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_ShopUserId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShopUserId",
                table: "Orders");
        }
    }
}
