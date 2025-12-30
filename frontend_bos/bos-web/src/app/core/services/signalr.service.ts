import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private orderCreated$ = new Subject<any>();
  private orderStatusChanged$ = new Subject<OrderStatusUpdate>();
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.startConnection();
    this.registerHandlers();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5179/hubs/orders', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.connectionPromise = this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.error('SignalR Connection Error: ', err));

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR Reconnecting...');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR Reconnected');
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR Connection Closed');
    });
  }

  private registerHandlers() {
    if (!this.hubConnection) return;

    this.hubConnection.on('OrderCreated', (order) => {
      console.log('Order Created via SignalR:', order);
      this.orderCreated$.next(order);
    });

    this.hubConnection.on('OrderStatusChanged', (data: OrderStatusUpdate) => {
      console.log('Order Status Changed via SignalR:', data);
      this.orderStatusChanged$.next(data);
    });
  }

  async joinOrderGroup(orderId: string) {
    if (!this.hubConnection) return;

    await this.connectionPromise;
    this.hubConnection.invoke('JoinOrderGroup', orderId)
      .catch(err => console.error('Error joining order group:', err));
  }

  async leaveOrderGroup(orderId: string) {
    if (!this.hubConnection) return;

    this.hubConnection.invoke('LeaveOrderGroup', orderId)
      .catch(err => console.error('Error leaving order group:', err));
  }

  async joinTenantGroup(tenantId: string) {
    if (!this.hubConnection) return;

    await this.connectionPromise;
    this.hubConnection.invoke('JoinTenantGroup', tenantId)
      .then(() => console.log(`Joined tenant group: ${tenantId}`))
      .catch(err => console.error('Error joining tenant group:', err));
  }

  async leaveTenantGroup(tenantId: string) {
    if (!this.hubConnection) return;

    this.hubConnection.invoke('LeaveTenantGroup', tenantId)
      .catch(err => console.error('Error leaving tenant group:', err));
  }

  onOrderCreated() {
    return this.orderCreated$.asObservable();
  }

  onOrderStatusChanged() {
    return this.orderStatusChanged$.asObservable();
  }

  disconnect() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}
