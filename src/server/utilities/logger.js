const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const log = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.File({
      filename: process.env.LOG_PATH + '/error.log',
      level: 'error'
    }),
    new transports.File({ filename: process.env.LOG_PATH + '/access.log' })
  ]
})

// instance of Winston logger for debug/error/silly logs
module.exports.log = log
