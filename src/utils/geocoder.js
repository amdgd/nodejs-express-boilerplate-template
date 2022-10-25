import NodeGeocoder from 'node-geocoder'
import dotenv from 'dotenv'

dotenv.config()

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_KEY,
  formatter: null // 'gpx', 'string', ...
}

const geocoder = NodeGeocoder(options)
export default geocoder
