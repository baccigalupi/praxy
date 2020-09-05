const getMapsFromConfig = require('../lib/getMapsFromConfig')
const Praxy = require('../index')

const assert = require('assert')
const path = require('path')

describe('Praxy getMapsFromConfig', () => {
  describe('servers supporting `/__praxy.json` protocol', () => {
    let assetServer
    const assetPort = 5005

    beforeEach((done) => {
      const mapper = Praxy.fileMapper({
        root: path.resolve(`${__dirname}/support/static`),
        type: 'load-time'
      })

      assetServer = Praxy.StaticServer(mapper)
      assetServer
        .start(assetPort)
        .then(() => done())
        .catch((err) => done(err))
    })

    afterEach((done) => {
      assetServer.stop().then(() => done())
    })

    it('will proxy any request in the map to that server', (done) => {
      const config = {
        '*': [`http://localhost:${assetPort}`]
      }
      
      getMapsFromConfig(config)
        .then((services) => {
          assert.equal(services.length, 1)
          const map = services[0]
          assert.equal(map.files.length, 3)
          assert(map.files.includes('/hello.json'))
          assert(map.files.includes('/refresh.svg'))
          assert(map.files.includes('/hello/world.json'))
          assert.equal(map.url, `http://localhost:${assetPort}`)
          done()
        })
        .catch((err) => done(err))
    })
  })
})