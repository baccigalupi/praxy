const successResponse = require('./successResponse')
const MAP_REQUEST = '/__praxy.json'

const mapResponse = (map, res) => {
  const contents = JSON.stringify({
    files: Object.keys(map)
  })
  successResponse(res, 'application/json', contents)
}

module.exports = {
  mapResponse,
  MAP_REQUEST
}