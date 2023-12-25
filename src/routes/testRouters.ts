import express from 'express'
import { generateIAM } from '../controllers/IAMController'
import { verifyToken } from '../middlewares/verifyToken'

const testRoutes = express.Router()

testRoutes.get('/test-token', verifyToken, generateIAM)

export default testRoutes