import { register, login, me, logout } from './auth.controllers'
import { Router } from 'express'
import { guard, authorize } from '../../middlewares/guard'

const router = Router()
router.route('/register').post(register)
router.route('/login').post(login)
router.route('/me').get(guard, authorize('user', 'publisher', 'admin'), me)
router.route('/logout').get(guard, logout)

export default router
