const http = require('http')
const {
  createServer,
  startServer,
  stopServer
} = require('./serverParts')
const notFound = require('./notFound')
const getMapsFromConfig = require('./getMapsFromConfig')
const loggers = require('./loggers')

const normalizeConfig = (config) => {
  const normalized = {...config}
  normalized.routes = config.routes || []
  normalized.logger = config.logger || loggers.create()
  return normalized
}

const routeGenerator = (config) => () => (req, res) => {
  config = normalizeConfig(config)
  const route = findRoute(config.routes, req.url)
  
  if (!route) {
    return notFound(res)
  }
  
  return proxyRequest(req, res, config, route)
}

const findRoute = (routes, path) => {
  return routes.find((route) => path.match(new RegExp(route.regex)))
}

const proxyRequest = (req, res, config, route) => {
  req.pause()

  const proxyRequest = createProxyRequest(route, req, res)

  req.pipe(proxyRequest)
  req.resume()
}

const createProxyRequest = (route, req, res) => {
  const options = proxyRequestOptions(route, req)

  return http.request(options, (proxyRes) => {
    proxyRes.pause()
    res.writeHeader(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
    proxyRes.resume()
  })
}

const proxyRequestOptions = (route, req) => {
  const urlOptions = new URL(`${route.service}${req.url}`)
  return {
    method: req.method,
    headers: req.headers,
    href: urlOptions.href,
    origin: urlOptions.origin,
    protocol: urlOptions.protocol,
    username: urlOptions.username,
    password: urlOptions.password,
    host: urlOptions.host,
    hostname: urlOptions.hostname,
    port: parseInt(urlOptions.port),
    path: urlOptions.pathname,
    search: urlOptions.search,
    hash: urlOptions.hash
  }
}

class Server {
  constructor(config) {
    this.config = config || {}
    this.server = createServer(routeGenerator(this.config))
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