const shell = require('shelljs')
const expect = require('chai').expect
const fs = require('fs')
const kill = require('./kill')
const fixture = require('../fixtures/setup-fixture-stage')

shell.config.silent = true
const stageName = 'stage-build'

describe('tapestry build', () => {
  before(() => {
    fixture.setupStageWithFixture(stageName, 'build-default')
  })

  it('should compile files into a build directory', () => {
    shell.exec('node ../bin/build.js')
    expect(shell.test('-f', '.tapestry/server.js')).to.equal(true)
    expect(shell.test('-f', '.tapestry/server.js.map')).to.equal(true)
  })

  after(() => {
    fixture.teardownStage(stageName)
  })
})