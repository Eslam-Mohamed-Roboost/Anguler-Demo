import { inject, Injectable } from '@angular/core';
import type * as SignalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment.prod';
import { AuthService } from './auth.service';
import { NotificationSoundService } from './notification-sound.service';

@Injectable({
  providedIn: 'root',
})
export class RealTimeService {
  private hubConnection: SignalR.HubConnection | undefined;
  private messageListenerAdded = false;
  private connectionStarting = false;
  protected readonly baseUrl = environment.chatApiUrl;
  private readonly authService = inject(AuthService);
  private readonly notificationSound = inject(NotificationSoundService);

  public startConnection = () => {
    void this.startConnectionAsync();
  }

  public addMessageListener = () => {
    if (!this.hubConnection || this.messageListenerAdded) return;

    this.messageListenerAdded = true;
    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      console.log(`User: ${user}, Message: ${message}`);
      this.notificationSound.play('message');
    });
  }

  private async startConnectionAsync(): Promise<void> {
    const signalR = await import('@microsoft/signalr');

    if (
      this.connectionStarting ||
      this.hubConnection?.state === signalR.HubConnectionState.Connected ||
      this.hubConnection?.state === signalR.HubConnectionState.Connecting
    ) {
      return;
    }

    this.connectionStarting = true;
    const cleanToken = this.authService.token();
    console.log('Starting SignalR connection with token:', cleanToken);
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/tripChatHub`, {
        accessTokenFactory: () => cleanToken ?? '',
        skipNegotiation: false,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents |
          signalR.HttpTransportType.LongPolling,
      })
      .build();

    this.messageListenerAdded = false;
    this.addMessageListener();

    try {
      await this.hubConnection.start();
      console.log('SignalR Connection started');
    } catch (err) {
      console.log('Error establishing SignalR connection: ', err);
    } finally {
      this.connectionStarting = false;
    }
  }
}
