import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment.prod';
import { LoginService } from '../../features/booking/components/services/login.service';
import { NotificationSoundService } from './notification-sound.service';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
    private hubConnection: signalR.HubConnection | undefined;
    private messageListenerAdded = false;
    protected readonly baseUrl = environment.chatApiUrl;
      private loginService = inject(LoginService);
      private notificationSound = inject(NotificationSoundService);

 constructor() {}
 public startConnection = () => {
  if (
    this.hubConnection?.state === signalR.HubConnectionState.Connected ||
    this.hubConnection?.state === signalR.HubConnectionState.Connecting
  ) {
    return;
  }

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

  this.messageListenerAdded = false;
  this.addMessageListener();

  this.hubConnection
    .start()
    .then(() => console.log('SignalR Connection started'))
    .catch(err => console.log('Error establishing SignalR connection: ', err));
};

  public addMessageListener = () => {
    if (!this.hubConnection || this.messageListenerAdded) return;

    this.messageListenerAdded = true;
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      console.log(`User: ${user}, Message: ${message}`);
      this.notificationSound.play('message');
    });
  }

 
}
