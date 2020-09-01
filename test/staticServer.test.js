const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const axios = require('axios')
const Server = require('../lib/StaticServer')
const fileMapper = require('../lib/fileMapper')
const removeFile = promisify(fs.unlink)
const createFile = promisify(fs.writeFile)

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
    const newFilename = 'new.json'
    const removedFilename = 'hello.json'

    beforeEach((done) => {
      const mapper = fileMapper({
        root: path.resolve(`${__dirname}/support/static`),
        type: 'load-time'
      })
      startServer(mapper).then(() => done())
    })

    afterEach((done) => {
      removeFile(`${__dirname}/support/static/${newFilename}`)
        .then(() => done())
        .catch(() => done())
    })

    afterEach((done) => {
      createFile(
        `${__dirname}/support/static/${removedFilename}`, 
        JSON.stringify({hello: "World"})
      ).then(() => done())
    })

    afterEach((done) => {
      server.stop().then(() => done())
    })

    it('finds resources that have not changed since load time', (done) => {
      axios.get(`http://localhost:${port}/refresh.svg`)
        .then((response) => {
          assert.equal(response.status, 200)
        })
        .catch((err) => done(err))
        .then(() => done())
    })

    it('returns a 404 for files created after load time', (done) => {
      axios.get(`http://localhost:${port}/refresh.svg`)
        .then((response) => assert.equal(response.status, 200))
        .then(() => createFile(
          `${__dirname}/support/static/${newFilename}`, 
          JSON.stringify({bright: 'and shiny!'})
        ))  
        .then(() => console.log)    
        .then(() => axios.get(`http://localhost:${port}/${newFilename}`))
        .catch((error) => {
          assert.equal(error.response.status, 404)
        })
        .then(() => done())
    })

    it('returns a 404 for files that existed before load, that have been since deleted', (done) => { 
      axios.get(`http://localhost:${port}/${removedFilename}`)
        .then((response) => assert.equal(response.status, 200))
        .then(() => removeFile(`${__dirname}/support/static/${removedFilename}`))
        .then(() => axios.get(`http://localhost:${port}/${removedFilename}`))
        .catch((error) => assert.equal(error.response.status, 404))
        .then(done)
    })
  })

  describe('with a per-request mapper', () => {
    const newFilename = 'new.json'
    const removedFilename = 'hello.json'

    beforeEach((done) => {
      const mapper = fileMapper({
        root: path.resolve(`${__dirname}/support/static`)
      })
      startServer(mapper).then(() => done())
    })

    afterEach((done) => {
      removeFile(`${__dirname}/support/static/${newFilename}`)
        .then(() => done())
        .catch(() => done())
    })

    afterEach((done) => {
      createFile(
        `${__dirname}/support/static/${removedFilename}`, 
        JSON.stringify({hello: "World"})
      ).then(() => done())
    })

    afterEach((done) => {
      server.stop().then(() => done())
    })

    it('finds files created since load time', (done) => {
      createFile(
        `${__dirname}/support/static/${newFilename}`, 
        JSON.stringify({bright: 'and shiny!'})
      )
        .then(() => axios.get(`http://localhost:${port}/${newFilename}`))
        .then((response) => assert.equal(response.status, 200))
        .then(() => done())
        .catch(done)
    })

    it('returns 404 on files deleted', (done) => {
      removeFile(`${__dirname}/support/static/${removedFilename}`)
        .then(() => axios.get(`http://localhost:${port}/${removedFilename}`))
        .catch((error) => assert.equal(error.response.status, 404))
        .then(done)
    })
  })
})