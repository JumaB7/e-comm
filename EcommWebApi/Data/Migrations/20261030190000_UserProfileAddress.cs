using EcommWebApi.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EcommWebApi.Data.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(ShopDbContext))]
    [Migration("20261030190000_UserProfileAddress")]
    public partial class UserProfileAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Users",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Delivery",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "courier");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Users",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "PrefillCheckout",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Users",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Users",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Suburb",
                table: "Users",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "City", table: "Users");
            migrationBuilder.DropColumn(name: "Delivery", table: "Users");
            migrationBuilder.DropColumn(name: "PostalCode", table: "Users");
            migrationBuilder.DropColumn(name: "PrefillCheckout", table: "Users");
            migrationBuilder.DropColumn(name: "Province", table: "Users");
            migrationBuilder.DropColumn(name: "Street", table: "Users");
            migrationBuilder.DropColumn(name: "Suburb", table: "Users");
        }
    }
}
