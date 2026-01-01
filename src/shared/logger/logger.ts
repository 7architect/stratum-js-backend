import winston from 'winston'

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => {
      const { timestamp, level, message, ...meta } = info
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta, null, 2)}` : ''
      return `${timestamp} ${level}: ${message}${metaStr}`
    }
  )
)

const transports = [
  new winston.transports.Console(),
]

export const logger = winston.createLogger({
  level: 'debug',
  format,
  transports,
})
