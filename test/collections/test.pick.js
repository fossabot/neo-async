/* global it */
'use strict';

var assert = require('assert');
var domain = require('domain');

var _ = require('lodash');
var parallel = require('mocha.parallel');

var async = global.async || require('../../');
var delay = require('../config').delay;
var util = require('../util');

function pickIterator(order) {

  return function(value, callback) {

    var self = this;
    var num = _.isArray(value) ? _.last(value) : value;

    setTimeout(function() {

      if (self && self.round) {
        num = self.round(num);
      }
      order.push(value);
      callback(null, num % 2);
    }, num * delay);
  };
}

function pickIteratorWithKey(order) {

  return function(value, key, callback) {

    var self = this;
    var num = _.isArray(value) ? _.last(value) : value;

    setTimeout(function() {

      if (self && self.round) {
        num = self.round(num);
      }
      order.push([value, key]);
      callback(null, num % 2);
    }, num * delay);
  };
}

parallel('#pick', function() {

  it('should execute iterator by collection of array', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.pick(collection, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 3
      });
      assert.deepEqual(order, [1, 2, 3, 4]);
      done();
    });
  });

  it('should execute iterator by collection of array with passing index', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.pick(collection, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 3
      });
      assert.deepEqual(order, [
        [1, 0],
        [2, 2],
        [3, 1],
        [4, 3]
      ]);
      done();
    });
  });

  it('should execute iterator by collection of object', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.pick(collection, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        b: 3
      });
      assert.deepEqual(order, [2, 3, 4]);
      done();
    });
  });

  it('should execute iterator by collection of object with passing key', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.pick(collection, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        b: 3
      });
      assert.deepEqual(order, [
        [2, 'c'],
        [3, 'b'],
        [4, 'a']
      ]);
      done();
    });
  });

  it('should execute iterator by collection of Set', function(done) {

    var order = [];
    var set = new util.Set();
    set.add(4);
    set.add(3);
    set.add(2);
    async.pick(set, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': 3
      });
      assert.deepEqual(order, [2, 3, 4]);
      done();
    });
  });

  it('should execute iterator by collection of Set with passing key', function(done) {

    var order = [];
    var set = new util.Set();
    set.add(4);
    set.add(3);
    set.add(2);
    async.pick(set, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': 3
      });
      assert.deepEqual(order, [
        [2, 2],
        [3, 1],
        [4, 0]
      ]);
      done();
    });
  });

  it('should execute iterator by collection of Map', function(done) {

    var order = [];
    var map = new util.Map();
    map.set('a', 4);
    map.set('b', 3);
    map.set('c', 2);
    async.pick(map, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': ['b', 3]
      });
      assert.deepEqual(order, [
        ['c', 2],
        ['b', 3],
        ['a', 4]
      ]);
      done();
    });
  });

  it('should execute iterator by collection of Map with passing key', function(done) {

    var order = [];
    var map = new util.Map();
    map.set('a', 4);
    map.set('b', 3);
    map.set('c', 2);
    async.pick(map, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': ['b', 3]
      });
      assert.deepEqual(order, [
        [['c', 2], 2],
        [['b', 3], 1],
        [['a', 4], 0]
      ]);
      done();
    });
  });

  it('should execute iterator without binding', function(done) {

    var order = [];
    var collection = {
      a: 1.1,
      b: 3.5,
      c: 2.6
    };

    async.pick(collection, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1.1,
        b: 3.5,
        c: 2.6
      });
      assert.deepEqual(order, [1.1, 2.6, 3.5]);
      done();
    }, Math);
  });

  it('should throw error', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    var iterator = function(num, callback) {
      setTimeout(function() {
        order.push(num);
        callback(num === 3, num % 2);
      }, num * delay);
    };

    async.pick(collection, iterator, function(err, res) {
      assert.ok(err);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1
      });
      assert.deepEqual(order, [1, 2, 3]);
      done();
    });
  });

  it('should throw error', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 3,
      c: 2,
      d: 4
    };
    var iterator = function(num, callback) {
      setTimeout(function() {
        order.push(num);
        callback(num === 3, num % 2);
      }, num * delay);
    };

    async.pick(collection, iterator, function(err, res) {
      assert.ok(err);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1
      });
      assert.deepEqual(order, [1, 2, 3]);
      done();
    });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [2, 1, 3];
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pick(collection, iterator);
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [2, 1, 3];
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pick(collection, iterator, function(err, res) {
          if (err) {
            return done(err);
          }
          assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
          assert.deepEqual(res, {});
        });
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = {
          a: 4,
          b: 3,
          c: 2
        };
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pick(collection, iterator);
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = {
          a: 4,
          b: 3,
          c: 2
        };
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pick(collection, iterator, function(err, res) {
          if (err) {
            return done(err);
          }
          assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
          assert.deepEqual(res, {});
        });
      });
  });

  it('should return response immediately if array is empty', function(done) {

    var order = [];
    var array = [];
    async.pick(array, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if object is empty', function(done) {

    var order = [];
    var object = {};
    async.pick(object, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is function', function(done) {

    var order = [];
    async.pick(function() {}, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is undefined', function(done) {

    var order = [];
    async.pick(undefined, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is null', function(done) {

    var order = [];
    async.pick(null, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

});

parallel('#pickSeries', function() {

  it('should execute iterator to series by collection of array', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.pickSeries(collection, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 3
      });
      assert.deepEqual(order, [1, 3, 2, 4]);
      done();
    });
  });

  it('should execute iterator to series by collection of array with passing index', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    async.pickSeries(collection, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 3
      });
      assert.deepEqual(order, [
        [1, 0],
        [3, 1],
        [2, 2],
        [4, 3]
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of object', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.pickSeries(collection, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        b: 3
      });
      assert.deepEqual(order, [4, 3, 2]);
      done();
    });
  });

  it('should execute iterator to series by collection of object with passing key', function(done) {

    var order = [];
    var collection = {
      a: 4,
      b: 3,
      c: 2
    };
    async.pickSeries(collection, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        b: 3
      });
      assert.deepEqual(order, [
        [4, 'a'],
        [3, 'b'],
        [2, 'c']
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of Set', function(done) {

    var order = [];
    var set = new util.Set();
    set.add(4);
    set.add(3);
    set.add(2);
    async.pickSeries(set, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': 3
      });
      assert.deepEqual(order, [4, 3, 2]);
      done();
    });
  });

  it('should execute iterator to series by collection of Set with passing key', function(done) {

    var order = [];
    var set = new util.Set();
    set.add(4);
    set.add(3);
    set.add(2);
    async.pickSeries(set, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': 3
      });
      assert.deepEqual(order, [
        [4, 0],
        [3, 1],
        [2, 2]
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of Map', function(done) {

    var order = [];
    var map = new util.Map();
    map.set('a', 4);
    map.set('b', 3);
    map.set('c', 2);
    async.pickSeries(map, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': ['b', 3]
      });
      assert.deepEqual(order, [
        ['a', 4],
        ['b', 3],
        ['c', 2]
      ]);
      done();
    });
  });

  it('should execute iterator to series by collection of Map with passing key', function(done) {

    var order = [];
    var map = new util.Map();
    map.set('a', 4);
    map.set('b', 3);
    map.set('c', 2);
    async.pickSeries(map, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': ['b', 3]
      });
      assert.deepEqual(order, [
        [['a', 4], 0],
        [['b', 3], 1],
        [['c', 2], 2]
      ]);
      done();
    });
  });

  it('should execute iterator to series without binding', function(done) {

    var order = [];
    var collection = {
      a: 1.1,
      b: 3.5,
      c: 2.6
    };

    async.pickSeries(collection, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1.1,
        b: 3.5,
        c: 2.6
      });
      assert.deepEqual(order, [1.1, 3.5, 2.6]);
      done();
    }, Math);
  });

  it('should execute on asynchronous', function(done) {

    var sync = true;
    var collection = {
      a: 1,
      b: 3,
      c: 2
    };
    var iterator = function(n, key, callback) {
      callback(null, n % 2);
    };
    async.pickSeries(collection, iterator, function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(sync, false);
      assert.deepEqual(res, {
        a: 1,
        b: 3
      });
      done();
    });
    sync = false;
  });

  it('should throw error', function(done) {

    var order = [];
    var collection = [1, 3, 2, 4];
    var iterator = function(num, callback) {
      setTimeout(function() {
        order.push(num);
        callback(num === 3, num % 2);
      }, num * delay);
    };

    async.pickSeries(collection, iterator, function(err, res) {
      assert.ok(err);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1
      });
      assert.deepEqual(order, [1, 3]);
      done();
    });
  });

  it('should throw error', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 3,
      c: 2,
      d: 4
    };
    var iterator = function(num, callback) {
      setTimeout(function() {
        order.push(num);
        callback(num === 3, num % 2);
      }, num * delay);
    };

    async.pickSeries(collection, iterator, function(err, res) {
      assert.ok(err);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1
      });
      assert.deepEqual(order, [1, 3]);
      done();
    });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [2, 1, 3];
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickSeries(collection, iterator);
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [2, 1, 3];
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickSeries(collection, iterator, function(err, res) {
          if (err) {
            return done(err);
          }
          assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
          assert.deepEqual(res, {});
        });
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = {
          a: 4,
          b: 3,
          c: 2
        };
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickSeries(collection, iterator);
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = {
          a: 4,
          b: 3,
          c: 2
        };
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickSeries(collection, iterator, function(err, res) {
          if (err) {
            return done(err);
          }
          assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
          assert.deepEqual(res, {});
        });
      });
  });

  it('should return response immediately if array is empty', function(done) {

    var order = [];
    var array = [];
    async.pickSeries(array, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.deepEqual(res, []);
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if object is empty', function(done) {

    var order = [];
    var object = {};
    async.pickSeries(object, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is function', function(done) {

    var order = [];
    async.pickSeries(function() {}, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is undefined', function(done) {

    var order = [];
    async.pickSeries(undefined, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is null', function(done) {

    var order = [];
    async.pickSeries(null, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

});

parallel('#pickLimit', function() {

  it('should execute iterator in limited by collection of array', function(done) {

    var order = [];
    var collection = [1, 5, 3, 2, 4];

    async.pickLimit(collection, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 5,
        '2': 3
      });
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of array with passing index', function(done) {

    var order = [];
    var collection = [1, 5, 3, 2, 4];

    async.pickLimit(collection, 2, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 5,
        '2': 3
      });
      assert.deepEqual(order, [
        [1, 0],
        [3, 2],
        [5, 1],
        [2, 3],
        [4, 4]
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of object', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 5,
      c: 3,
      d: 2,
      e: 4
    };
    async.pickLimit(collection, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1,
        b: 5,
        c: 3
      });
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of object with passing key', function(done) {

    var order = [];
    var collection = {
      a: 1,
      b: 5,
      c: 3,
      d: 2,
      e: 4
    };
    async.pickLimit(collection, 2, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1,
        b: 5,
        c: 3
      });
      assert.deepEqual(order, [
        [1, 'a'],
        [3, 'c'],
        [5, 'b'],
        [2, 'd'],
        [4, 'e']
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Set', function(done) {

    var order = [];
    var set = new util.Set();
    set.add(1);
    set.add(5);
    set.add(3);
    set.add(2);
    set.add(4);
    async.pickLimit(set, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 5,
        '2': 3
      });
      assert.deepEqual(order, [1, 3, 5, 2, 4]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Set with passing key', function(done) {

    var order = [];
    var set = new util.Set();
    set.add(1);
    set.add(5);
    set.add(3);
    set.add(2);
    set.add(4);
    async.pickLimit(set, 2, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 5,
        '2': 3
      });
      assert.deepEqual(order, [
        [1, 0],
        [3, 2],
        [5, 1],
        [2, 3],
        [4, 4]
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Map', function(done) {

    var order = [];
    var map = new util.Map();
    map.set('a', 1);
    map.set('b', 5);
    map.set('c', 3);
    map.set('d', 2);
    map.set('e', 4);
    async.pickLimit(map, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': ['a', 1],
        '1': ['b', 5],
        '2': ['c', 3]
      });
      assert.deepEqual(order, [
        ['a', 1],
        ['c', 3],
        ['b', 5],
        ['d', 2],
        ['e', 4]
      ]);
      done();
    });
  });

  it('should execute iterator in limited by collection of Map with passing key', function(done) {

    var order = [];
    var map = new util.Map();
    map.set('a', 1);
    map.set('b', 5);
    map.set('c', 3);
    map.set('d', 2);
    map.set('e', 4);
    async.pickLimit(map, 2, pickIteratorWithKey(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': ['a', 1],
        '1': ['b', 5],
        '2': ['c', 3]
      });
      assert.deepEqual(order, [
        [['a', 1], 0],
        [['c', 3], 2],
        [['b', 5], 1],
        [['d', 2], 3],
        [['e', 4], 4]
      ]);
      done();
    });
  });

  it('should execute iterator in limited without binding', function(done) {

    var order = [];
    var collection = {
      a: 1.1,
      b: 3.5,
      c: 2.7
    };

    async.pickLimit(collection, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        a: 1.1,
        b: 3.5,
        c: 2.7
      });
      assert.deepEqual(order, [1.1, 3.5, 2.7]);
      done();
    }, Math);
  });

  it('should execute like parallel if limit is Infinity', function(done) {

    var order = [];
    var collection = [1, 3, 4, 2, 3, 1, 3];

    async.pickLimit(collection, Infinity, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '0': 1,
        '1': 3,
        '4': 3,
        '5': 1,
        '6': 3
      });
      assert.deepEqual(order, [1, 1, 2, 3, 3, 3, 4]);
      done();
    });
  });

  it('should execute on asynchronous', function(done) {

    var sync = true;
    var collection = {
      a: 1,
      b: 3,
      c: 2,
      d: 4,
      e: 5
    };
    var iterator = function(n, key, callback) {
      callback(null, n % 2);
    };
    async.pickLimit(collection, 2, iterator, function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(sync, false);
      assert.deepEqual(res, {
        a: 1,
        b: 3,
        e: 5
      });
      done();
    });
    sync = false;
  });

  it('should throw error', function(done) {

    var order = [];
    var collection = {
      a: 2,
      b: 1,
      c: 3
    };
    var iterator = function(num, callback) {
      setTimeout(function() {
        order.push(num);
        callback(num === 2, num);
      }, num * delay);
    };
    async.pickLimit(collection, 4, iterator, function(err, res) {
      assert.ok(err);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        b: 1
      });
      assert.deepEqual(order, [1, 2]);
      done();
    });
  });

  it('should throw error', function(done) {

    var order = [];
    var collection = [2, 1, 3];
    var iterator = function(num, callback) {
      setTimeout(function() {
        order.push(num);
        callback(num === 2, num);
      }, num * delay);
    };
    async.pickLimit(collection, 4, iterator, function(err, res) {
      assert.ok(err);
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {
        '1': 1
      });
      assert.deepEqual(order, [1, 2]);
      done();
    });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [2, 1, 3];
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickLimit(collection, 4, iterator);
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = [2, 1, 3];
        var iterator = function(item, index, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickLimit(collection, 4, iterator, function(err, res) {
          if (err) {
            return done(err);
          }
          assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
          assert.deepEqual(res, {});
        });
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = {
          a: 2,
          b: 1,
          c: 3
        };
        var iterator = function(item, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickLimit(collection, 4, iterator);
      });
  });

  it('should throw error if double callback', function(done) {

    var errorCallCount = 0;
    setTimeout(function() {
      assert.strictEqual(errorCallCount, 3);
      done();
    }, delay);

    domain.create()
      .on('error', util.errorChecker)
      .on('error', function() {
        errorCallCount++;
      })
      .run(function() {
        var collection = {
          a: 2,
          b: 1,
          c: 3
        };
        var iterator = function(item, index, callback) {
          process.nextTick(callback);
          process.nextTick(callback);
        };
        async.pickLimit(collection, 4, iterator, function(err, res) {
          if (err) {
            return done(err);
          }
          assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
          assert.deepEqual(res, {});
        });
      });
  });

  it('should return response immediately if array is empty', function(done) {

    var order = [];
    var array = [];
    async.pickLimit(array, 3, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if object is empty', function(done) {

    var order = [];
    var object = {};
    async.pickLimit(object, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is function', function(done) {

    var order = [];
    async.pickLimit(function() {}, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is undefined', function(done) {

    var order = [];
    async.pickLimit(undefined, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if collection is null', function(done) {

    var order = [];
    async.pickLimit(null, 2, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if limit is zero', function(done) {

    var order = [];
    var collection = [1, 3, 2];
    async.pickLimit(collection, 0, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

  it('should return response immediately if limit is undefined', function(done) {

    var order = [];
    var collection = [1, 3, 2];
    async.pickLimit(collection, undefined, pickIterator(order), function(err, res) {
      if (err) {
        return done(err);
      }
      assert.strictEqual(Object.prototype.toString.call(res), '[object Object]');
      assert.deepEqual(res, {});
      assert.deepEqual(order, []);
      done();
    });
  });

});
