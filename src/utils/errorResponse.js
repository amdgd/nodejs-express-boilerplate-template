class ErrorResponse extends Error {
  constructor(message, statusCode, technicalMessage) {
    super(message)
    this.statusCode = statusCode
    this.technicalMessage = technicalMessage
  }
}

export default ErrorResponse
