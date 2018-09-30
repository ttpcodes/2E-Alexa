import Alexa from 'alexa-app'
import { readFile } from 'mz/fs'
import fetch from 'node-fetch'
import { join } from 'path'
import { URLSearchParams } from 'url'
import { authenticate, search } from 'youtube-api'

import logger from './Main'

// Load authentication token for usage in YouTube searches.
const PATH = process.env.path || join(__dirname, '..', 'config.json')
readFile(PATH, 'utf8').then((data) => {
  logger.debug('Loaded configuration file.')
  let config = null
  try {
    config = JSON.parse(data)
    logger.debug('Parsed JSON in configuration file.')
  } catch (err) {
    logger.error('Error while parsing JSON in configuration:' + '\n' + err)
  }
  authenticate({
    key: config.youtube,
    type: 'key'
  })
  logger.info('Authenticated with youtube-api.')
}).catch((err) => {
  logger.error('Error when reading configuration file:' + '\n' + err)
})

const alexaApp = new Alexa.app('2east')
logger.debug('Registered Alexa skill.')

alexaApp.intent('AMAZON.YesIntent', {
  utterances: ['Yes']
}, async (request, response) => {
  const session = request.getSession()
  const video = session.get('url')
  logger.debug('Read video URL ' + video + 'from session.')
  const body = new URLSearchParams()
  body.set('video', video)
  logger.debug('Created form body.')
  response.say('Okay, playing ' + session.get('title') + '.')
  return fetch('http://a60a24f0.ngrok.io/submit', {
    body,
    method: 'POST'
  }).then(() => {
    logger.info('Submitted queue request to remote server.')
  }).catch((err) => {
    response.say('Sorry, I had trouble queuing that.')
    logger.warn('Error on queue request:' + '\n' + err)
  })
})
logger.debug('Registered YesIntent.')

alexaApp.intent('BeQuiet', {
  utterances: ['Be quiet']
}, async (_, response) => {
  response.say('Okay, telling the Main Lounge to be quiet.')
  return fetch('http://a60a24f0.ngrok.io/quiet').then(() => {
    logger.info('Submitted Be Quiet request to remote server.')
  }).catch((err) => {
    response.say('Sorry, I had trouble doing that.')
    logger.warn('Error on Be Quiet request:' + '\n' + err)
  })
})
logger.debug('Registered BeQuiet intent.')

alexaApp.intent('PlayFromSearch', {
  slots: { Query: 'AMAZON.SearchQuery' },
  utterances: ['Play {-|Query}']
}, async (request, response) => {
  return new Promise((resolve, reject) => {
    search.list({
      maxResults: 1,
      part: 'snippet',
      q: request.slot('Query'),
      type: 'video'
    }, async (err, data) => {
      if (err) {
        reject()
      } else if (data.items.length === 0) {
        response.say("Sorry, I couldn't find what you requested.")
      } else {
        const session = request.getSession()
        session.set('title', data.items[0].snippet.title)
        session.set('url', 'https://youtube.com/watch?v=' + data.items[0].id.videoId)
        response.say('I found ' + data.items[0].snippet.title + '.' + ' Would you like to play it?')
          .reprompt('Would you like to play it?')
          .shouldEndSession(false)
        resolve()
      }
    })
  }).then(() => {
    logger.info('Returned search result to Alexa.')
  }).catch((err) => {
    response.say('Sorry, I had trouble with the search.')
    logger.warn('Error on search request:' + '\n' + err)
  })
})
logger.debug('Registered PlayFromSearch intent.')
logger.info('Loaded Alexa skill.')

export default alexaApp
