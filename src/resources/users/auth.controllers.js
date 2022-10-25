import { User } from './users.model'
import { crudControllers } from '../../utils/crud'
import asyncHandler from '../../middlewares/async'
import ErrorResponse from '../../utils/errorResponse'
import config from '../../config'

//  get Logged in user
export const me = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, user: req.user })
})

//  Logout
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })
  res.status(200).json({ success: true })
})

// Register User
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body
  const user = await User.create({ name, email, password, role })
  sendTokenResponse(user, 200, res)
})

//  Login user
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password)
    return next(new ErrorResponse('Please provide email and Password', 400))

  //  check for user
  const user = await User.findOne({ email: email }).select('+password')
  if (!user) return next(new ErrorResponse("This email doesn't exist", 401))

  // check for password
  if (!(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  sendTokenResponse(user, 200, res)
})

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(
      Date.now() + config.secrets.jwtCookieExp * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }

  if (process.env.NODE_ENV === 'prod') options.secure = true

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token: token,
      user: { email: user.email, id: user._id }
    })
}

export const authControllers = {
  ...crudControllers(User)
}
