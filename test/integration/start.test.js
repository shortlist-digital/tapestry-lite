const setupStageWithFixture = require('../fixtures/setup-fixture-stage')
  .setupStageWithFixture
const teardownStage = require('../fixtures/setup-fixture-stage').teardownStage
const expect = require('chai').expect
const shell = require('shelljs')
const kill = require('./kill')

const stageName = 'stage-start'

describe('tapestry start', () => {
  before(() => {
    setupStageWithFixture(stageName, 'build-default')
  })

  it('Should start a dev server', () => {
    let outputTest
    const run = new Promise(resolve => {
      const child = shell.exec('node ../bin/start.js', () => {
        resolve(outputTest)
      })
      child.stdout.on('data', data => {
        if (data.includes('Tapestry Lite is Running')) {
          outputTest = true
          kill(child.pid)
        }
      })
    })
    return run.then(test => expect(test).to.equal(true))
  })

  after(() => {
    teardownStage(stageName)
  })
})

describe('tapestry start with custom webpack', () => {
  before(() => {
    setupStageWithFixture(stageName, 'build-with-custom-webpack')
  })

  it('Should pick up webpack config updates', () => {
    let outputTest
    const run = new Promise(resolve => {
      const child = shell.exec('node ../bin/start.js', () => {
        resolve(outputTest)
      })
      child.stdout.on('data', data => {
        if (data.includes('Tapestry Lite is Running')) {
          outputTest = true
          kill(child.pid)
        }
      })
    })
    return run.then(test => expect(test).to.equal(true))
  })

  after(() => {
    teardownStage(stageName)
  })
})
