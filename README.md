# node-simpletsdb

## Installation

```
npm install node-simpletsdb
```

## API

#### SimpleTSDB

###### Parameters: `options`

`options` has the following properties:

| Field            | Type   | Description                                            |
|:---------------- |:------:|:------------------------------------------------------ |
|`host`            |`string`|The host used to connect to SimpleTSDB                  |
|`port`            |`number`|The port used to connect to SimpleTSDB                  |
|`insertBufferSize`|`number`|The buffer size used by insertPoints. Defaults to 65536.|

Example:

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

|`metric`|`string`|The name of the metric to check for existence.|

#### Function: `deleteMetric`

###### Parameters: `options`

`options` has the following properties:

|`metric`|`string`|The name of the metric to delete.|

#### Function: `createMetric`

###### Parameters: `options`

`options` has the following properties:

|`metric`|`string`|The name of the metric to create.|
|`tags`|`array`|The tags to associate with this metric.|

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

|`metric`|`string`|The metric to query.|
|`start`|`number`|The timestamp in nanoseconds for the start of the query.|
|`end`|`number`|_optional:_ The timestamp in nanoseconds for the end of the query.|
|`tags`|`object`|Key/value pairs to add to the query.|
