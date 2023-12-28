import express from 'express'
import { verifyMerchantAccountController, verifyIAMAccountController } from '../controllers/verifyAccountController'

const verifyAccountRoutes = express.Router()

verifyAccountRoutes.get('/:token/:email', verifyMerchantAccountController)
verifyAccountRoutes.get('/IAM/:token/:email', verifyIAMAccountController)

export default verifyAccountRoutes