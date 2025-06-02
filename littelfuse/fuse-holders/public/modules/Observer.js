define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observer = void 0;
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
});
