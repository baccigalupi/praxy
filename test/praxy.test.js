const Praxy = require('../index')

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const axios = require('axios')

const removeFile = promisify(fs.unlink)
const createFile = promisify(fs.writeFile)

describe('Praxy', () => {
  xit('stops and starts via promises', (done) => {
    const port = 3003
    const server = Praxy({}, {PORT: port})
    server
      .start(port)
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => done(err))
  })

  describe('servers supporting `/__praxy.json` protocol', () => {
    const removedFilename = 'hello.json'
    let assetServer
    const assetPort = 5005

    beforeEach((done) => {
      const mapper = Praxy.fileMapper({
        root: path.resolve(`${__dirname}/support/static`),
        type: 'load-time'
      })

      // start and preload the asset server with map
      assetServer = Praxy.StaticServer(mapper)
      assetServer
        .start(assetPort)
        .then(() => axios.get(`http://localhost:${assetPort}/refresh.svg`))
        .then(() => done())
        .catch((err) => done(err))
    })

    afterEach((done) => {
      assetServer.stop().then(() => done())
    })

    afterEach((done) => {
      createFile(
        `${__dirname}/support/static/${removedFilename}`, 
        JSON.stringify({hello: "World"})
      ).then(() => done())
    })

    it('will get the map of files for a server', (done) => {
      const port = 3003
      const config = {
        routes: [
          { 
            matcher: '*',
            service: `http://localhost:${assetPort}`
          }
        ]
      }

      const server = Praxy(config)
      server
        .start(port)
        .then(() => {
          assert.equal(server.maps.length, 1)
          assert.equal(server.maps[0].url, `http://localhost:${assetPort}`)
        })
        .then(() => {
          server.stop()
          done()
        })
        .catch((err) => {
          server.stop()
          done(err)
        })
    })

    xit('will proxy any request in the map to that server', (done) => {
      const port = 3003
      const config = {
        routes: [
          { 
            matcher: '*',
            service: `http://localhost:${assetPort}`
          }
        ]
      }

      const server = Praxy(config)
      server
        .start(port)
        .then(() => axios.get(`http://localhost:${port}/refresh.svg`))
        .then((response) => assert.equal(response.status, 200))
        .then(() => {
          server.stop()
          done()
        })
        .catch((err) => {
          server.stop()
          done(err)
        })
    })

    xit('will 404 for any requests not found in the map', () => {
      const port = 3003
      const server = Praxy({}, {PORT: port})
      server
        .start(port)
        .then(() => axios.get(`http://localhost:${port}/not-here.json`))
        .catch((error) => assert.equal(error.response.status, 404))
        .then(() => done())
    })

    xit('will passthrough 404s by the downstream service', (done) => {
      const port = 3003
      const server = Praxy({}, {PORT: port})
      server
        .start(port)
        .then(() => {
          return removeFile(`${__dirname}/support/static/${removedFilename}`)
        })
        .then(() => axios.get(`http://localhost:${port}/${removedFilename}.svg`))
        .catch((error) => assert(error.response.status, 404))
        .then(() => done())
    })
  })
})
