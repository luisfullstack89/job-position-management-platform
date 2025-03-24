using Microsoft.Extensions.Hosting;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace JobPositionAPI.Services
{
    public class RabbitMqConsumerService : IHostedService
    {
        private readonly IConnection _rabbitMqConnection;
        private readonly IModel _channel;
        private readonly string _queueName = "position_updates";

        public RabbitMqConsumerService()
        {
            //var factory = new ConnectionFactory() { HostName = "localhost", Port = 5672 }; // this config is used for the rabbitMQ local testing
            var factory = new ConnectionFactory() { HostName = "rabbitmq" }; // this for docker testing
            _rabbitMqConnection = factory.CreateConnection();
            _channel = _rabbitMqConnection.CreateModel();

            _channel.QueueDeclare(queue: _queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            var consumer = new EventingBasicConsumer(_channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                Console.WriteLine($"Received message: {message}");
            };

            _channel.BasicConsume(queue: _queueName, autoAck: true, consumer: consumer);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _channel.Close();
            _rabbitMqConnection.Close();

            return Task.CompletedTask;
        }
    }
}
