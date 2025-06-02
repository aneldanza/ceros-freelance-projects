type Callback<T> = (value: T) => void;

export class Observer<T> {
  private subscribers: Set<Callback<T>> = new Set();

  subscribe(fn: Callback<T>) {
    this.subscribers.add(fn);
  }

  notify(value: T) {
    this.subscribers.forEach((fn) => fn(value));
  }
}
