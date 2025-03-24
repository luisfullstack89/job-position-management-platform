using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using JobPositionAPI.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;

namespace JobPositionAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionsController : ControllerBase
    {
        private readonly JobPositionsContext _context;
        private readonly IHubContext<PositionHub> _hubContext;
        private readonly IConnection _rabbitMqConnection;
        public PositionsController(JobPositionsContext context, IHubContext<PositionHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
            //var factory = new ConnectionFactory() { HostName = "localhost", Port = 5672 }; // this config is to test rabbitMQ locally
            var factory = new ConnectionFactory() { HostName = "rabbitmq" }; // this for docker testing
            _rabbitMqConnection = factory.CreateConnection();
        }

        // GET: api/Positions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Position>>> GetPositions()
        {
            return await _context.Positions.ToListAsync();
        }

        // GET: api/Positions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Position>> GetPosition(int id)
        {
            var position = await _context.Positions.FindAsync(id);

            if (position == null)
            {
                return NotFound();
            }

            return position;
        }

        // PUT: api/Positions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPosition(int id, Position position)
        {
            if (id != position.PositionID)
            {
                return BadRequest();
            }

            if (!PositionExists(id))
            {
                return NotFound();
            }

            if (await _context.Positions.AnyAsync(p => p.PositionNumber == position.PositionNumber && p.PositionID != id))
            {
                return BadRequest("Position number must be unique.");
            }

            if (position.Budget < 0)
            {
                return BadRequest("Budget must be a non-negative value.");
            }

            _context.Entry(position).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("ReceiveMessage", "A position has been updated!");
                PublishToRabbitMq("A position has been updated!");

            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PositionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Positions
        [HttpPost]
        public async Task<ActionResult<Position>> PostPosition(Position position)
        {
            if (await _context.Positions.AnyAsync(p => p.PositionNumber == position.PositionNumber))
            {
                return BadRequest("Position number must be unique.");
            }

            if (position.Budget < 0)
            {
                return BadRequest("Budget must be a non-negative value.");
            }

            _context.Positions.Add(position);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "A new position has been created!");
            PublishToRabbitMq("A new position has been created!");
            return CreatedAtAction("GetPosition", new { id = position.PositionID }, position);
        }

        // DELETE: api/Positions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePosition(int id)
        {
            var position = await _context.Positions.FindAsync(id);
            if (position == null)
            {
                return NotFound();
            }

            _context.Positions.Remove(position);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "A position has been deleted!");
            PublishToRabbitMq("A position has been deleted!");
            return NoContent();
        }

        private bool PositionExists(int id)
        {
            return _context.Positions.Any(e => e.PositionID == id);
        }
        private void PublishToRabbitMq(string message)
        {
            using (var channel = _rabbitMqConnection.CreateModel())
            {
                channel.QueueDeclare(queue: "position_updates", durable: false, exclusive: false, autoDelete: false, arguments: null);

                var body = Encoding.UTF8.GetBytes(message);

                channel.BasicPublish(exchange: "", routingKey: "position_updates", basicProperties: null, body: body);
            }
        }
    }
}
