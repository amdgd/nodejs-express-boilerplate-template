import config from '../config'
import ErrorResponse from '../utils/errorResponse'
export const errorHandler = (err, req, res, next) => {
  let error = {}

  //  Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const technicalMessage = err.name + ': ' + err.message
    const message = 'Invalid request'
    error = new ErrorResponse(message, 404, technicalMessage)
    error.flag = 'MongoDb'
  }

  if (err.name === 'ValidationError') {
    const values = Object.values(err.errors).map(val => val.message)
    const technicalMessage = err.name + ':' + err._message
    const message = values
    error = new ErrorResponse(message, 400, technicalMessage)
    error.flag = 'MongoDb'
  }

  if (err.code === 11000) {
    const technicalMessage =
      err.name +
      ': ' +
      err.code +
      ' - Duplicate field(s):  ' +
      JSON.stringify(err.keyValue)
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 400, technicalMessage)
    error.flag = 'MongoDb'
  }

  if (res.headersSent) return

  const payload = config.isDev
    ? {
        success: false,
        message: error.message || err.message || 'Server Error',
        error: error.technicalMessage || err.technicalMessage,
        flag: error.flag
      }
    : {
        success: false,
        message: error.message || err.message || 'Server Error'
      }

  res.status(error.statusCode || 500).json(payload)
}
