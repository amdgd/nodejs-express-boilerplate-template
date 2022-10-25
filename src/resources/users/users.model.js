import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../../config'

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please add a name'] },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
    },
    role: { type: String, enum: ['user', 'publisher'], default: 'user' },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 5,
      select: false
    },
    resetPasswordToken: String,
    resetPasswordDate: Date
  },
  { timestamps: true }
)

//  Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  //  check is Password is not being modified
  if (!this.isModified('password')) return next()

  const salt = await bcrypt.genSalt(8)
  this.password = await bcrypt.hash(this.password, salt)
})

//  Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp
  })
}

//  Match user entered password to database hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

userSchema.index({ email: 1 }, { unique: true })

export const User = mongoose.model('User', userSchema)
