const successResponse = (res, contentType, contents, status=200) => {
  res.writeHead(status, {'Content-Type': contentType})
  res.write(contents)
  res.end()
}

module.exports = successResponse
