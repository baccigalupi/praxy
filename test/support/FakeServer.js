const {
  createServer,
  startServer,
  stopServer,
  aggregateBody
} = require('../../lib/serverParts')
const { MAP_REQUEST } = require('../../lib/mapRequest')
const successResponse = require('../../lib/successResponse')
const notFoundResponse = require('../../lib/notFound')

const praxyingRoutes = () => (req, res) => {
  if (req.url === MAP_REQUEST) {
    contents = JSON.stringify({
      files: [
        '/hello.json',
        '/hello/world.json'
      ]
    })
    return successResponse(res, 'application/json', contents)
  }

  routes()(req, res)
}

const routes = () => (req, res) => {
  return aggregateBody(req)
    .then((stringBody) => {
      const body = JSON.parse(stringBody || "{}")
      const status = body.status || 200
      const contentType = body.contentType || 'application/json'
      res.writeHead(status, {'Content-Type': contentType})
      res.write(stringBody)
      res.end()
    })
    .catch(() => notFoundResponse(res))
}

class FakeServer {
  constructor(options) {
    options = options || { praxying: false }
    const praxying = { options }
    const routeGenerator = praxying ? praxyingRoutes : routes
    this.server = createServer(routeGenerator)
  }

  start(port = 3000) {
    return startServer(this.server, port)
  }

  stop() {
    return stopServer(this.server)
  }
}

module.exports = FakeServer
