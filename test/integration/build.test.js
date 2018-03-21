const shell = require('shelljs')
const expect = require('chai').expect
const fs = require('fs')
const kill = require('./kill')
const fixture = require('../fixtures/setup-fixture-stage')

shell.config.silent = true

describe('tapestry build', () => {
  before(() => {
    fixture.setupStageWithFixture('stage-build', 'build-default')
  })

  it('should compile files into a build directory', () => {
    const child = shell.exec('node ../bin/tapestry-lite.js build')
    expect(shell.test('-f', '.tapestry/server.js')).to.equal(true)
    expect(shell.ls('.tapestry/*.css').code).to.equal(0)
  }).timeout(5000)

  after(() => {
    fixture.teardownStage('stage-build')
  })
})

// describe('tapestry build dynamic import', () => {
//   before(() => {
//     fixture.setupStageWithFixture('stage-build-dynamic', 'build-with-dynamic-import')
//   })
// 
//   it('should compile files into a build directory', () => {
//     shell.exec('node ../bin/tapestry-lite.js build')
//     expect(shell.test('-f', '.tapestry/server.js')).to.equal(true)
//     expect(shell.test('-f', '.tapestry/0.server.js')).to.equal(true)
//   }).timeout(10000)
// 
//   after(() => {
//     fixture.teardownStage('stage-build-dynamic')
//   })
// })
