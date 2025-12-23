using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace UserTasks.Worker.Messaging;

public class ReminderConsumer : IAsyncDisposable
{
    private readonly RabbitMqOptions _opts;
    private IConnection? _connection;
    private IChannel? _channel;

    public ReminderConsumer(IOptions<RabbitMqOptions> options)
    {
        _opts = options.Value;
    }

    public async Task InitializeAsync(CancellationToken ct)
    {
        if (_channel != null) return;

        var factory = new ConnectionFactory
        {
            HostName = _opts.Host,
            Port = _opts.Port,
            UserName = _opts.User,
            Password = _opts.Pass,
            AutomaticRecoveryEnabled = true
        };

        _connection = await factory.CreateConnectionAsync(ct);
        _channel = await _connection.CreateChannelAsync(cancellationToken: ct);

        await _channel.QueueDeclareAsync(
            queue: _opts.QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: ct
        );

        // Don’t flood one worker
        await _channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 10, global: false, cancellationToken: ct);
    }

    public async Task StartConsumingAsync(Func<ReminderMessage, Task> onMessage, CancellationToken ct)
    {
        if (_channel == null) throw new InvalidOperationException("Consumer not initialized");

        var consumer = new AsyncEventingBasicConsumer(_channel);

        consumer.ReceivedAsync += async (_, ea) =>
        {
            try
            {
                var json = Encoding.UTF8.GetString(ea.Body.ToArray());
                var msg = JsonSerializer.Deserialize<ReminderMessage>(json);

                if (msg != null)
                    await onMessage(msg);

                await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: ct);
            }
            catch
            {
                // Requeue true => try again later (good for transient errors)
                await _channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true, cancellationToken: ct);
            }
        };

        await _channel.BasicConsumeAsync(
            queue: _opts.QueueName,
            autoAck: false,
            consumer: consumer,
            cancellationToken: ct
        );
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null) await _channel.DisposeAsync();
        if (_connection != null) await _connection.DisposeAsync();
    }
}
