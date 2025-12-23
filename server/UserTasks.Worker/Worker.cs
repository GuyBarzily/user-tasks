using Microsoft.EntityFrameworkCore;
using UserTasks.Worker.Data;
using UserTasks.Worker.Messaging;

namespace UserTasks.Worker;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _config;
    private readonly ReminderPublisher _publisher;
    private readonly ReminderConsumer _consumer;

    public Worker(
        ILogger<Worker> logger,
        IServiceScopeFactory scopeFactory,
        IConfiguration config,
        ReminderPublisher publisher,
        ReminderConsumer consumer)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
        _config = config;
        _publisher = publisher;
        _consumer = consumer;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var pollSeconds = _config.GetValue("Worker:PollSeconds", 30);
        var batchSize = _config.GetValue("Worker:BatchSize", 50);

        // init rabbit
        await _publisher.InitializeAsync(stoppingToken);
        await _consumer.InitializeAsync(stoppingToken);

        _logger.LogInformation("Worker started. RabbitMQ connected.");

        // start consuming in background
        _ = _consumer.StartConsumingAsync(
            msg =>
            {
                _logger.LogInformation("Hi your Task is due {TaskId} ({Title})", msg.TaskId, msg.Title);
                return Task.CompletedTask;
            },
            stoppingToken
        );

        // polling loop
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(pollSeconds));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await PublishOverdueTasksBatch(batchSize, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Worker loop error");
            }
        }
    }
    private async Task PublishOverdueTasksBatch(int batchSize, CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<WorkerDbContext>();

        var nowUtc = DateTime.UtcNow;

        var overdue = await db.Tasks
            .Where(t =>
                t.ReminderSentUtc == null &&
                t.DueDateUtc != null &&
                t.DueDateUtc <= nowUtc
            )
            .OrderBy(t => t.DueDateUtc)
            .Take(batchSize)
            .ToListAsync(ct);

        if (overdue.Count == 0)
            return;

        foreach (var task in overdue)
        {
            await _publisher.PublishAsync(
                new ReminderMessage(task.Id, task.Title, task.DueDateUtc!.Value),
                ct
            );

            // idempotency flag
            task.ReminderSentUtc = nowUtc;
        }

        await db.SaveChangesAsync(ct);

        _logger.LogInformation("Published {Count} reminder(s)", overdue.Count);
    }

}
