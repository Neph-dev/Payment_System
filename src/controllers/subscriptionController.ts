import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import { v4 as uuidv4 } from 'uuid'
import { ISubscription, SubscriptionStatus } from '../models/Subscription'
import { findPlanByIdAndMerchantId } from '../helpers/findPlan'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUBSCRIPTION_TABLE_NAME = 'Subscriptions'


export const subscribe = async (req: Request, res: Response) => {
    try {
        const {
            reference, 
            merchantId,
            planId,
            billing,
            freeTrial,
            paymentMethod,
            renewal,
            notificationPreferences,
            metadata
        } = req.body

        const planByIdAndMerchantId = await findPlanByIdAndMerchantId(planId, merchantId)
        if(!planByIdAndMerchantId) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `Plan with id ${planId} and Merchant ID ${merchantId} does not exist` 
            })
        }

        const subscription: ISubscription = {
            referenceIndex: reference,
            merchantIdIndex: merchantId,
            planIdIndex: planId,

            subscriptionId: uuidv4(),
            merchantId: merchantId,
            planId: planId,
            billing: billing,
            freeTrial: freeTrial,
            paymentMethod: paymentMethod,
            renewal: renewal,
            notificationPreferences: notificationPreferences,
            metadata: metadata,
            subscriptionStatus: SubscriptionStatus.Active,
            createdAt: new Date().toISOString()
        }

        const params = {
            TableName: SUBSCRIPTION_TABLE_NAME,
            Item: subscription
        }
        await dynamoDB.put(params).promise()

        res.status(201).json({ 
            status: 201,
            success: true,
            message: 'Subscription created successfully',
            data: subscription
        })

    }
    catch (error) {
        res.status(500).json({ 
            status: 500,
            success: false,
            message: error
        })
    }
}

export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const { cancellationReason, subscriptionId } = req.body

        const params = {
            TableName: SUBSCRIPTION_TABLE_NAME,
            Key: {
                subscriptionId: subscriptionId
            },
            UpdateExpression: 'set subscriptionStatus = :s, cancellationReason = :c',
            ExpressionAttributeValues: {
                ':s': SubscriptionStatus.Canceled,
                ':c': cancellationReason
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await dynamoDB.update(params).promise()

        res.status(200).json({ 
            status: 200,
            success: true,
            message: 'Subscription canceled successfully'
        })
    }
    catch (error) {
        res.status(500).json({ 
            status: 500,
            success: false,
            message: error
        })
    }
}