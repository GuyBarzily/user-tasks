using System.Net.Sockets;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// -------------------- Global exception handler --------------------
app.UseExceptionHandler(errApp =>
{
    errApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILoggerFactory>()
            .CreateLogger("GlobalExceptionHandler");
        logger.LogError(ex, "Unhandled exception");

        context.Response.ContentType = "application/problem+json";

        var (status, title) = ex switch
        {
            SqlException => (StatusCodes.Status503ServiceUnavailable, "Database is unavailable. Please try again in a moment."),
            TimeoutException => (StatusCodes.Status504GatewayTimeout, "Request timed out. Please try again."),
            _ => (StatusCodes.Status500InternalServerError, "Something went wrong. Please try again.")
        };

        context.Response.StatusCode = status;

        await context.Response.WriteAsJsonAsync(new { title, status });
    });
});

app.UseCors("DevCors");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // NOTE: keep HTTP in dev unless you really need HTTPS
    // app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

// -------------------- Apply migrations on startup (NO dotnet-ef needed) --------------------
var applyMigrations = app.Configuration.GetValue("ApplyMigrationsOnStartup", true);
if (applyMigrations)
{
    await ApplyMigrationsWithRetryAsync(app.Services, app.Logger);
}

app.Run();

static async Task ApplyMigrationsWithRetryAsync(IServiceProvider services, ILogger logger)
{
    const int maxAttempts = 20;
    var delay = TimeSpan.FromSeconds(3);

    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            logger.LogInformation(
                "Applying EF Core migrations (attempt {Attempt}/{MaxAttempts})...",
                attempt, maxAttempts);

            await db.Database.MigrateAsync();

            logger.LogInformation("EF Core migrations applied successfully.");
            return;
        }
        catch (Exception ex) when (
            ex is SqlException ||
            ex is SocketException ||
            ex is TimeoutException)
        {
            logger.LogWarning(
                null,
                "Database not ready yet (attempt {Attempt}/{MaxAttempts}). Retrying in {DelaySeconds}s...",
                attempt, maxAttempts, delay.TotalSeconds);

            await Task.Delay(delay);
        }
        catch (Exception ex)
        {
            // REAL errors should fail fast
            logger.LogError(ex, "Migration failed with non-transient error.");
            throw;
        }
    }

    throw new Exception("SQL Server did not become ready in time. Migrations not applied.");
}
public partial class Program { }
