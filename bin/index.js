#!/usr/bin/env node
'use strict'

require('dotenv').config()

const chalk = require('chalk')
const spawn = require('react-dev-utils/crossSpawn')
const command = process.argv[2]
const args = process.argv.slice(3)

const validCommands = ['start', 'build', 'dev']

const logError = msg => {
  console.log(`\n${chalk.red('Error:')} ${msg}\n`)
  process.exit(0)
}

if (command && !validCommands.includes(command)) {
  logError(`Unknown command ${chalk.green(`tapestry ${command}`)}`)
}

if (!process.env.CMS_ENDPOINT) {
  logError('Missing a CMS_ENDPOINT process.env')
}

spawn.sync('node', [require.resolve(`./${command || 'dev'}`)].concat(args), {
  stdio: 'inherit'
})
