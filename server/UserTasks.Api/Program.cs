using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
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

        await context.Response.WriteAsJsonAsync(new
        {
            title,
            status
        });
    });
});

bool enableSwagger = app.Configuration.GetValue("EnableSwagger", false);
bool enableHttpsRedirect = app.Configuration.GetValue("EnableHttpsRedirection", false);
bool applyMigrations = app.Configuration.GetValue("ApplyMigrationsOnStartup", true);

app.UseCors("DevCors");

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

if (applyMigrations)
{
    await ApplyMigrationsWithRetryAsync(app.Services, app.Logger);
}

app.Run();

static async Task ApplyMigrationsWithRetryAsync(IServiceProvider services, ILogger logger)
{
    const int maxAttempts = 10;
    var delay = TimeSpan.FromSeconds(3);

    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            logger.LogInformation("Applying EF Core migrations (attempt {Attempt}/{MaxAttempts})...", attempt, maxAttempts);
            await db.Database.MigrateAsync();
            logger.LogInformation("EF Core migrations applied successfully.");
            return;
        }
        catch (SqlException ex)
        {
            logger.LogWarning(ex, "SQL not ready yet (attempt {Attempt}/{MaxAttempts}). Retrying in {Delay}s...",
                attempt, maxAttempts, delay.TotalSeconds);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Migration failed with unexpected error.");
            throw;
        }

        await Task.Delay(delay);
    }

    throw new Exception("SQL Server did not become ready in time. Migrations not applied.");
}

public partial class Program { }
