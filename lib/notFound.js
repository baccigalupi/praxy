const notFound = (res) => {
  res.statusCode = 404
  res.end()
}

module.exports = notFound