const http = require('http')
const mime = require('mime-types')

const action = mapper => (req, res) => {
  mapper()
    .then(map => {
      const pathReader = map[req.url]
      if (pathReader) {
        return successResponse(res, pathReader)
      } else {
        return notFound(res)
      }
    })
    .catch(() => notFound(res))
}

const successResponse = (res, pathReader) => {
  return pathReader
    .read()
    .then(contents => {
      const contentType = mime.lookup(pathReader.file)
      res.writeHead(200, {'Content-Type': contentType})
      res.write(contents)
      res.end()
    })
    .catch((err) => {
      notFound(res)
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