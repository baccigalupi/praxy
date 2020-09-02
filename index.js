const StaticServer = require('./lib/StaticServer')
const fileMapper = require('./lib/fileMapper')

class Praxy {
  constructor(config, env) {
    this.config = config
    this.env = env
  }
}

Praxy.StaticServer = StaticServer
Praxy.fileMapper = fileMapper

module.exports = Praxy
