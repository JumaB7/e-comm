using System.Text;
using System.Threading.RateLimiting;
using EcommWebApi.Contracts;
using EcommWebApi.Data;
using EcommWebApi.Services;
using EcommWebApi.Services.Auth;
using EcommWebApi.Services.Cart;
using EcommWebApi.Services.Email;
using EcommWebApi.Services.Orders;
using EcommWebApi.Services.Products;
using EcommWebApi.Services.Shop;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Resend;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var shopConnection = builder.Configuration.GetConnectionString("Shop");
if (string.IsNullOrWhiteSpace(shopConnection))
{
    throw new InvalidOperationException(
        "Connection string 'Shop' is not set. On Azure: Configuration → Connection strings → name Shop (SQLAzure).");
}

builder.Services.AddDbContext<ShopDbContext>(options =>
    options.UseSqlServer(shopConnection));
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddSingleton<ProductImageStore>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IShopService, ShopService>();
builder.Services.AddScoped<IAuthService, AuthService>();
var resendApiKey = builder.Configuration["Resend:ApiKey"]
    ?? builder.Configuration["RESEND_API_KEY"]
    ?? Environment.GetEnvironmentVariable("RESEND_API_KEY");
if (!string.IsNullOrWhiteSpace(resendApiKey))
{
    builder.Services.AddResend(options =>
    {
        options.ApiToken = resendApiKey;
        options.ThrowExceptions = false;
    });
    builder.Services.AddScoped<IEmailSender, ResendEmailSender>();
}
else
{
    // TODO: set Resend__ApiKey on Azure UAT — without it, password-reset only logs the link.
    builder.Services.AddSingleton<IEmailSender, LoggingEmailSender>();
}

var jwtKey = (builder.Configuration["Jwt:Key"] ?? string.Empty).Trim();
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not set. On Azure: Configuration → App settings → Jwt__Key (not the local dev-only key).");
}
const string developmentJwtKey = "LOCAL_DEV_JWT_KEY_REPLACE_ME_32CHARS";
if (!builder.Environment.IsDevelopment() && jwtKey == developmentJwtKey)
{
    throw new InvalidOperationException("Jwt:Key must not use the development signing key outside Development.");
}
if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException("Jwt:Key must be at least 32 bytes (UTF-8). Generate a longer random value.");
}
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new MessageModel("Too many attempts. Wait a minute and try again."),
            cancellationToken);
    };
    options.AddPolicy("auth", httpContext => RateLimitPartition.GetFixedWindowLimiter(
        ClientAddress(httpContext),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        }));
    options.AddPolicy("checkout", httpContext => RateLimitPartition.GetFixedWindowLimiter(
        ClientAddress(httpContext),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        }));
});
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? ["http://localhost:4200"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("EcommWebApp", policy =>
        policy.WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        // Surfaces in Azure LogFiles/stdout when web.config has stdoutLogEnabled.
        Console.Error.WriteLine($"FATAL: Database.Migrate failed: {ex}");
        throw new InvalidOperationException(
            "Database.Migrate failed. Check connection string Shop and that Azure SQL allows this App Service (firewall / Allow Azure services).",
            ex);
    }

    // Seed users use the well-known local password — Development only.
    if (app.Environment.IsDevelopment())
    {
        ShopSeed.Apply(db);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Dev: keep HTTP :5156 usable (proxy / PayFast notify). Redirect drops Authorization.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("EcommWebApp");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

static string ClientAddress(HttpContext httpContext) =>
    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
