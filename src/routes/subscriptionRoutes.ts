import express from 'express'
import { cancelSubscription, subscribe, upgradeSubscription } from '../controllers/subscriptionController'
import { processPayment } from '../middlewares/processPayment'

const subscriptionRoutes = express.Router()

subscriptionRoutes.post('/subscribe', processPayment, subscribe)
subscriptionRoutes.post('/upgrade-subscription', upgradeSubscription)
subscriptionRoutes.post('/cancel-subscription', cancelSubscription)

export default subscriptionRoutes