# node-simpletsdb

## Installation

```
npm install node-simpletsdb
```

## API

#### SimpleTSDB

###### Parameters: `options`

`options` has the following properties:

|`host`|`string`|The host used to connect to SimpleTSDB|
|`port`|`number`|The port used to connect to SimpleTSDB|
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