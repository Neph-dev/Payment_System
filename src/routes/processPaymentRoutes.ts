import express from 'express'
import { initializePayment } from '../middlewares/initializePayment'
import { processPayment } from '../controllers/processPaymentController'

const processPaymentRoutes = express.Router()

processPaymentRoutes.post('/', initializePayment, processPayment)

export default processPaymentRoutes