const StaticServer = require('./lib/StaticServer')
const fileMapper = require('./lib/fileMapper')
const Proxy = require('./lib/Proxy')

Proxy.StaticServer = StaticServer
Proxy.fileMapper = fileMapper

module.exports = Proxy
