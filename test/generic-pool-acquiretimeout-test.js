var tap = require('tap')
var Pool = require('../lib/Pool')

tap.test('acquireTimeout handles timed out acquire calls', function (t) {
  var factory = {
    create: function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve({})
        }, 100)
      })
    },
    destroy: function () { return Promise.resolve() }
  }
  var config = {
    acquireTimeoutMillis: 20,
    idleTimeoutMillis: 150,
    log: false
  }

  var pool = new Pool(factory, config)

  pool.acquire()
  .then(function (resource) {
    t.fail('wooops')
  })
  .catch(function (err) {
    t.match(err, /ResourceRequest timed out/)
    return pool.drain()
  })
  .then(function () {
    return pool.clear()
  })
  .then(function () {
  })
  .then(t.end)
  .catch(t.error)
})

tap.test('acquireTimeout handles non timed out acquire calls', function (t) {
  var myResource = {}
  var factory = {
    create: function () {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(myResource)
        }, 10)
      })
    },
    destroy: function () { return Promise.resolve() }
  }

  var config = {
    acquireTimeoutMillis: 400
  }

  var pool = new Pool(factory, config)

  pool.acquire()
  .then(function (resource) {
    t.equal(resource, myResource)
    pool.release(resource)
    return pool.drain()
  })
  .then(function () {
    return pool.clear()
  })
  .then(t.end)
  .catch(t.error)
})
