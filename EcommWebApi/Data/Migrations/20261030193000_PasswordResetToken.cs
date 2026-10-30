using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using EcommWebApi.Data;

#nullable disable

namespace EcommWebApi.Data.Migrations
{
    [DbContext(typeof(ShopDbContext))]
    [Migration("20261030193000_PasswordResetToken")]
    public partial class PasswordResetToken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordResetTokenHash",
                table: "Users",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "PasswordResetExpiresAt", table: "Users");
            migrationBuilder.DropColumn(name: "PasswordResetTokenHash", table: "Users");
        }
    }
}
