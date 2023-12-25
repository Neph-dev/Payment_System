import express from 'express'
import { Login } from '../controllers/authController'

const authenticationRoutes = express.Router()

authenticationRoutes.post('/login', Login)

export default authenticationRoutes