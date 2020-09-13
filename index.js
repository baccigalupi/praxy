const StaticServer = require('./lib/StaticServer')
const fileMapper = require('./lib/fileMapper')
const Proxy = require('./lib/HttpProxy')

Proxy.StaticServer = StaticServer
Proxy.fileMapper = fileMapper

module.exports = Proxy
