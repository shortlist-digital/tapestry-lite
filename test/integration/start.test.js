const shell = require('shelljs')
const expect = require('chai').expect
const kill = require('./kill')
const fixture = require('../fixtures/setup-fixture-stage')

shell.config.silent = true
const stageName = 'stage-start'

describe('tapestry start', () => {
  before(() => {
    fixture.setupStageWithFixture(stageName, 'build-default')
  })

  it('Should start a dev server', () => {
    let outputTest
    const run = new Promise(resolve => {
      const child = shell.exec('node ../bin/dev.js', () => resolve(outputTest))
      child.stdout.on('data', data => {
        if (data.includes('Server started at')) {
          outputTest = true
          kill(child.pid)
        }
      })
    })
    return run.then(test => expect(test).to.equal(true))
  }).timeout(10000)

  after(() => {
    fixture.teardownStage(stageName)
  })
})

describe('tapestry start with custom webpack', () => {
  before(() => {
    fixture.setupStageWithFixture(stageName, 'build-with-custom-webpack')
  })

  it('Should pick up webpack config updates', () => {
    let outputTest
    const run = new Promise(resolve => {
      const child = shell.exec('node ../bin/dev.js', () => resolve(outputTest))
      child.stdout.on('data', data => {
        if (data.includes('Server started at')) {
          outputTest = true
          kill(child.pid)
        }
      })
    })
    return run.then(test => expect(test).to.equal(true))
  }).timeout(10000)

  after(() => {
    fixture.teardownStage(stageName)
  })
})
