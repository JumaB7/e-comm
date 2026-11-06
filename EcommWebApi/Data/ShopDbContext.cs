using EcommWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace EcommWebApi.Data;

public class ShopDbContext(DbContextOptions<ShopDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ShopUser> Users => Set<ShopUser>();
    public DbSet<ShopOrder> Orders => Set<ShopOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(product =>
        {
            product.HasIndex(item => item.Sku).IsUnique();
            product.Property(item => item.Sku).HasMaxLength(32);
            product.Property(item => item.Name).HasMaxLength(120);
            product.Property(item => item.Category).HasMaxLength(40);
            product.Property(item => item.Image).HasMaxLength(200);
            product.HasMany(item => item.Specs).WithOne().HasForeignKey(spec => spec.ProductId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductSpec>(spec =>
        {
            spec.Property(item => item.Label).HasMaxLength(40);
            spec.Property(item => item.Value).HasMaxLength(80);
        });

        modelBuilder.Entity<ShopUser>(user =>
        {
            user.HasIndex(item => item.Email).IsUnique();
            user.Property(item => item.Email).HasMaxLength(160);
            user.Property(item => item.Name).HasMaxLength(120);
            user.Property(item => item.Phone).HasMaxLength(40);
            user.Property(item => item.Role).HasMaxLength(20);
            user.Property(item => item.PasswordResetTokenHash).HasMaxLength(128);
            user.Property(item => item.RefreshTokenHash).HasMaxLength(128);
            user.Property(item => item.Street).HasMaxLength(160);
            user.Property(item => item.Suburb).HasMaxLength(80);
            user.Property(item => item.City).HasMaxLength(80);
            user.Property(item => item.Province).HasMaxLength(80);
            user.Property(item => item.PostalCode).HasMaxLength(10);
            user.Property(item => item.Delivery).HasMaxLength(20);
        });

        modelBuilder.Entity<ShopOrder>(order =>
        {
            order.HasIndex(item => item.Number).IsUnique();
            order.HasIndex(item => item.ReceiptKey).IsUnique();
            order.HasIndex(item => item.ShopUserId);
            order.Property(item => item.Number).HasMaxLength(20);
            order.Property(item => item.ReceiptKey).HasMaxLength(32);
            order.Property(item => item.CustomerName).HasMaxLength(120);
            order.Property(item => item.Email).HasMaxLength(160);
            order.Property(item => item.Delivery).HasMaxLength(20);
            order.Property(item => item.Status).HasMaxLength(40);
            order.Property(item => item.Tone).HasMaxLength(20);
            order.Property(item => item.Fulfilment).HasMaxLength(40);
            order.Property(item => item.TrackingNumber).HasMaxLength(40);
            order.HasOne<ShopUser>().WithMany().HasForeignKey(item => item.ShopUserId).OnDelete(DeleteBehavior.SetNull);
            order.HasMany(item => item.Lines).WithOne().HasForeignKey(line => line.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderLine>(line =>
        {
            line.Property(item => item.Sku).HasMaxLength(32);
            line.Property(item => item.Name).HasMaxLength(120);
            line.Property(item => item.Detail).HasMaxLength(40);
        });
    }
}
