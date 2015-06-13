let handlers = {};

let on = function(name, fn) {
  handlers[name] = handlers[name] || [];
  handlers[name].push(fn);
};

let trigger = function(name) {
  handlers[name] = handlers[name] || [];
  handlers[name].forEach(fn => { fn(); });
};

export { on, trigger };
