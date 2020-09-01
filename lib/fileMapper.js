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

module.exports = mapDirectory