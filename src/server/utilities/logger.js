const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const log = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), logFormat),
  transports:
    typeof process.env.TAPESTRY_LOGS_FOLDER !== 'undefined'
    ? [
      new transports.File({ filename: process.env.TAPESTRY_LOGS_FOLDER + '/error.log', level: 'error' }),
      new transports.File({ filename: process.env.TAPESTRY_LOGS_FOLDER + '/access.log' })
    ]
    : [
      new transports.Console({ format: format.simple() })
    ]
})

// instance of Winston logger for debug/error/silly logs
module.exports.log = log
