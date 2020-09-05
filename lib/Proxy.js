const axios = require('axios')

const notFound = require('./notFound')
const PromisedServer = require('./PromisedServer')

const routes = (config) => (req, res) => {
  notFound(res)
}

const isUnique = (value, index, collection) => (
  collection.indexOf(value) === index
)

const services = (config) => {
  return Object.values(config)
    .flat()
    .filter(isUnique)
}

const mapPromises = (config) => {
  services(config)
    .map((service) => {
      return () => axios.get(`${service}/${mapRequest}`)
    })
}


const getMaps = (config) => Promise.allSettled(mapPromises(config))

class Server extends PromisedServer {
  constructor(routesHandler, config) {
    super(routesHandler)
    this.config = config
  }

  start(port = 3000) {
    return super
      .start(port)
      .then(() => this.loadProxyMaps())
  }

  loadProxyMaps() {
    return getMaps(this.config)
  }
}

module.exports = (config) => new Server(() => routes(config))
