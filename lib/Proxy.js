const axios = require('axios')
const {
  createServer,
  startServer,
  stopServer
} = require('./severWrappers')
const notFound = require('./notFound')
const getMapsFromConfig = require('./getMapsFromConfig')

const routes = (config) => () => (req, res) => {
  notFound(res)
}

class Server {
  constructor(config) {
    this.config = config
    this.server = createServer(routes(config))
  }

  start(port = 3000) {
    return startServer(this.server, port)
    .then(() => this.loadProxyMaps())
  }

  loadProxyMaps() {
    return getMapsFromConfig(this.config)
      .then((maps) => { this.maps = maps })
  }

  stop() {
    return stopServer(this.server)
  }
}

module.exports = (config) => new Server(config)
