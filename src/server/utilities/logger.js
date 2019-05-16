const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const log = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), logFormat),
  transports:
    process.env.PORT !== process.env.TAPESTRY_PORT
    ? [
      new transports.File({ filename: process.env.LOG_PATH + '/error.log', level: 'error' }),
      new transports.File({ filename: process.env.LOG_PATH + '/access.log' })
    ]
    : [
      new transports.File({ filename: '/dev/stderr', level: 'error' }),
      new transports.File({ filename: '/dev/stdout', level: 'error' }),
    ]
})

if (process.env.NODE_ENV === 'development') {
  log.add(
    new transports.Console({
      format: format.simple()
    })
  )
}

// instance of Winston logger for debug/error/silly logs
module.exports.log = log
