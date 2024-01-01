import express from 'express'
import { cancelSubscription, subscribe, upgradeSubscription } from '../controllers/subscriptionController'

const subscriptionRoutes = express.Router()

subscriptionRoutes.post('/subscribe', subscribe)
subscriptionRoutes.post('/upgrade-subscription', upgradeSubscription)
subscriptionRoutes.post('/cancel-subscription', cancelSubscription)

export default subscriptionRoutes