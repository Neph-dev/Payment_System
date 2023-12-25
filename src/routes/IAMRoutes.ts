import express from 'express'
import { createMerchant } from '../controllers/merchantController'
import { verifyToken } from '../middlewares/verifyToken'
import { generateIAM } from '../controllers/IAMController'

const IAMRoutes = express.Router()

IAMRoutes.post('/add-iam', verifyToken, generateIAM)

export default IAMRoutes