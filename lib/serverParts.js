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

const aggregateBody = (req) => {
  const body = []
  return new Promise((resolve, reject) => {
    req.on('error', (err) => reject(err))
    req.on('data', (chunk) => {
      body.push(chunk)
    })
    req.on('end', () => {
      resolve(Buffer.concat(body).toString())
    })
  })
}

module.exports = {
  createServer,
  startServer,
  stopServer,
  aggregateBody
}