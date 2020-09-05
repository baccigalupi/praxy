const axios = require('axios')
const { MAP_REQUEST } = require('./mapRequest')

const isUnique = (value, index, collection) => (
  collection.indexOf(value) === index
)

const packageData = (promises) => {
  return promises.map((promise) => promise.value)
}

const services = (config) => {
  return config
    .routes
    .map(({ service }) => service)
    .filter(isUnique)
}

const promises = (config) => {
  return services(config)
    .map(serviceToPromise)
}

const serviceToPromise = (url) => {
  return axios.get(`${url}${MAP_REQUEST}`)
    .then((response) => ({ ...response.data, url }))
    .catch(() => ({ url }))
}

const getMaps = (config) => {
  return Promise
    .allSettled(promises(config))
    .then(packageData)
}

module.exports = getMaps
