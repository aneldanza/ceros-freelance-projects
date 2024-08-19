export class Observer {
  constructor() {
    this.subscribers = {};
  }

  subscribe(eventType, callback) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }
    this.subscribers[eventType].push(callback);
  }

  notify(eventType, data) {
    if (this.subscribers[eventType]) {
      this.subscribers[eventType].forEach((callback) => callback(data));
    }
  }
}
