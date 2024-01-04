import express from 'express'
import merchantRoutes from './merchantRouters'
import authenticationRoutes from './authentication'
import testRoutes from './testRouters'
import IAMRoutes from './IAMRoutes'
import planRoutes from './planRoutes'
import subscriptionRoutes from './subscriptionRoutes'
import verifyAccountRoutes from './verifyAccountRoutes'
import processPaymentRoutes from './processPaymentRoutes'

const router = express.Router()

router.use('/merchant', merchantRoutes)
router.use('/verify', verifyAccountRoutes)
router.use('/iam', IAMRoutes)
router.use('/authentication', authenticationRoutes)
router.use('/plan', planRoutes)
router.use('/subscription', subscriptionRoutes)
router.use('/process-payment', processPaymentRoutes)

router.use('/test', testRoutes)

export default router