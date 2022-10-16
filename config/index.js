import { merge } from 'lodash'
const env = process.env.NODE_ENV || 'dev'

const baseConfig = {
  env,
  isDev: env === 'dev',
  isTest: env === 'testing',
  port: 3000,
  secrets: {
    jwt: process.env.JWT_SECRET,
    jwtExp: '100d'
  }
}

let envConfig = {}

switch (env) {
  case 'development':
  case 'dev':
    envConfig = require('./dev').config
    break
  case 'test':
  case 'testing':
    envConfig = require('./testing').config
    break
  default:
    envConfig = require('./dev').config
}

export default merge(baseConfig, envConfig)
