import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
// locally test run with Url https://localhost:7154/positionHub for positionHub
class SignalRService {
  public connection: HubConnection;

  constructor() {
    this.connection = new HubConnectionBuilder().withUrl('http://localhost:5235/positionHub', {
        skipNegotiation: true, 
        transport: 1, 
      })
      .build();

    this.connection.on("ReceiveMessage", (message: string) => {
      console.log("Message received from server:", message);
      this.notifyClients(message);
    });

    this.startConnection();
  }

  private async startConnection() {
    try {
      await this.connection.start();
      console.log("SignalR connection established.");
    } catch (error) {
      console.error("Error while starting connection:", error);
      setTimeout(() => this.startConnection(), 5000); 
    }
  }

  private notifyClients(message: string) {
    document.dispatchEvent(new CustomEvent('signalr-message', { detail: message }));
  }
}

export const signalRService = new SignalRService();
