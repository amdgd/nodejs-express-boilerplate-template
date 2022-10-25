import dotenv from 'dotenv'
dotenv.config()
const mongoURL = process.env.MONGO_URL

export const config = {
  secrets: {
    jwt: process.env.JWT_SECRET,
    jwtExp: process.env.JWT_EXPIRE,
    jwtCookieExp: process.env.JWT_COOKIE_EXPIRE
  },
  dbUrl: mongoURL,
  port: 80
}
