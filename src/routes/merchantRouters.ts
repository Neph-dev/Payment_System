import express from 'express'
import { createMerchant } from '../controllers/merchantController'

const merchantRoutes = express.Router()

merchantRoutes.post('/create-merchant', createMerchant)

export default merchantRoutes