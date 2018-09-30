import Express from 'express'

import alexaApp from './Intents'

const PORT = process.env.port || 8080

const expressApp = Express()
alexaApp.express({
  expressApp
})

expressApp.listen(PORT)
