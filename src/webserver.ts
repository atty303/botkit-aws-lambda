import express from 'express'
import * as bodyParser from 'body-parser'

export const webserver = express()

webserver.use(bodyParser.json())
webserver.use(bodyParser.urlencoded({ extended: true }))
