const fs = require('fs')
const http = require('http')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const mime = require('mime-types')

const action = mapper => (req, res) => {
  mapper()
    .then(map => {
      const path = map[req.url]
      if (path) {
        successResponse(res, path)
      } else {
        notFound(res)
      }
    })
}

const successResponse = (res, path) => {
  const contentType = mime.lookup(path)
  res.writeHead(200, {'Content-Type': contentType})
  readFile(path).then(contents => {
    res.write(contents)
    res.end()
  })
}

const notFound = (res) => {
  res.statusCode = 404
  res.end()
}

const createServer = (mapper) => {
  return http.createServer(action(mapper))
}

class Server {
  constructor(fileMapper) {
    this.server = createServer(fileMapper)
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

module.exports = Server