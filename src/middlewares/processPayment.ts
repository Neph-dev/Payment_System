import { NextFunction, Request, Response } from 'express'

import AWS from 'aws-sdk'

import { v4 as uuidv4 } from 'uuid'

import { ITransaction, TransactionStatus } from '../models/Transaction'
import { sendFailedTransactionEmail, sendSuccessfullTransactionEmail } from '../helpers/sendEmail'
import { findPlanByIdAndMerchantId } from '../helpers/findPlan'
import { getSubscriptionByMerchantIdAndReference } from '../helpers/findSubscription'
import { findUserByRefAndMerchand } from '../helpers/findUser'
import { createUser } from '../controllers/userController'


AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const TRANSACTION_TABLE_NAME = 'Transactions'


export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = req.body
        const transactionId = uuidv4()

        const planByIdAndMerchantId = await findPlanByIdAndMerchantId(body.planId, body.merchantId)
        if (!planByIdAndMerchantId || !planByIdAndMerchantId.isActive) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: `Plan with id ${body.planId} and Merchant ID ${body.merchantId} does not exist or is not active`
            })
        }

        const subscriptionByMerchantIdAndReference = await getSubscriptionByMerchantIdAndReference(body.merchantIdIndex, body.referenceIndex)
        if(subscriptionByMerchantIdAndReference.length > 0) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `Subscription with reference ${body.referenceIndex} and Merchant ID ${body.merchantIdIndex} already exist` 
            })
        }

        let userByRefAndMerchand = await findUserByRefAndMerchand(body.referenceIndex, body.merchantIdIndex)
        let newUserByRefAndMerchand

        if(!userByRefAndMerchand) {
            newUserByRefAndMerchand = await createUser(
                body.email,
                body.referenceIndex,
                body.merchantIdIndex,
                body.phoneNumber
            )
        }

        const transaction: ITransaction = {
            userIdIndex: userByRefAndMerchand?.userId.toString() || newUserByRefAndMerchand?.userId.toString(),
            merchantIdIndex: planByIdAndMerchantId.merchantIdIndex,
            planIdIndex: planByIdAndMerchantId.PlanId,

            transactionId: transactionId,
            transactionStatus: TransactionStatus.PENDING,
            transactionType: body.transactionType,
            transactionAmount: planByIdAndMerchantId.price,
            transactionCurrency: planByIdAndMerchantId.currency,
            transactionDescription: body.transactionDescription || undefined,
            transactionCreatedAt: new Date().toISOString(),
            transactionMetadata: body.transactionMetadata || undefined,
        }
        const params = { TableName: TRANSACTION_TABLE_NAME, Item: transaction}
        await dynamoDB.put(params).promise()

        const isPaymentSuccessful = Math.random() > 0.9; // 90% success rate

        if (isPaymentSuccessful) {

            const params = {
                TableName: TRANSACTION_TABLE_NAME,
                Key: {
                    transactionId: transaction.transactionId
                },
                UpdateExpression: 'set transactionStatus = :transactionStatus, transactionCreatedAt = :transactionCreatedAt',
                ExpressionAttributeValues: {
                    ':transactionStatus': TransactionStatus.SUCCESS,
                    ':transactionCreatedAt': new Date().toISOString()
                },
                ReturnValues: 'UPDATED_NEW'
            }
            await dynamoDB.update(params).promise()

            // await sendSuccessfullTransactionEmail('snephthali@gmail.com')
         
            next()
            // return res.status(200).json({
            //     status: 200,
            //     success: true,
            //     message: 'Payment successful',
            // })
        }
        else {
            const transactionStatus = TransactionStatus.FAILED

            const params = {
                TableName: TRANSACTION_TABLE_NAME,
                Key: {
                    transactionId: transaction.transactionId
                },
                UpdateExpression: 'set transactionStatus = :transactionStatus, transactionCreatedAt = :transactionCreatedAt',
                ExpressionAttributeValues: {
                    ':transactionStatus': transactionStatus,
                    ':transactionCreatedAt': new Date().toISOString()
                },
                ReturnValues: 'UPDATED_NEW'
            }
            await dynamoDB.update(params).promise()
            
            await sendFailedTransactionEmail(body.email, planByIdAndMerchantId)

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


