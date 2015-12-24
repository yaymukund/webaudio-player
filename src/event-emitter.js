export default class EventEmitter {
  constructor() {
    this._handlers = {};
  }

  on(name, fn) {
    this._handlers[name] = this._handlers[name] || [];
    this._handlers[name].push(fn);
  }

  trigger(name) {
    this._handlers[name] = this._handlers[name] || [];
    this._handlers[name].forEach(fn => fn());
  }
}
