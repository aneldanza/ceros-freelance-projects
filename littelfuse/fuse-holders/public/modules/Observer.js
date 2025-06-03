define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observable = exports.Observer = void 0;
    class Observer {
        constructor() {
            this.subscribers = new Set();
        }
        subscribe(fn) {
            this.subscribers.add(fn);
        }
        notify(value) {
            this.subscribers.forEach((fn) => fn(value));
        }
    }
    exports.Observer = Observer;
    class Observable extends Observer {
        constructor(initialValue) {
            super();
            this._value = initialValue;
        }
        get value() {
            return this._value;
        }
        set value(newVal) {
            if (this._value !== newVal) {
                this._value = newVal;
                this.notify(this._value);
            }
        }
    }
    exports.Observable = Observable;
});
