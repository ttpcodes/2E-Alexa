import Express from 'express'
import Morgan from 'morgan'
import winston from 'winston'

const PORT = process.env.port || 8080
const VERBOSITY = process.env.verbosity || 'info'
// Make sure the logger is ready for use by other classes.
const logger = winston.createLogger({
  level: VERBOSITY,
  transports: [
    new winston.transports.Console()
  ]
})
export default logger

import alexaApp from './Intents'

const expressApp = Express()
logger.debug('Registered Express instance.')
expressApp.use(Morgan('combined'))
logger.debug('Loaded logging middlewarte for Express.')
alexaApp.express({
  expressApp
})
logger.debug('Registered Express with Alexa application.')

expressApp.listen(PORT)
logger.info('Express is now listening on port ' + PORT + '.')
