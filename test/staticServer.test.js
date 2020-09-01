const assert = require('assert')
const path = require('path')

const axios = require('axios')
const Server = require('../lib/StaticServer')
const fileMapper = require('../lib/fileMapper')
const { start } = require('repl')

describe('Praxy.StaticServer', () => {
  const port = 3005
  let server

  const startServer = (mapper) => {
    mapper = mapper || fileMapper({
      root: path.resolve(`${__dirname}/support/static`)
    })
    server = new Server(mapper)
    return server.start(port)
  }

  it('it stops and starts with promises', (done) => {
    startServer()
      .then(() => axios.get(`http://localhost:${port}/not-here`))
      .then(() => server.stop())
      .then(() => done())
      .catch(() => {
        server.stop()
        done()
      })
  })

  it('returns a success response with body for root level paths', (done) => {
    startServer()
      .then(() => axios.get(`http://localhost:${port}/hello.json`))
      .then((response) => {
        assert.equal(response.status, 200)
        assert.deepEqual(response.data, {hello: 'World'})
        assert.equal(response.headers['content-type'], 'application/json')
      })
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        server.stop()
        done(err)
      })
  })

  it('returns a success response with body for nested paths', (done) => {
    startServer()
      .then(() => axios.get(`http://localhost:${port}/hello/world.json`))
      .then((response) => {
        assert.equal(response.status, 200)
        assert.deepEqual(response.data, {greetings: "earthling"})
        assert.equal(response.headers['content-type'], 'application/json')
      })
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        server.stop()
        done(err)
      })
  })

  it('returns a 404 when the path does not map to static file', (done) => {
    startServer()
      .then(() => axios.get(`http://localhost:${port}/not-here`))
      .catch((error) => assert.equal(error.response.status, 404))
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        server.stop()
        done(err)
      })
  })

  it('uses the mime type for the file to generate the content type', (done) => {
    startServer()
      .then(() => axios.get(`http://localhost:${port}/refresh.svg`))
      .then((response) => {
        assert.equal(response.headers['content-type'], 'image/svg+xml')
      })
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        server.stop()
        done(err)
      })
  })

  describe('with a load-time mapper', () => {
    it('returns a 404 for files created after load time')
    it('returns a 404 for files that existed before load, that have been since deleted')
  })

  describe('with a per-request mapper', () => {
    const port = 3005
    let server

    beforeEach((done) => {
      const mapper = fileMapper({
        root: path.resolve(`${__dirname}/support/static`)
      })
      server = new Server(mapper)
      server
        .start(port)
        .then(() => done())
    })

    afterEach((done) => {
      // remove new file
      // add back removed file
    })

    it('finds files created since load time')
    it('returns 404 on files deleted')
  })
})