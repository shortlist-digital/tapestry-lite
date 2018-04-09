#!/usr/bin/env node
'use strict'

require('dotenv').config()

const chalk = require('chalk')
const spawn = require('react-dev-utils/crossSpawn')
const command = process.argv[2]
const args = process.argv.slice(3)

const validCommands = ['start', 'build', 'dev']

if (command && !validCommands.includes(command)) {
  console.log(`\nUnknown command: ${chalk.green(`tapestry ${command}`)}\n`)
  process.exit(0)
}

spawn.sync('node', [require.resolve(`./${command || 'dev'}`)].concat(args), {
  stdio: 'inherit'
})
