const assert = require('assert')
const path = require('path')

const axios = require('axios')
const Server = require('../lib/StaticServer')
const fileMapper = require('../lib/fileMapper')

describe('Praxy.StaticServer', () => {
  it('it stops and starts with promises', (done) => {
    const port = 3005
    const mapper = fileMapper({
      root: path.resolve(`${__dirname}/support/static`)
    })
    const server = new Server(mapper)

    server
      .start(port)
      .then(() => axios.get(`http://localhost:${port}/not-here`))
      .catch((error) => assert.equal(error.response.status, 404))
      .then(() => server.stop())
      .then(() => done())
  })

  it('returns a success response with body for root level paths', (done) => {
    const port = 3005
    const mapper = fileMapper({
      root: path.resolve(`${__dirname}/support/static`)
    })
    const server = new Server(mapper)

    server
      .start(port)
      .then(() => axios.get(`http://localhost:${port}/hello.json`))
      .then((response) => {
        assert.equal(response.status, 200)
        assert.deepEqual(response.data, {hello: 'World'})
        // assert.equal(response.headers['content-type'], 'application/json')
      })
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        server.stop()
        done(err)
      })
  })

  it('returns a success response with body for nested paths')
  it('returns a 404 when the path does not map to static file')
  it('uses the mime type for the file to generate the content type')

  describe('with a load-time mapper', () => {
    it('returns a 404 for files created after load time')
    it('returns a 404 for files that existed before load, that have been since deleted')
  })

  describe('with a per-request mapper', () => {
    it('finds files created since load time')
    it('returns 404 on files deleted')
  })
})