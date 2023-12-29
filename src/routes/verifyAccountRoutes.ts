import express from 'express'
import { verifyMerchantAccount, verifyIAMAccount } from '../controllers/verifyAccountController'

const verifyAccountRoutes = express.Router()

verifyAccountRoutes.get('/:token/:email', verifyMerchantAccount)
verifyAccountRoutes.get('/IAM/:token/:email', verifyIAMAccount)

export default verifyAccountRoutes