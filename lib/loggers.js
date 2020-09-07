const winston = require('winston')
const { combine, label, timestamp, simple, colorize } = winston.format

const fileLogger = (filename, level = 'info') => {
  const transport = new winston.transports.File({ filename })
  const logger = winston.createLogger({
    transports: [transport],
    format: combine(
      label({ label: 'Proxy' }),
      timestamp(),
      simple()
    )
  })
  logger.level = level
  return logger
}

const consoleLogger = (level = 'info') => {
  const transport = new winston.transports.Console()
  const logger = winston.createLogger({
    transports: [transport],
    format: combine(
      label({ label: 'Proxy' }),
      colorize(),
      timestamp(),
      simple()
    )
  })
  logger.level = level
  return logger
}

const create = (environment) => {
  environment = environment || process.env.APP_ENV
  
  if (environment === 'development') {
    return consoleLogger('debug')
  }

  if (environment === 'test') {
    return fileLogger(`${process.cwd()}/log/test.log`, 'debug')
  }

  return consoleLogger()
}

module.exports = {
  fileLogger,
  consoleLogger,
  create,
}