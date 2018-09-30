import Alexa from 'alexa-app'
import { readFile } from 'mz/fs'
import fetch from 'node-fetch'
import { join } from 'path'
import { URLSearchParams } from 'url'
import { authenticate, search } from 'youtube-api'

// Load authentication token for usage in YouTube searches.
const PATH = process.env.path || join(__dirname, '..', 'config.json')
readFile(PATH, 'utf8').then((data) => {
  let config = null
  try {
    config = JSON.parse(data)
  } catch (err) {
    throw err
  }
  authenticate({
    key: config.youtube,
    type: 'key'
  })
})

const alexaApp = new Alexa.app('2east')

alexaApp.intent('AMAZON.YesIntent', {
  utterances: ['Yes']
}, (request, response) => {
  const session = request.getSession()
  const body = new URLSearchParams()
  body.set('video', session.get('url'))
  response.say('Okay, playing ' + session.get('title') + '.')
  return fetch('http://a60a24f0.ngrok.io/submit', {
    body,
    method: 'POST'
  })
})

alexaApp.intent('BeQuiet', {
  utterances: ['Be quiet']
}, (_, response) => {
  response.say('Okay, telling the Main Lounge to be quiet.')
  return fetch('http://a60a24f0.ngrok.io/quiet')
})

alexaApp.intent('PlayFromSearch', {
  slots: { Query: 'AMAZON.SearchQuery' },
  utterances: ['Play {-|Query}']
}, (request, response) => {
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
  })
})

export default alexaApp
