const axios = require('axios')
const winston = require('winston')
const {
  createServer,
  startServer,
  stopServer
} = require('./severWrappers')
const notFound = require('./notFound')
const successResponse = require('./successResponse')
const getMapsFromConfig = require('./getMapsFromConfig')

const createLocalLogger = () => {
  const consoleLogger = new winston.transports.Console()
  const { combine, label, timestamp, simple, colorize } = winston.format
  const logger = winston.createLogger({
    transports: [consoleLogger],
    format: combine(
      label({ label: 'Proxy' }),
      colorize(),
      timestamp(),
      simple()
    )
  })
  logger.level = 'debug'
  return logger
}

const normalizeConfig = (config) => {
  const normalized = {...config}
  normalized.routes = config.routes || []
  normalized.logger = config.logger || createLocalLogger()
  return normalized
}

const packageActionData = ({ req, res, config }) => {
  const { routes, logger } = normalizeConfig(config)
  return {
    path: req.url,
    req,
    res,
    logger,
    routes
  }
}

const routeGenerator = (config) => () => (req, res) => {
  const actionData = packageActionData({ req, res, config })
  actionData.route = findRoute(actionData)
  
  if (!actionData.route) {
    return notFound(res)
  }
  
  return proxyRequest(actionData)
}

const findRoute = ({ routes, path }) => {
  return routes.find((route) => path.match(new RegExp(route.regex)))
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

const respondWithSucces = ({ proxyResponse, url, res, logger }) => {
  const contents = proxyResponse.data
  const contentType = proxyResponse.headers['content-type']

  logger.info(`Proxy ${url} - status: ${proxyResponse.status}, content-type: ${contentType}`)

  return successResponse(res, contentType, contents)
}

const proxyRequest = (actionData) => {
  const { route, res, logger } = actionData
  actionData.url = resourceUri(route.service, actionData.path)
  logger.info(`Proxying ${actionData.path} => ${actionData.url}`)

  return axios
    .get(actionData.url)
    .then((response) => {
      actionData.proxyResponse = response
      respondWithSucces(actionData)
    })
    .catch((error) => {
      logger.error(error.message, error.stack)
      notFound(res)
    })
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
