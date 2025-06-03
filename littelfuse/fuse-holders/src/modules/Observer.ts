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

export class Observable<T> extends Observer<T> {
  private _value: T;

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  get value() {
    return this._value;
  }

  set value(newVal: T) {
    if (this._value !== newVal) {
      this._value = newVal;
      this.notify(this._value);
    }
  }
}
