const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const removeFile = promisify(fs.unlink)
const createFile = promisify(fs.writeFile)

const fileMapper = require('../lib/fileMapper')

describe('Praxy.fileMapper', () => {
  const removedFilename = 'hello.json'
  afterEach((done) => {
    createFile(
      `${__dirname}/support/static/${removedFilename}`, 
      JSON.stringify({hello: "World"})
    ).then(() => done())
  })

  it('returns a map of uri to a file reader', (done) => {
    const mapper = fileMapper({
      root: path.resolve(`${__dirname}/support/static`)
    })

    mapper()
      .then((map) => map['/hello.json'].read())
      .then((content) => assert.deepEqual(
        content.toString(),
        JSON.stringify({hello: 'World'}))
      )
      .then(() => done())
      .catch(done)
  })

  it('load-time type will not update the manifest keys, but only stores readers', (done) => {
    const mapper = fileMapper({
      root: path.resolve(`${__dirname}/support/static`),
      type: 'load-time'
    })

    mapper()
      .then((map) => map['/hello.json'].read())
      .then((content) => assert.deepEqual(
        content.toString(),
        JSON.stringify({hello: 'World'}))
      )
      .then(() => removeFile(`${__dirname}/support/static/${removedFilename}`))
      .then(() => mapper())
      .then((map) => map['/hello.json'].read())
      .catch((err) => {
        assert(err)
        done()
      })
  })

  it('caching type will store the contents for reuse', (done) => {
    const mapper = fileMapper({
      root: path.resolve(`${__dirname}/support/static`),
      type: 'caching'
    })

    mapper()
      .then((map) => map['/hello.json'].read())
      .then((content) => assert.deepEqual(
        content.toString(),
        JSON.stringify({hello: 'World'}))
      )
      .then(() => removeFile(`${__dirname}/support/static/${removedFilename}`))
      .then(() => mapper())
      .then((map) => map['/hello.json'].read())
      .then((content) => assert.deepEqual(
        content.toString(),
        JSON.stringify({hello: 'World'}))
      )
      .then(() => done())
      .catch(done)
  })
})