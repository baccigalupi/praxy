const PromisedServer = require('./lib/PromisedServer')
const StaticServer = require('./lib/StaticServer')
const fileMapper = require('./lib/fileMapper')

const routes = () => (req, res) => {
  res.statusCode = 404
  res.end()
}

const Praxy = (config, env) => new PromisedServer(() => routes)

Praxy.StaticServer = StaticServer
Praxy.fileMapper = fileMapper

module.exports = Praxy
