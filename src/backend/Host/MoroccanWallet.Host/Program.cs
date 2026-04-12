using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
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

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting Moroccan Wallet API (.NET 10)");

    var builder = WebApplication.CreateBuilder(args);
    builder.WebHost.ConfigureKestrel(options => options.AddServerHeader = false);

    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithThreadId()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}"));

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddHttpContextAccessor();
    builder.Services.AddProblemDetails();

    builder.Services.AddOpenApi("v1", opts =>
    {
        opts.AddDocumentTransformer((doc, _, _) =>
        {
            doc.Info = new OpenApiInfo
            {
                Title = "Moroccan Wallet API",
                Version = "v1",
                Description = "Production-grade household wallet management API"
            };

            doc.Components ??= new OpenApiComponents();
            doc.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
            doc.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Enter JWT access token"
            };

            doc.Security ??= [];
            doc.Security.Add(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference("Bearer", doc),
                    []
                }
            });

            return Task.CompletedTask;
        });
    });

    var jwtSection = builder.Configuration.GetSection(JwtOptions.SectionName);
    var secretKey = ResolveJwtSecret(builder.Environment, jwtSection);

    if (secretKey.Length < 32)
    {
        throw new InvalidOperationException("Jwt:SecretKey must be at least 32 characters (256 bits) for HMAC-SHA256.");
    }

    builder.Services.PostConfigure<JwtOptions>(options =>
    {
        options.SecretKey = secretKey;
        options.Issuer = jwtSection["Issuer"] ?? options.Issuer;
        options.Audience = jwtSection["Audience"] ?? options.Audience;
    });

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

            opts.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var accessToken = ctx.Request.Query["access_token"];
                    var path = ctx.HttpContext.Request.Path;

                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        ctx.Token = accessToken;
                    }

                    return Task.CompletedTask;
                },
                OnTokenValidated = ctx =>
                {
                    var subject = ctx.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? ctx.Principal?.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(subject, out _))
                    {
                        ctx.Fail("Token is missing a valid subject claim.");
                    }

                    return Task.CompletedTask;
                }
            };
        });

    builder.Services.AddAuthorization();

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

        opts.AddPolicy(RateLimitPolicies.Login, context =>
            RateLimitPartition.GetFixedWindowLimiter(
                GetRateLimitPartitionKey(context),
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0
                }));

        opts.AddPolicy(RateLimitPolicies.AuthSensitive, context =>
            RateLimitPartition.GetFixedWindowLimiter(
                GetRateLimitPartitionKey(context),
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 5,
                    Window = TimeSpan.FromHours(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 0
                }));

        opts.AddPolicy(RateLimitPolicies.General, context =>
            RateLimitPartition.GetFixedWindowLimiter(
                GetRateLimitPartitionKey(context),
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 60,
                    Window = TimeSpan.FromMinutes(1),
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 2
                }));

        opts.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            RateLimitPartition.GetFixedWindowLimiter(
                GetRateLimitPartitionKey(ctx),
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 200,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0
                }));
    });

    builder.Services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssemblies(
            typeof(IdentityModule).Assembly,
            typeof(NotificationsModule).Assembly,
            typeof(UsersModule).Assembly,
            typeof(HouseholdBudgetModule).Assembly,
            typeof(RemindersModule).Assembly,
            typeof(SharedExpensesModule).Assembly,
            typeof(GroceryPricesModule).Assembly,
            typeof(ReferenceDataModule).Assembly,
            typeof(AdministrationModule).Assembly);
    });

    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
    builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

    builder.Services.AddValidatorsFromAssemblies([
        typeof(IdentityModule).Assembly,
        typeof(UsersModule).Assembly,
        typeof(HouseholdBudgetModule).Assembly,
        typeof(RemindersModule).Assembly,
        typeof(SharedExpensesModule).Assembly,
        typeof(GroceryPricesModule).Assembly
    ]);

    var emailProvider = builder.Configuration["Email:Provider"] ?? "dev";
    if (emailProvider.Equals("smtp", StringComparison.OrdinalIgnoreCase))
    {
        builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection(SmtpOptions.SectionName));
        builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
    }
    else
    {
        builder.Services.AddScoped<IEmailSender, DevEmailSender>();
    }

    builder.Services.AddIdentityModule(builder.Configuration);
    builder.Services.AddNotificationsModule(builder.Configuration);
    builder.Services.AddUsersModule(builder.Configuration);
    builder.Services.AddHouseholdBudgetModule(builder.Configuration);
    builder.Services.AddSharedExpensesModule(builder.Configuration);
    builder.Services.AddGroceryPricesModule(builder.Configuration);
    builder.Services.AddRemindersModule(builder.Configuration);
    builder.Services.AddReferenceDataModule(builder.Configuration);
    builder.Services.AddAdministrationModule(builder.Configuration);

    builder.Services.AddCors(opts =>
        opts.AddPolicy("AllowFrontend", policy =>
            policy
                .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()));

    var app = builder.Build();

    app.UseMiddleware<SecurityHeadersMiddleware>();
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseStatusCodePages();

    if (!app.Environment.IsDevelopment())
    {
        app.UseHsts();
    }

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

    app.UseHttpsRedirection();
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

    Log.Information("Moroccan Wallet API started - Scalar UI at /scalar/v1");
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

static string ResolveJwtSecret(IWebHostEnvironment environment, IConfigurationSection jwtSection)
{
    var configuredSecret = jwtSection["SecretKey"];
    if (!string.IsNullOrWhiteSpace(configuredSecret) && !IsPlaceholder(configuredSecret))
    {
        return configuredSecret;
    }

    if (!environment.IsDevelopment())
    {
        throw new InvalidOperationException("Jwt:SecretKey must be configured outside development.");
    }

    Log.Warning("Jwt:SecretKey is missing or placeholder-based. Using an ephemeral development key for this process.");
    return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}

static bool IsPlaceholder(string value) =>
    value.Contains("CHANGE_THIS", StringComparison.OrdinalIgnoreCase) ||
    value.Contains("__SET_", StringComparison.OrdinalIgnoreCase) ||
    value.Contains("dev-only-secret-key", StringComparison.OrdinalIgnoreCase);

static string GetRateLimitPartitionKey(HttpContext context)
{
    var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(forwardedFor))
    {
        var first = forwardedFor.Split(',')[0].Trim();
        if (!string.IsNullOrWhiteSpace(first))
        {
            return first;
        }
    }

    return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}

public partial class Program { }
