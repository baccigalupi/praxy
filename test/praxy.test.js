const Praxy = require('../index')

describe('Praxy', () => {
  it('stops and starts via promises', (done) => {
    const port = 3003
    const server = Praxy({}, {PORT: port})
    server
      .start(port)
      .then(() => axios.get(`http://localhost:${port}/not-here`))
      .catch(() => {
        server.stop()
        done()
      })
  })

  describe('servers supporting `/__praxy.json` protocol', () => {
    let assetServer
    const assetPort = 5005

    beforeEach((done) => {
      mapper = mapper || Praxy.fileMapper({
        root: path.resolve(`${__dirname}/support/static`)
      })

      assetServer = Praxy.StaticServer(mapper)
      assetServer
        .start(assetPort)
        .then(() => done)
    })
  })
})
