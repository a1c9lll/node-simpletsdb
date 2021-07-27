const { before, describe, it } = require('mocha');
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();
const { expect } = chai;

const { SimpleTSDB, Point } = require('../index');

const db = new SimpleTSDB({
  host: '127.0.0.1',
  port: 8981,
});

before(async () => {
  try {
    await db.deleteMetric({ metric: 'test0' });
  } catch(ignored) {
  }
});

describe('GET /metric_exists', function testMetricExists() {
  it('should return an object with an exists property', () => {
    return db.metricExists({ metric: 'test0' }).should.eventually.have.property('exists');
  });

  it('should throw due to options not being object', () => {
    return (() => db.metricExists()).should.throw(TypeError);
  });

  it('should throw due to name being empty', () => {
    return db.metricExists({ metric: '' }).should.eventually.rejectedWith(Error);
  });
});

describe('POST /create_metric', function testCreateMetric() {
  it('should be fulfilled successfully', () => {
    return db.createMetric({
      metric: 'test0',
      tags: ['id']
    }).should.be.fulfilled;
  });

  it('should be rejected as it\'s a duplicate', () => {
    return db.createMetric({
      metric: 'test0',
      tags: ['id']
    }).should.be.rejectedWith(Error);
  });

  it('should throw a TypeError', () => {
    return (() => db.createMetric()).should.throw(TypeError);
  });

  it('should throw an options.metric Error', () => {
    return (() => db.createMetric({})).should.throw(Error);
  });
});

describe('GET /delete_metric', function testDeleteMetric() {
  it('should be fulfilled successfully', () => {
    return db.deleteMetric({ metric: 'test0' }).should.eventually.fulfilled;
  });

  it('should throw a 404 error', () => {
    return db.deleteMetric({ metric: 'test0' }).should.eventually.rejectedWith(Error);
  });

  it('should throw a TypeError', () => {
    return (() => db.deleteMetric()).should.throw(TypeError);
  });

  it('should throw an options.metric Error', () => {
    return (() => db.deleteMetric({})).should.throw(Error);
  });
});

describe('POST /insert_points', function testInsertPoints() {
  it('should throw due to points not being array', () => {
    return (() => db.insertPoints(1)).should.throw(TypeError);
  })

  it('should be fulfilled successfully', () => {
    const points = [];
    for(let i = 0; i < 100; i++) {
      points[i] = new Point({
        metric: 'test0',
        value: i,
        tags: {
          'id': '2',
        },
        timestamp: (Date.now()-i*1000)*1000000,
      })
    }
    return db.createMetric({
      metric: 'test0',
      tags: ['id']
    }).then(() => db.insertPoints(points)).should.eventually.fulfilled;
  }).timeout(10000);

  it('should be rejected due to metric being nonexistent', () => {
    return db.insertPoints([new Point({
      metric: 'test999zx',
      value: 1,
      timestamp: Date.now() * 1000000
    })]).should.eventually.rejectedWith(Error);
  });
});

describe('POST /query_points', function testQueryPoints() {
  it('should be fulfilled successfully', () => {
    return db.queryPoints({
      metric: 'test0',
      start: (Date.now() - 60*1000*60) * 1000000
    }).then(points => {
      if(points.length !== 100) {
        throw Error('expected 100 points');
      }
    }).should.eventually.fulfilled;
  }).timeout(10000);

  it('should throw due to no args', () => {
    return (() => db.queryPoints()).should.throw(Error);
  });

  it('should throw due to no metric name', () => {
    return (() => db.queryPoints({})).should.throw(Error);
  });

  it('should throw due to no start argument', () => {
    return (() => db.queryPoints({name: 'test0'})).should.throw(Error);
  });

  it('should throw due to tags not being an array', () => {
    return (() => db.queryPoints({
      metric: 'test0',
      start: 0,
      tags: 'abc'
    })).should.throw(TypeError);
  });

  it('should throw due to window not being an object', () => {
    return (() => db.queryPoints({
      metric: 'test0',
      start: 0,
      window: 'abc'
    })).should.throw(TypeError);
  });

  it('should throw due to aggregators not being an array', () => {
    return (() => db.queryPoints({
      metric: 'test0',
      start: Date.now() - 36000,
      window: {
        every: '1m',
      },
      aggregators: 'abc'
    })).should.throw(TypeError);
  });

  it('should be rejected due to invalid metric name', () => {
    return db.queryPoints({
      metric: 'a b',
      start: (Date.now() - 60*1000*60) * 1000000
    }).should.eventually.rejectedWith(Error);
  });

  it('should be rejected due to metric being nonexistent', () => {
    return db.queryPoints({
      metric: 'sfsdfdf3f',
      start: (Date.now() - 60*1000*60) * 1000000
    }).should.eventually.rejectedWith(Error);
  });
});

describe('POST /delete_points', function testDeletePoints() {
  it('should be fulfilled successfully', () => {
    return db.deletePoints({
      metric: 'test0',
      start: (Date.now() - 60*1000*60) * 1000000,
      end: Date.now() * 1000000
    }).then(() => db.queryPoints({
      metric: 'test0',
      start: (Date.now() - 60*1000*60) * 1000000
    }))
    .then(points => {
      if(points.length !== 0) {
        throw Error('expected 0 points');
      }
    })
    .should.eventually.fulfilled;
  });

  
  it('should throw due to no args', () => {
    return (() => db.deletePoints()).should.throw(Error);
  });

  it('should throw due to no metric name', () => {
    return (() => db.deletePoints({})).should.throw(Error);
  });

  it('should throw due to no start argument', () => {
    return (() => db.deletePoints({name: 'test0'})).should.throw(Error);
  });

  it('should throw due to no end argument', () => {
    return (() => db.deletePoints({
      name: 'test0',
      start: 0
    })).should.throw(Error);
  });

  it('should throw due to tags not being an array', () => {
    return (() => db.deletePoints({
      metric: 'test0',
      start: 0,
      end: 0,
      tags: 'abc'
    })).should.throw(TypeError);
  });
});