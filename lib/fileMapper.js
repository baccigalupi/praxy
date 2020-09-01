const { resolve } = require('path')
const recursiveRead = require('recursive-readdir')

const pageMap = (root) => (collection, file) => {
  collection[file.replace(root, '')] = file  
  return collection
}

const mapDirectory = ({ root }) => () => {
  const staticRoot = resolve(root)
  return recursiveRead(staticRoot)
    .then((files) => files.reduce(pageMap(staticRoot), {}))
}

const dynamic = (options) => mapDirectory(options)

const loadTime = (options) => {
  let map

  return () => {
    if (map) {
      return Promise.resolve(map)
    }

    return mapDirectory(options)()
      .then((fileMap) => {
        map = fileMap
        return map
      })
  }
}

const typedMapper = (options) => {
  const { type } = options

  let mapper
  if (type == 'load-time') {
    mapper = loadTime
  } else {
    mapper = dynamic
  }

  return mapper(options)
}

module.exports = typedMapper