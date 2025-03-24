using Microsoft.AspNetCore.SignalR;

namespace JobPositionAPI.Hubs
{
    public class PositionHub : Hub
    {
        public async Task BroadcastPositionChange(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }
    }
}
