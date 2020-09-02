const http = require('http')

class PromisedServer {
  constructor(routesHandler) {
    this.server = http.createServer(routesHandler())
  }

  start(port = 3000) {
    return new Promise((resolve, reject) => {
      this.server.listen(port, (err) => {
        if (err) {
          return reject(err)
        }

        return resolve(this.server)
      })
    })
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          return reject(err)
        }

        return resolve(this.server)
      })
    })
  }
}

module.exports = PromisedServer
