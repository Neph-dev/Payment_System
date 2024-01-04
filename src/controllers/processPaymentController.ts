import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import { TransactionStatus } from '../models/Transaction'
import { sendFailedTransactionEmail, sendSuccessfullTransactionEmail } from '../helpers/sendEmail'
import { findPlanByIdAndMerchantId } from '../helpers/findPlan'


AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const TRANSACTION_TABLE_NAME = 'Transactions'


export const processPayment = async (req: Request, res: Response) => {
    try {
        const body = req.body

        const planByIdAndMerchantId = await findPlanByIdAndMerchantId(body.planIdIndex, body.merchantIdIndex)

        if (!planByIdAndMerchantId || !planByIdAndMerchantId.isActive) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: `Plan with id ${body.planId} and Merchant ID ${body.merchantId} does not exist or is not active`
            })
        }

        const isPaymentSuccessful = Math.random() < 0.9; // 90% success rate

        if (isPaymentSuccessful) {

            const params = {
                TableName: TRANSACTION_TABLE_NAME,
                Key: {
                    transactionId: body.transactionId
                },
                UpdateExpression: 'set transactionStatus = :transactionStatus, transactionCreatedAt = :transactionCreatedAt',
                ExpressionAttributeValues: {
                    ':transactionStatus': TransactionStatus.SUCCESS.toString(),
                    ':transactionCreatedAt': new Date().toISOString()
                },
                ReturnValues: 'UPDATED_NEW'
            }
            await dynamoDB.update(params).promise()

            await sendSuccessfullTransactionEmail('snephthali@gmail.com')
            
            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Payment successful',
            })
        }
        else {
            const transactionStatus = TransactionStatus.FAILED

            const params = {
                TableName: TRANSACTION_TABLE_NAME,
                Key: {
                    transactionId: body.transactionId
                },
                UpdateExpression: 'set transactionStatus = :transactionStatus, transactionCreatedAt = :transactionCreatedAt',
                ExpressionAttributeValues: {
                    ':transactionStatus': transactionStatus,
                    ':transactionCreatedAt': new Date().toISOString()
                },
                ReturnValues: 'UPDATED_NEW'
            }
            await dynamoDB.update(params).promise()
            
            await sendFailedTransactionEmail('snephthali@gmail.com')

            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Payment failed'
            })
        }
    }
    catch (err: any) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: `Processing payment error ${err.message}`
        })
    }
}


