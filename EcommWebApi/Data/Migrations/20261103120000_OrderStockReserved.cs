using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using EcommWebApi.Data;

#nullable disable

namespace EcommWebApi.Data.Migrations
{
    [DbContext(typeof(ShopDbContext))]
    [Migration("20261103120000_OrderStockReserved")]
    public partial class OrderStockReserved : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "StockReserved",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StockReserved",
                table: "Orders");
        }
    }
}
