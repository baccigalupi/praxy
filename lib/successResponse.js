const successResponse = (res, contentType, contents) => {
  res.writeHead(200, {'Content-Type': contentType})
  res.write(contents)
  res.end()
}

module.exports = successResponse
