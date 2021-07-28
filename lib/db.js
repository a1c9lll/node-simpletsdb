const { default: axios } = require('axios');
const { Buffer } = require('buffer');
const { Readable } = require('stream');

function SimpleTSDB(options) {
  this.host = options.host;
  this.port = options.port;
  this.insertBufferSize = options.insertBufferSize || 65536;
}

const isObject = obj => obj && typeof obj === 'object' && obj.constructor === Object;

SimpleTSDB.prototype.metricExists = function (options) {
  if (!isObject(options)) {
    throw TypeError('options must be an object');
  }
  if (!Object.hasOwnProperty.call(options, 'metric')) {
    throw Error('options.metric is required');
  }
  return axios({
    method: 'GET',
    url: `http://${this.host}:${this.port}/metric_exists?metric=${encodeURIComponent(options.metric)}`
  })
    .then(({ data }) => data)
    .catch(err => {
      if (err.response && err.response.status === 400) {
        throw Error(err.response.data.error);
      } else if (err.response && err.response.status === 500) {
        throw Error('internal server error');
      } else {
        throw Error(err);
      }
    });
}

SimpleTSDB.prototype.deleteMetric = function (options) {
  if (!isObject(options)) {
    throw TypeError('options must be an object');
  }
  if (!Object.hasOwnProperty.call(options, 'metric')) {
    throw Error('options.metric is required');
  }
  return axios({
    method: 'DELETE',
    url: `http://${this.host}:${this.port}/delete_metric`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      metric: options.metric,
    }
  })
    .catch(err => {
      if (err.response && err.response.status === 404) {
        throw Error(`metric doesn't exist`);
      } else if (err.response && err.response.status === 400) {
        throw Error(err.respone.data.error);
      } else {
        throw Error(err);
      }
    });
}

SimpleTSDB.prototype.createMetric = function (options) {
  if (!isObject(options)) {
    throw TypeError('options must be an object');
  }
  if (!Object.hasOwnProperty.call(options, 'metric')) {
    throw Error('options.metric is required');
  }
  if (Object.hasOwnProperty.call(options, 'tags') && !Array.isArray(options.tags)) {
    throw TypeError('options.tags must be array of strings');
  }
  return axios({
    method: 'POST',
    url: `http://${this.host}:${this.port}/create_metric`,
    data: {
      metric: options.metric,
      tags: options.tags
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .catch(err => {
      if (err.response && err.response.status === 409) {
        throw Error('metric already exists');
      } else if (err.response && err.response.status === 400) {
        throw Error(err.response.data.error);
      } else {
        throw Error(err);
      }
    })
}

SimpleTSDB.prototype.insertPoint = function (point) {
  return this.insertPoints([point]);
}

SimpleTSDB.prototype.insertPoints = function (points) {
  if (points.length === 0) {
    return Promise.resolve();
  }
  if (!Array.isArray(points)) {
    throw new TypeError('points must be array');
  }
  let i = 0;
  let offset = 0;
  const bufferSize = this.insertBufferSize;
  const buf = Buffer.alloc(bufferSize);
  const stream = new Readable({
    read() {
      for (; i < points.length; i++) {
        const str = points[i].toLineProtocol();
        if (str.length + offset + 1 >= bufferSize) {
          this.push(buf.slice(0, offset).toString());
          offset = 0;
          return;
        }
        buf.write(str, offset, str.length, 'utf8');
        offset += str.length;
        buf.write('\n', offset, 1, 'utf8');
        offset++;
      }
      this.push(buf.slice(0, offset).toString());
      this.push(null);
    }
  });
  return axios({
    method: 'POST',
    url: `http://${this.host}:${this.port}/insert_points`,
    headers: {
      'Content-Type': 'application/x.simpletsdb.points'
    },
    data: stream
  })
    .catch(err => {
      if (err.response && err.response.status === 400) {
        throw Error(err.response.data.error);
      } else if (err.response.status === 404) {
        throw Error('metric doesn\'t exist')
      } else {
        throw Error(err);
      }
    });
}

SimpleTSDB.prototype.queryPoints = function (query) {
  if (!isObject(query)) {
    throw TypeError('query must be an object');
  }
  if (!Object.hasOwnProperty.call(query, 'metric')) {
    throw Error('query.metric is required');
  }
  if (!Object.hasOwnProperty.call(query, 'start')) {
    throw Error('query.start is required');
  }
  if (Object.hasOwnProperty.call(query, 'tags') && !isObject(query.tags)) {
    throw TypeError('query.tags must be object');
  }
  if (Object.hasOwnProperty.call(query, 'window') && !isObject(query.window)) {
    throw TypeError('query.window must be object');
  }
  if (Object.hasOwnProperty.call(query, 'aggregators') && !Array.isArray(query.aggregators)) {
    throw TypeError('query.aggregators must be array');
  }
  return axios({
    method: 'POST',
    url: `http://${this.host}:${this.port}/query_points`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: query
  })
    .then(({ data }) => data)
    .catch(err => {
      if (err.response && err.response.status === 400) {
        throw Error(err.response.data.error);
      } else if (err.response.status === 404) {
        throw Error('metric doesn\'t exist')
      } else {
        throw Error(err);
      }
    });
}

SimpleTSDB.prototype.deletePoints = function (options) {
  if (!isObject(options)) {
    throw TypeError('options must be an object');
  }
  if (!Object.hasOwnProperty.call(options, 'metric')) {
    throw Error('options.metric is required');
  }
  if (!Object.hasOwnProperty.call(options, 'start')) {
    throw Error('options.start is required');
  }
  if (!Object.hasOwnProperty.call(options, 'end')) {
    throw Error('options.end is required');
  }
  if (Object.hasOwnProperty.call(options, 'tags') && !isObject(options.tags)) {
    throw TypeError('options.tags must be array of strings');
  }
  return axios({
    method: 'DELETE',
    url: `http://${this.host}:${this.port}/delete_points`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: options
  })
    .catch(err => {
      if (err.response && err.response.status === 400) {
        throw Error(err.response.data.error);
      } else if (err.response.status === 404) {
        throw Error('metric doesn\'t exist')
      } else {
        throw Error(err);
      }
    })
}

module.exports = SimpleTSDB;