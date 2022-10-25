import asyncHandler from './async'
import jwt from 'jsonwebtoken'
import ErrorResponse from '../utils/errorResponse'
import { User } from '../resources/users/users.model'
import config from '../config'

//  Protect Routes
export const guard = asyncHandler(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.token) {
    token = req.cookies.token
  }

  // Make sure token exists
  if (!token)
    return next(new ErrorResponse('Not authorized to access this route', 401))

  try {
    const decodedJwt = jwt.verify(token, config.secrets.jwt)
    req.user = await User.findById(decodedJwt.id)
    next()
  } catch (error) {
    return next(
      new ErrorResponse(
        'Not authorized to access this route',
        401,
        error.message
      )
    )
  }
})

//  Authorization based on User roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new ErrorResponse(
          `Current user with role ${req.user.role} is not authorized to access this route`,
          403
        )
      )
    next()
  }
}
