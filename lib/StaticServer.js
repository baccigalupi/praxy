const mime = require('mime-types')
const PromisedServer = require('./PromisedServer')
const notFound = require('./notFound')
const successResponse = require('./successResponse')
const { mapResponse, MAP_REQUEST } = require('./mapRequest')

const routes = mapper => (req, res) => {
  mapper()
    .then((map) => action(map, req, res))
    .catch(() => notFound(res))
}

const action = (map, req, res) => {
  if (req.url === MAP_REQUEST) {
    return mapResponse(map, res)
  }

  const pathReader = map[req.url]
  if (pathReader) {
    return fileResponse(res, pathReader)
  } else {
    return notFound(res)
  }
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