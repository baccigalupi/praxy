const mime = require('mime-types')
const PromisedServer = require('./PromisedServer')
const notFound = require('./notFound')
const successResponse = require('./successResponse')

const MAP_REQUEST = '/__praxy.json'

const routes = mapper => (req, res) => {
  mapper()
    .then((map) => action(map, req, res))
    .catch(() => notFound(res))
}

const action = (map, req, res) => {
  if (req.url === MAP_REQUEST) {
    return mapRequest(map, res)
  }

  const pathReader = map[req.url]
  if (pathReader) {
    return fileResponse(res, pathReader)
  } else {
    return notFound(res)
  }
}

const mapRequest = (map, res) => {
  const contents = JSON.stringify({
    files: Object.keys(map)
  })
  successResponse(res, 'application/json', contents)
}

const fileResponse = (res, pathReader) => {
  return pathReader
    .read()
    .then(contents => {
      const contentType = mime.lookup(pathReader.file)
      successResponse(res, contentType, contents)
    })
    .catch(() => {
      notFound(res)
    })
}

module.exports = (mapper) => new PromisedServer(() => routes(mapper))