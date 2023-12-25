import express from 'express'
import merchantRoutes from './merchantRouters'
import authenticationRoutes from './authentication'
import testRoutes from './testRouters'
import IAMRoutes from './IAMRoutes'
import planRoutes from './planRoutes'

const router = express.Router()

router.use('/merchant', merchantRoutes)
router.use('/iam', IAMRoutes)
router.use('/authentication', authenticationRoutes)
router.use('/plan', planRoutes)

router.use('/test', testRoutes)

export default router