const axios = require('axios')
const {
  createServer,
  startServer,
  stopServer,
  aggregateBody
} = require('./serverParts')
const notFound = require('./notFound')
const successResponse = require('./successResponse')
const getMapsFromConfig = require('./getMapsFromConfig')
const loggers = require('./loggers')

const normalizeConfig = (config) => {
  const normalized = {...config}
  normalized.routes = config.routes || []
  normalized.logger = config.logger || loggers.create()
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
  const contents = JSON.stringify(proxyResponse.data)
  const contentType = proxyResponse.headers['content-type']

  logger.info(`Proxy ${url} - status: ${proxyResponse.status}, content-type: ${contentType}`)

  return successResponse(res, contentType, contents, proxyResponse.status)
}

const proxyRequest = (actionData) => {
  const { route, req, logger } = actionData
  actionData.method = normalizeMethod(req.method)
  actionData.url = resourceUri(route.service, actionData.path)
  logger.info(`Proxying ${actionData.path} => ${actionData.url}`)

  if (actionData.method === 'post' || actionData.method === 'patch') {
    return proxyBodyRequest(actionData)
  } else {
    return proxySimpleRequest(actionData)
  }
}

const proxyBodyRequest = (actionData) => {
  aggregateBody(actionData.req)
    .then((body) => axios[actionData.method](actionData.url, body))
    .then((response) => {
      actionData.proxyResponse = response
      respondWithSucces(actionData)
    })
    .catch(handleRequestError(actionData))
}

const proxySimpleRequest = (actionData) => {
  return axios[actionData.method](actionData.url)
    .then((response) => {
      actionData.proxyResponse = response
      respondWithSucces(actionData)
    })
    .catch(handleRequestError(actionData))
}

const handleRequestError = (actionData) => (error) => {
  actionData.logger.error(error.message, error.stack)
  return notFound(actionData.res)
}

const normalizeMethod = (reqMethod) => {
  let method = reqMethod.toLowerCase()
  method = ['get', 'post', 'put', 'patch', 'head'].find((name) => {
    return name === method
  })
  return method || 'get'
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
