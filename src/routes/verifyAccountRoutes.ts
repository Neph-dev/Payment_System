import express from 'express'
import { resendVerificationCode, verifyMerchantAccount } from '../controllers/verifyAccountController'

const verifyAccountRoutes = express.Router()

verifyAccountRoutes.get('/:token/:email', verifyMerchantAccount)
verifyAccountRoutes.get('/:email', resendVerificationCode)

export default verifyAccountRoutes