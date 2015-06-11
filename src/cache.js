// k = key, v = value, e = (cache) entry
export default class Cache {
  constructor(size=5) {
    this.cache = [];
    this.size = size;
  }

  get(k) {
    let v;

    this.cache.forEach(e => {
      if (e.k === k) {
        v = e.v;
      }
    });

    return v;
  }

  set(k, v) {
    this.cache.push({
      k: k,
      v: v
    });

    if (this.cache.length > this.size) {
      this.cache.shift();
    }
  }
}
