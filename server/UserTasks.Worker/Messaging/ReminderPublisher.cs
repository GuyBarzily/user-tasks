using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace UserTasks.Worker.Messaging;

public class ReminderPublisher : IAsyncDisposable
{
    private readonly RabbitMqOptions _opts;
    private IConnection? _connection;
    private IChannel? _channel;

    public ReminderPublisher(IOptions<RabbitMqOptions> options)
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
    }

    public async Task PublishAsync(ReminderMessage msg, CancellationToken ct)
    {
        if (_channel == null) throw new InvalidOperationException("Publisher not initialized");

        var json = JsonSerializer.Serialize(msg);
        var body = Encoding.UTF8.GetBytes(json);

        var props = new BasicProperties
        {
            DeliveryMode = DeliveryModes.Persistent // durable message
        };

        await _channel.BasicPublishAsync(
            exchange: "",
            routingKey: _opts.QueueName,
            mandatory: false,
            basicProperties: props,
            body: body,
            cancellationToken: ct
        );
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null) await _channel.DisposeAsync();
        if (_connection != null) await _connection.DisposeAsync();
    }
}
