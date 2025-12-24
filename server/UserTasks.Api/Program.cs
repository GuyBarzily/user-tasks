using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using UserTasks.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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

app.UseExceptionHandler(errApp =>
{
    errApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;

        // log full exception (server-side only)
        var logger = context.RequestServices.GetRequiredService<ILoggerFactory>()
            .CreateLogger("GlobalExceptionHandler");
        logger.LogError(ex, "Unhandled exception");

        context.Response.ContentType = "application/problem+json";

        // map known exceptions to nicer messages
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
app.UseCors("DevCors");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseHttpsRedirection();

}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
