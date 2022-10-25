import mongoose from 'mongoose'
import options from '../config'

export const connect = async (
  url = options.dbUrl,
  opts = {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
) => {
  await mongoose.connect(url, opts)
  console.log(`🌐 Database connection established`)
}
