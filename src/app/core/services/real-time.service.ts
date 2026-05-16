import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment.prod';
import { LoginService } from '../../features/booking/components/services/login.service';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
    private hubConnection: signalR.HubConnection | undefined;
    protected readonly baseUrl = environment.chatApiUrl;
      private loginService = inject(LoginService);

 constructor() {}
 public startConnection = () => {
  const cleanToken = this.loginService.getToken();
console.log('Starting SignalR connection with token:', cleanToken);
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${this.baseUrl}/tripChatHub`, {
      accessTokenFactory: () => cleanToken ?? '',
      skipNegotiation: false,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.ServerSentEvents |
        signalR.HttpTransportType.LongPolling
    })
    .build();

  this.hubConnection
    .start()
    .then(() => console.log('SignalR Connection started'))
    .catch(err => console.log('Error establishing SignalR connection: ', err));
};

  public addMessageListener = () => {
    this.hubConnection?.on('ReceiveMessage', (user: string, message: string) => {
      console.log(`User: ${user}, Message: ${message}`);
    });
  }

 
}
