import morgan from 'morgan'
morgan.token('reqBody', function(req, res) {
  return ` - Query: ${JSON.stringify(
    req.query
  )} - Params: ${JSON.stringify(req.params)}`
})

export const logger = morgan
