using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using EcommWebApi.Data;

#nullable disable

namespace EcommWebApi.Data.Migrations
{
    [DbContext(typeof(ShopDbContext))]
    [Migration("20261104190000_UserRefreshToken")]
    public partial class UserRefreshToken : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RefreshTokenHash",
                table: "Users",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiresAt",
                table: "Users",
                type: "datetime2",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "RefreshTokenHash", table: "Users");
            migrationBuilder.DropColumn(name: "RefreshTokenExpiresAt", table: "Users");
        }
    }
}
