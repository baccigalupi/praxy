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

  echoRoutes()(req, res)
}

const echoRoutes = () => (req, res) => {
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
  constructor() {
    this.createServer()
  }

  createServer() {
    throw new Error('createServer not implemented')
  }

  start(port = 5005) {
    return startServer(this.server, port)
  }

  stop() {
    return stopServer(this.server)
  }
}

class EchoServer extends FakeServer {
  createServer() {
    this.server = createServer(echoRoutes)
  }
}

class PraxyingEchoServer extends FakeServer {
  createServer() {
    this.server = createServer(praxyingRoutes)
  }
}

module.exports = {
  EchoServer,
  PraxyingEchoServer
}
