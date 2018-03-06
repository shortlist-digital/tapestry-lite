const setupStageWithFixture = require('../fixtures/setup-fixture-stage').setupStageWithFixture
const teardownStage = require('../fixtures/setup-fixture-stage').teardownStage
const expect = require('chai').expect
const shell = require('shelljs')

const stageName = 'stage-start'

describe('tapestry start', () => {

  it('Should start a dev server', () => {
    setupStageWithFixture(stageName, 'build-default')
    shell.exec('NODE_ENV=\'development\' node ../bin/start.js')
    //teardownStage(stageName)
  })

})


