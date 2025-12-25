using Microsoft.EntityFrameworkCore;
using UserTasks.Worker;
using UserTasks.Worker.Data;
using UserTasks.Worker.Messaging;

var builder = Host.CreateApplicationBuilder(args);

// ---- Config ----
builder.Services.Configure<RabbitMqOptions>(
    builder.Configuration.GetSection("RabbitMq"));

// ---- DB ----
builder.Services.AddDbContext<WorkerDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseSqlServer(cs);
});

// ---- RabbitMQ ----
builder.Services.AddSingleton<ReminderPublisher>();
builder.Services.AddSingleton<ReminderConsumer>();

// ---- Worker ----
builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
