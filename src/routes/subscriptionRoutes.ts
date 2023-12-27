import express from 'express'
import { cancelSubscription, subscribe } from '../controllers/subscriptionController'

const subscriptionRoutes = express.Router()

subscriptionRoutes.post('/subscribe', subscribe)
subscriptionRoutes.post('/cancel-subscription', cancelSubscription)

export default subscriptionRoutes