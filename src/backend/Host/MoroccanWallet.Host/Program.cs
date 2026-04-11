using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MoroccanWallet.Modules.Administration;
using MoroccanWallet.Modules.GroceryPrices;
using MoroccanWallet.Modules.HouseholdBudget;
using MoroccanWallet.Modules.Identity;
using MoroccanWallet.Modules.Identity.Infrastructure.Services;
using MoroccanWallet.Modules.Notifications;
using MoroccanWallet.Modules.ReferenceData;
using MoroccanWallet.Modules.Reminders;
using MoroccanWallet.Modules.SharedExpenses;
using MoroccanWallet.Modules.Users;
using MoroccanWallet.Shared.Infrastructure.Behaviors;
using MoroccanWallet.Shared.Infrastructure.Email;
using MoroccanWallet.Shared.Infrastructure.Middleware;
using MoroccanWallet.Shared.Kernel.Primitives;
using Scalar.AspNetCore;
using Serilog;

// Bootstrap Serilog early for startup logging
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Moroccan Wallet API (.NET 10)");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog ──────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}"));

    // ─── Core ASP.NET Core ────────────────────────────────────────────────────
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddHttpContextAccessor();

    // ─── OpenAPI (.NET 10 built-in) + Scalar UI ───────────────────────────────
    builder.Services.AddOpenApi("v1", opts =>
    {
        opts.AddDocumentTransformer((doc, ctx, ct) =>
        {
            doc.Info = new OpenApiInfo
            {
                Title = "Moroccan Wallet API",
                Version = "v1",
                Description = "Production-grade household wallet management API"
            };

            // Bearer security scheme
            doc.Components ??= new OpenApiComponents();
            doc.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Enter JWT access token"
            };
            doc.SecurityRequirements.Add(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });

            return Task.CompletedTask;
        });
    });

    // ─── JWT Authentication ───────────────────────────────────────────────────
    var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
    var secretKey = jwtSection["SecretKey"]
        ?? throw new InvalidOperationException("Jwt:SecretKey not configured.");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opts =>
        {
            opts.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSection["Issuer"],
                ValidAudience = jwtSection["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
                ClockSkew = TimeSpan.FromSeconds(30)
            };

            // Allow SignalR to receive token from query string
            opts.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var accessToken = ctx.Request.Query["access_token"];
                    var path = ctx.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                        ctx.Token = accessToken;
                    return Task.CompletedTask;
                }
            };
        });

    builder.Services.AddAuthorization();

    // ─── Rate Limiting (.NET built-in) ────────────────────────────────────────
    builder.Services.AddRateLimiter(opts =>
    {
        opts.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        opts.OnRejected = async (ctx, token) =>
        {
            ctx.HttpContext.Response.ContentType = "application/problem+json";
            await ctx.HttpContext.Response.WriteAsync(
                """{"status":429,"title":"Too Many Requests","detail":"Rate limit exceeded. Please slow down."}""",
                token);
        };

        // Auth: login — 10 req/min per IP
        opts.AddFixedWindowLimiter(RateLimitPolicies.Login, policy =>
        {
            policy.PermitLimit = 10;
            policy.Window = TimeSpan.FromMinutes(1);
            policy.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            policy.QueueLimit = 0;
        });

        // Auth: register + forgot-password — 5 req/hour per IP
        opts.AddFixedWindowLimiter(RateLimitPolicies.AuthSensitive, policy =>
        {
            policy.PermitLimit = 5;
            policy.Window = TimeSpan.FromHours(1);
            policy.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            policy.QueueLimit = 0;
        });

        // General API — 60 req/min per IP
        opts.AddFixedWindowLimiter(RateLimitPolicies.General, policy =>
        {
            policy.PermitLimit = 60;
            policy.Window = TimeSpan.FromMinutes(1);
            policy.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            policy.QueueLimit = 2;
        });

        // Global fallback
        opts.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 200,
                    Window = TimeSpan.FromMinutes(1)
                }));
    });

    // ─── MediatR + Pipeline Behaviors ────────────────────────────────────────
    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblies(
            typeof(IdentityModule).Assembly,
            typeof(NotificationsModule).Assembly
        );
    });

    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

    // ─── FluentValidation ────────────────────────────────────────────────────
    builder.Services.AddValidatorsFromAssemblies([
        typeof(IdentityModule).Assembly
    ]);

    // ─── Email ───────────────────────────────────────────────────────────────
    var emailProvider = builder.Configuration["Email:Provider"] ?? "dev";
    if (emailProvider.Equals("smtp", StringComparison.OrdinalIgnoreCase))
    {
        builder.Services.Configure<SmtpOptions>(
            builder.Configuration.GetSection(SmtpOptions.SectionName));
        builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
    }
    else
    {
        builder.Services.AddScoped<IEmailSender, DevEmailSender>();
    }

    // ─── Modules ─────────────────────────────────────────────────────────────
    builder.Services.AddIdentityModule(builder.Configuration);
    builder.Services.AddNotificationsModule(builder.Configuration);
    builder.Services.AddUsersModule(builder.Configuration);
    builder.Services.AddHouseholdBudgetModule(builder.Configuration);
    builder.Services.AddSharedExpensesModule(builder.Configuration);
    builder.Services.AddGroceryPricesModule(builder.Configuration);
    builder.Services.AddRemindersModule(builder.Configuration);
    builder.Services.AddReferenceDataModule(builder.Configuration);
    builder.Services.AddAdministrationModule(builder.Configuration);

    // ─── CORS ────────────────────────────────────────────────────────────────
    builder.Services.AddCors(opts =>
        opts.AddPolicy("AllowFrontend", policy =>
            policy
                .WithOrigins(
                    builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                    ?? ["http://localhost:5173"])
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials())); // Required for SignalR

    // ─── Build ───────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ─── Middleware Pipeline ──────────────────────────────────────────────────
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference(opts =>
        {
            opts.Title = "Moroccan Wallet API";
            opts.Theme = ScalarTheme.Purple;
            opts.DefaultHttpClient = new(ScalarTarget.JavaScript, ScalarClient.Fetch);
        });
    }

    app.UseSerilogRequestLogging(opts =>
    {
        opts.EnrichDiagnosticContext = (dc, httpCtx) =>
        {
            dc.Set("RequestHost", httpCtx.Request.Host.Value);
            dc.Set("UserAgent", httpCtx.Request.Headers.UserAgent.FirstOrDefault());
        };
    });

    app.UseRateLimiter();
    app.UseCors("AllowFrontend");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapNotificationHub();

    app.MapGet("/health", () => Results.Ok(new
    {
        status = "healthy",
        timestamp = DateTime.UtcNow,
        version = "2.0.0",
        runtime = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription
    })).WithTags("Health").AllowAnonymous();

    Log.Information("Moroccan Wallet API started — Scalar UI at /scalar/v1");
    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
