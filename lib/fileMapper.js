const fs = require('fs')
const { resolve } = require('path')
const { promisify } = require('util')
const recursiveRead = require('recursive-readdir')

const read = promisify(fs.readFile)

class ItemInfo {
  constructor(file, root, caching) {
    this.file = file
    this.root = root
    this.caching = caching
  }

  key() {
    return this.file.replace(this.root, '')
  }

  read() {
    if (this.caching && this.cache()) {
      return Promise.resolve(this.cache())
    }

    return this.readAndCache()
  }

  readAndCache() {
    if (this.caching) {
      return read(this.file)
        .then((contents) => {
          this._cache = contents
          return this._cache
        })
    }

    return read(this.file)
  }

  cache() {
    return this._cache
  }
}

const pageMap = (root, caching) => (collection, file) => {
  const itemInfo = new ItemInfo(file, root, caching)
  collection[itemInfo.key()] = itemInfo
  return collection
}

const mapDirectory = ({ root, caching }) => () => {
  const staticRoot = resolve(root)
  return recursiveRead(staticRoot)
    .then((files) => files.reduce(pageMap(staticRoot, caching), {}))
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
    mapper = loadTime(options)
  } else if (type == 'caching') {
    mapper = loadTime({...options, caching: true})
  } else {
    mapper = dynamic(options)
  }

  return mapper
}

module.exports = typedMapper