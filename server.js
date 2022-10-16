import express from 'express'
import cors from 'cors'
import config from './config'

export const app = express()
app.disable('x-powered-by')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export const start = async () => {
  app.listen(config.port, () => {
    console.log(`Server started at PORT: ${config.port}`)
  })
}
