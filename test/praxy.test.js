const Praxy = require('../index')

describe('Praxy', () => {
  describe('servers supporting `/__map.json` protocol', () => {
    let assetServer
    const assetPort = 5005

    beforeEach((done) => {
      mapper = mapper || Praxy.fileMapper({
        root: path.resolve(`${__dirname}/support/static`)
      })

      assetServer = new Praxy.StaticServer(mapper)
      assetServer
        .start(assetPort)
        .then(() => done)
    })

    xit('')
  })
})
