const Praxy = require('../index')

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const axios = require('axios')

const { EchoServer, PraxyingEchoServer } = require('./support/fakeServers')

const removeFile = promisify(fs.unlink)
const createFile = promisify(fs.writeFile)

describe('Praxy', () => {
  it('stops and starts via promises', (done) => {
    const port = 3003
    const server = new Praxy({})
    server
      .start(port)
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => done(err))
  })

  it('will proxy GET requests', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.get(`http://localhost:${port}/world`))
      .then((response) => {
        assert.equal(response.status, 200)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
  })

  it('will proxy POST requests', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const requestBody = {
      status: 201,
      hello: 'post world'
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.post(`http://localhost:${port}/posts`, requestBody))
      .then((response) => {
        assert.equal(response.status, 201)
        assert.deepEqual(response.data, requestBody)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
  })

  it('will proxy PUT requests', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const requestBody = {
      status: 200,
      hello: 'PUT world'
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.put(`http://localhost:${port}/puts`, requestBody))
      .then((response) => {
        assert.equal(response.status, 200)
        assert.deepEqual(response.data, requestBody)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
  })

  it('will proxy PATCH requests', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const requestBody = {
      status: 200,
      hello: 'PATCH world'
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.patch(`http://localhost:${port}/patches`, requestBody))
      .then((response) => {
        assert.equal(response.status, 200)
        assert.deepEqual(response.data, requestBody)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
  })

  it('will proxy through DELETE', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.delete(`http://localhost:${port}/deletes/123`))
      .then((response) => {
        assert.equal(response.status, 200)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
  })

  it('will proxy through HEAD', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.head(`http://localhost:${port}/headliner`))
      .then((response) => {
        assert.equal(response.status, 200)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
  })

  it('will proxy OPTION for now', (done) => {
    const proxyPort = 5005
    const fakeServer = new EchoServer()
    const port = 3003
    const config = {
      routes: [
        { 
          regex: '.*',
          service: `http://localhost:${proxyPort}`
        }
      ]
    }

    const server = new Praxy(config)
    fakeServer
      .start(proxyPort)
      .then(() => server.start(port))
      .then(() => axios.options(`http://localhost:${port}/resource/123`))
      .then((response) => {
        assert.equal(response.status, 200)
      })
      .then(() => fakeServer.stop())
      .then(() => server.stop())
      .then(() => done())
      .catch((err) => {
        fakeServer.stop()
          .then(() => server.stop())
          .then(() => done(err))
      })
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
      assetServer = new Praxy.StaticServer(mapper)
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
            regex: '.*',
            service: `http://localhost:${assetPort}`
          }
        ]
      }

      const server = new Praxy(config)
      server
        .start(port)
        .then(() => {
          assert.equal(server.config.maps.length, 1)
          assert.equal(server.config.maps[0].url, `http://localhost:${assetPort}`)
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

    it('will proxy GET requests in the map to that server', (done) => {
      const port = 3003
      const config = {
        routes: [
          { 
            regex: '.*',
            service: `http://localhost:${assetPort}`
          }
        ]
      }

      const server = new Praxy(config)
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

    it('will 404 for any requests not found in the map', (done) => {
      const port = 3003
      const server = new Praxy()
      server
        .start(port)
        .then(() => axios.get(`http://localhost:${port}/not-here.json`))
        .catch((error) => assert.equal(error.response.status, 404))
        .then(() => {
          server.stop()
          done()
        })
        .catch((err) => {
          server.stop()
          done(err)
        })
    })

    it('will passthrough 404s by the downstream service', (done) => {
      const port = 3003
      const server = new Praxy()
      server
        .start(port)
        .then(() => {
          return removeFile(`${__dirname}/support/static/${removedFilename}`)
        })
        .then(() => axios.get(`http://localhost:${port}/${removedFilename}.svg`))
        .catch((error) => assert(error.response.status, 404))
        .then(() => {
          server.stop()
          done()
        })
    })
  })
})
