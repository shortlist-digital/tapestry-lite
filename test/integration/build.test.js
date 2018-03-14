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
    // hash from file contents of " body { color: red; } "
    expect(shell.test('-f', '.tapestry/b6452d8fa43c7cb57e6b0f9bd745209a.css')).to.equal(true)
  }).timeout(5000)

  after(() => {
    fixture.teardownStage(stageName)
  })
})
