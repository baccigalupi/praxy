const axios = require('axios')
const {
  createServer,
  startServer,
  stopServer
} = require('./severWrappers')
const notFound = require('./notFound')
const successResponse = require('./successResponse')
const getMapsFromConfig = require('./getMapsFromConfig')

const routes = (config) => () => (req, res) => {
  const path = req.url
  const route = findRoute(config, path)
  
  if (!route) {
    return notFound(res)
  }
  
  return proxyRequest(route, path, res)
}

const findRoute = (config, path) => {
  const routes = config.routes || []

  return routes.find((route) => {
    return path.match(new RegExp(route.regex))
  })
}

const normalizePathPart = (part) => {
  if (part[0] !== '/' && !part.match(/^http/)) {
    part = `/${part}`
  }

  if (part[part.length - 1] === '/') {
    part = part.slice(0, part.length - 2)
  }

  return part
}

const resourceUri = (service, path) => {
  return `${normalizePathPart(service)}${normalizePathPart(path)}`
}

const proxyRequest = (route, path, res) => {
  const url = resourceUri(route.service, path)

  return axios
    .get(url)
    .then((response) => {
      return {
        contents: response.data, 
        contentType: response.headers['content-type']
      }
    })
    .then(({contents, contentType}) => {
      return successResponse(res, contentType, contents)
    })
    .catch((_err) => {
      notFound(res)
    })
}

class Server {
  constructor(config) {
    this.config = config || {}
    this.server = createServer(routes(this.config))
  }

  start(port = 3000) {
    return startServer(this.server, port)
      .then(() => this.loadProxyMaps())
  }

  loadProxyMaps() {
    return getMapsFromConfig(this.config)
      .then((maps) => {
        this.config.maps = maps
      })
  }

  stop() {
    return stopServer(this.server)
  }
}

module.exports = Server
