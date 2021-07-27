function Point(options) {
  this.metric = options.metric;
  this.tags = options.tags;
  this.value = options.value;
  this.timestamp = options.timestamp;
}

Point.prototype.toLineProtocol = function() {
  const tagsStr = this.tags !== undefined ?
    Object.entries(this.tags).map(([k, v]) => `${k}=${v}`).join(' ') : '';
  return `${this.metric},${tagsStr},${this.value} ${this.timestamp}`;
}

module.exports = Point;