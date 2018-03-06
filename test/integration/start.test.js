const setupStageWithFixture = require('../fixtures/setup-fixture-stage').setupStageWithFixture
const teardownStage = require('../fixtures/setup-fixture-stage').teardownStage
const expect = require('chai').expect
const shell = require('shelljs')
const kill = require('./kill')

const stageName = 'stage-start'

describe('tapestry start', () => {

  it('Should start a dev server', () => {
    setupStageWithFixture(stageName, 'build-default')
    let outputTest
    const run = new Promise(resolve => {
      const child = shell.exec('NODE_ENV=\'development\' node ../bin/start.js', () => {
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
    teardownStage(stageName)
  })

})


