# node-simpletsdb

## Installation

```
npm install node-simpletsdb
```

## API

#### Object: `SimpleTSDB`

###### Parameters: `options`

`options` has the following properties:

| Field            | Type   | Description                                                        |
|:---------------- |:------:|:------------------------------------------------------------------ |
|`host`            |`string`|The host used to connect to SimpleTSDB                              |
|`port`            |`number`|The port used to connect to SimpleTSDB                              |
|`insertBufferSize`|`number`|_optional:_ The buffer size used by insertPoints. Defaults to 65536.|

###### Example:

```javascript
const { SimpleTSDB } = require('node-simpletsdb');

const db = new SimpleTSDB({
  host: '127.0.0.1',
  port: 8981,
});
```

#### Function: `metricExists`

###### Parameters: `options`

`options` has the following properties:
| Field            | Type   | Description                                            |
|:---------------- |:------:|:------------------------------------------------------ |
|`metric`          |`string`|The name of the metric to check for existence.          |

#### Function: `deleteMetric`

###### Parameters: `options`

`options` has the following properties:

|`metric`|`string`|The name of the metric to delete.|

#### Function: `createMetric`

###### Parameters: `options`

`options` has the following properties:

| Field            | Type   | Description                                            |
|:---------------- |:------:|:------------------------------------------------------ |
|`metric`          |`string`|The name of the metric to create.                       |
|`tags`            |`array` |_optional:_ The tags to associate with this metric.     |

###### Example:

```javascript
db.createMetric({
  metric: 'test0',
  tags: ['id']
})
.then(() => console.log('successfully created metric'))
.catch(err => console.error(err));
```

#### Function: `insertPoint`

###### Parameters: `point`

###### Example:

```javascript
const { Point } = require('node-simpletsdb');

db.insertPoint(new Point({
  metric: 'test0',
  value: 99,
  tags: {
    'id': '2',
  },
  timestamp: Date.now() * 1000000, // SimpleTSDB uses nanoseconds
}))
.then(() => console.log('successfully inserted point'))
.catch(err => console.error(err));
```

#### Function: `insertPoints`

###### Parameters: `points`

The same as `insertPoint` but takes an array of points.

#### Function: `queryPoints`

###### Parameters: `query`

`query` has the following properties:

| Field       | Type   | Description                                                      |
|:----------- |:------:|:---------------------------------------------------------------- |
|`metric`     |`string`|The metric to query.                                              |
|`start`      |`number`|The timestamp in nanoseconds for the start of the query.          |
|`end`        |`number`|_optional:_ The timestamp in nanoseconds for the end of the query.|
|`tags`       |`object`|_optional:_ Key/value pairs to add criteria to the query.         |
|`window`     |`object`|_optional:_ Windowing options.                                    |
|`aggregators`|`array` |_optional:_ An array of aggregators.                              |

###### Example:

```javascript
db.queryPoints({
  metric: 'test0',
  start: (Date.now() - 360000) * 1000000, // SimpleTSDB uses nanoseconds
  window: {
    every: '1m',
  }
})
.then(points => console.log(points))
.catch(err => console.error(err));
```

#### Function: `deletePoints`

###### Parameters: `options`

`options` has the following properties:

| Field       | Type   | Description                                                      |
|:----------- |:------:|:---------------------------------------------------------------- |
|`metric`     |`string`|The metric to query.                                              |
|`start`      |`number`|The timestamp in nanoseconds for the start of the query.          |
|`end`        |`number`|The timestamp in nanoseconds for the end of the query.            |
|`tags`       |`object`|_optional:_ Key/value pairs to add criteria to the query.         |

###### Example:

```javascript
db.deletePoints({
  metric: 'test0',
  start: (Date.now() - 36000) * 1000000, // SimpleTSDB uses nanoseconds
  end: Date.now() * 1000000
})
.then(() => console.log('successfully deleted points'))
.catch(err => console.error(err));
```

## TODO

Add some sort of time library to make working with timestamps easier.