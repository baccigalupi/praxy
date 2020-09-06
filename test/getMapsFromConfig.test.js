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

      assetServer = new Praxy.StaticServer(mapper)
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
        routes: [
          { 
            regex: '.*',
            service: `http://localhost:${assetPort}`
          }
        ]
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

    it('will return just the url for a service if the service does not provide a map', (done) => {
      const config = {
        routes: [
          {
            regex: '/assets/.*',
            service: 'https://www.google.com'
          },
          { 
            regex: '.*',
            service: `http://localhost:${assetPort}`
          }
        ]
      }

      getMapsFromConfig(config)
        .then((services) => {
          assert.equal(services.length, 2)
          const map = services.find((service) => {
            return service.url === 'https://www.google.com'
          })
          assert.deepEqual(Object.keys(map), ['url'])
          done()
        })
        .catch((err) => done(err))
    })
  })
})
