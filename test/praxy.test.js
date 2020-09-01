const Praxy = require('../index')
const assetServer = require('./support/assetServer')

describe('Praxy proxying', () => {
  describe('asset proxying', () => {
    beforeEach((done) => {
      // assetServer.start(done)
    })
  })

  xit('proxies images to the ASSET_HOST variable', (done) => {
    const config = {}
    const env = {
      ASSET_HOST: 'http://localhost:5003',
      PORT: 3003
    }
    const proxy = new Praxy(config, env)

    proxy
      .start()
      .then(() => {
        // request
      })
  })

  it('proxies css to the ASSET_HOST variable')
  it('proxies js to the ASSET_HOST variable')
})
