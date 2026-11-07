import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __appEventEmitter: AppEventEmitter | undefined;
}

export const orderEvents: AppEventEmitter =
  global.__appEventEmitter || new AppEventEmitter();

if (!global.__appEventEmitter) {
  global.__appEventEmitter = orderEvents;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyNewOrder(order: any) {
  try {
    orderEvents.emit('new-order', order);
  } catch (err) {
    console.error('Error emitting new order event:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyOrderUpdated(order: any) {
  try {
    orderEvents.emit('order-updated', order);
  } catch (err) {
    console.error('Error emitting order update event:', err);
  }
}

// Product Events for Instant Real-Time User Side Sync Without Refresh
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyProductCreated(product: any) {
  try {
    orderEvents.emit('product-created', product);
  } catch (err) {
    console.error('Error emitting product created event:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyProductUpdated(product: any) {
  try {
    orderEvents.emit('product-updated', product);
  } catch (err) {
    console.error('Error emitting product updated event:', err);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function notifyProductDeleted(data: { slug: string; id?: string }) {
  try {
    orderEvents.emit('product-deleted', data);
  } catch (err) {
    console.error('Error emitting product deleted event:', err);
  }
}
