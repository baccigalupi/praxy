const http = require('http')

const createServer = (routesHandler) => {
  return http.createServer(routesHandler())
}

const startServer = (server, port) => {
  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) {
        return reject(err)
      }

      return resolve(server)
    })
  })
}

const stopServer = (server) => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        return reject(err)
      }

      return resolve(server)
    })
  })
}

module.exports = {
  createServer,
  startServer,
  stopServer
}