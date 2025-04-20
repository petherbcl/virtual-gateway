import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

class WebSocketService {
  private stompClient: Client | null = null;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  public connected$ = this.connectedSubject.asObservable();

  connect(onMessage: (message: IMessage) => void) {
    const socket = new SockJS('/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: () => {
        this.connectedSubject.next(true);
        this.stompClient?.subscribe('/topic/clients', onMessage);
      },
      onDisconnect: () => {
        this.connectedSubject.next(false);
      },
      reconnectDelay: 5000
    });
    this.stompClient.activate();
  }

  disconnect() {
    this.stompClient?.deactivate();
    this.connectedSubject.next(false);
  }
}

export const webSocketService = new WebSocketService();
