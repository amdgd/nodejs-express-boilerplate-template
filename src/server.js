import path from 'path'
import express from 'express'
import cors from 'cors'
import config from './config'
import { logger } from './middlewares/logger'
import { connect } from './utils/db'
import { notice } from './utils/colors'
import { errorHandler } from './middlewares/error'
import ErrorResponse from './utils/errorResponse'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import xss from 'xss-clean'
import hpp from 'hpp'
import rateLimit from 'express-rate-limit'

import authRouter from './resources/users/auth.router'
import { guard, authorize } from './middlewares/guard'

const app = express()

if (config.isDev)
  app.use(
    logger(':method :url :status :reqBody [:date[web]] - :response-time ms ')
  )

app.use(cookieParser())
app.use(cors())
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(mongoSanitize({ replaceWith: '_', allowDots: true }))
app.use(helmet())
app.use(xss())
app.use(hpp())

//  Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100
})
app.use(limiter)

// Set static folder
app.use(express.static(path.join(__dirname, '../public')))

//  Mounting Auth
app.use('/api/v1/auth', authRouter)

// Catch All routes
app.all('*', (req, res, next) => {
  next(
    new ErrorResponse(
      'Not Found',
      400,
      'The query seems invalid or the router is not implemented'
    )
  )
})

app.use(errorHandler)

// Connecting with Database and starting Express server
export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () => {
      console.log(notice(`REST API on http://localhost:${config.port}/api`))
    })
  } catch (e) {
    console.error(e.message)
  }
}
