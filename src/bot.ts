//  __   __  ___        ___
// |__) /  \  |  |__/ |  |
// |__) \__/  |  |  \ |  |

// This is the main file for the <%= name %> bot.

// Import Botkit's core features
import {Botkit} from 'botkit'
import express from 'express'
import serverlessExpress from 'aws-serverless-express'

import {webserver} from './webserver'
import {register} from './features'

// Import a platform-specific adapter for <%= platform %>.
import {SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware} from 'botbuilder-adapter-slack'
//import {MongoDbStorage} from 'botbuilder-storage-mongodb'

// Load process.env values from .env file
require('dotenv').config()

// let storage = null
// let mongoStorage = null
if (process.env.MONGO_URI) {
  // storage = mongoStorage = new MongoDbStorage({
  //   url : process.env.MONGO_URI,
  // })
}

const adapter = new SlackAdapter({
  // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
  enable_incomplete: true,

  // parameters used to secure webhook endpoint
  verificationToken: process.env.verificationToken,
  clientSigningSecret: process.env.clientSigningSecret,

  // auth token for a single-team app
  botToken: process.env.botToken,

  // credentials used to set up oauth for multi-team apps
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  scopes: ['bot'],
  redirectUri: process.env.redirectUri || '',

  // functions required for retrieving team-specific info
  // for use in multi-team apps
  //getTokenForTeam: getTokenForTeam,
  //getBotUserByTeam: getBotUserByTeam,
})

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware())

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware())


const controller = new Botkit({
  webhook_uri: '/api/messages',
  webserver_middlewares: [],
  webserver,
  // storage
})

import * as http from 'http'

if (process.env.MODE === 'lambda') {
  const server = serverlessExpress.createServer(webserver)
  exports.handle = (event: any, context: any) => serverlessExpress.proxy(server, event, context)
} else {
  const socket = http.createServer(webserver)
  socket.listen(process.env.port || process.env.PORT || 3000, () => {
    console.log(`Webhook endpoint online:  http://localhost:${ process.env.PORT || 3000 }${ controller.getConfig('webhook_uri') }`);
  })
}


// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
  // load traditional developer-created local custom feature modules
  register(controller)
})

controller.webserver.get('/', (req: express.Request, res: express.Response) => {
  res.send(`This app is running Botkit ${ controller.version }.`)
})

controller.webserver.get('/install', (req: express.Request, res: express.Response) => {
  // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
  res.redirect(controller.adapter.getInstallLink())
})

controller.webserver.get('/install/auth', async (req: express.Request, res: express.Response) => {
  try {
    const results = await controller.adapter.validateOauthCode(req.query.code)

    console.log('FULL OAUTH DETAILS', results)

    // Store token by team in bot state.
    tokenCache[results.team_id] = results.bot.bot_access_token

    // Capture team to bot id
    userCache[results.team_id] =  results.bot.bot_user_id

    res.json('Success! Bot installed.')
  } catch (err) {
    console.error('OAUTH ERROR:', err)
    res.status(401)
    res.send(err.message)
  }
})

let tokenCache: {[key: string]: string} = {}
let userCache: {[key: string]: string} = {}

if (process.env.TOKENS) {
  tokenCache = JSON.parse(process.env.TOKENS)
}

if (process.env.USERS) {
  userCache = JSON.parse(process.env.USERS)
}

async function getTokenForTeam(teamId: string) {
  if (tokenCache[teamId]) {
    return new Promise((resolve) => {
      setTimeout(function() {
        resolve(tokenCache[teamId])
      }, 150)
    })
  } else {
    console.error('Team not found in tokenCache: ', teamId)
  }
}

async function getBotUserByTeam(teamId: string) {
  if (userCache[teamId]) {
    return new Promise((resolve) => {
      setTimeout(function() {
        resolve(userCache[teamId])
      }, 150)
    })
  } else {
    console.error('Team not found in userCache: ', teamId)
  }
}
