import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

import { ISubscription, SubscriptionStatus } from '../models/Subscription'
import { findPlanByIdAndMerchantId } from '../helpers/findPlan'
import { sendSubscriptionReceiptEmail } from '../helpers/sendEmail'
import { findMerchantById } from '../helpers/findMerchant'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUBSCRIPTION_TABLE_NAME = 'Subscriptions'


export const subscribe = async (req: Request, res: Response) => {
    try {
        const {
            reference, 
            merchantId,
            planId,
            paymentMethod,
            renewal,
            notificationPreferences,
            metadata,
            email
        } = req.body

        const planByIdAndMerchantId = await findPlanByIdAndMerchantId(planId, merchantId)
        if(!planByIdAndMerchantId) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `Plan with id ${planId} and Merchant ID ${merchantId} does not exist` 
            })
        }

        const merchantById = await findMerchantById(merchantId)

        const subscription: ISubscription = {
            referenceIndex: reference,
            merchantIdIndex: merchantId,
            planIdIndex: planId,
            email: email,
            subscriptionId: uuidv4(),
            subscriptionStatus: SubscriptionStatus.Active,
            cancellationReason: null,
            billing: {
                nextBillingDate: await handleNextBillingDate(planByIdAndMerchantId),
                lastBillingDate: null,
                billingCycle: planByIdAndMerchantId.planType.interval,
                billingCycleUnit: planByIdAndMerchantId.planType.intervalUnit,
                billingAmount: planByIdAndMerchantId.price,
                billingCycleAnchor: await handleFreeTrial(planByIdAndMerchantId) 
                                    ? await handleFreeTrialEnd(planByIdAndMerchantId) : new Date().toISOString(),
                billingCurrency: planByIdAndMerchantId.currency
            },
            freeTrial: {
                isOnFreeTrial: await handleFreeTrial(planByIdAndMerchantId),
                freeTrialStart: await handleFreeTrial(planByIdAndMerchantId) 
                                ? new Date().toISOString() : undefined,
                freeTrialEnd: await handleFreeTrial(planByIdAndMerchantId) 
                                ? await handleFreeTrialEnd(planByIdAndMerchantId) : undefined
            },
            paymentMethod: paymentMethod,
            renewal: {
                autoRenew: renewal.autoRenew || true
            },
            notificationPreferences: notificationPreferences,
            metadata: metadata,
            createdAt: new Date().toISOString()
        }

        const params = {
            TableName: SUBSCRIPTION_TABLE_NAME,
            Item: subscription
        }
        await dynamoDB.put(params).promise()

        if(merchantById) {
            await sendSubscriptionReceiptEmail(email, merchantById.name, planByIdAndMerchantId, 30)
        }

        res.status(201).json({ 
            status: 201,
            success: true,
            message: 'Subscription created successfully'
        })

    }
    catch (err: any) {
        res.status(500).json({ 
            status: 500,
            success: false,
            message: 'Error creating subscription', 
            error: err.message
        })
    }
}

const handleFreeTrial = async (planByIdAndMerchantId: any) => {
    if(
        planByIdAndMerchantId?.planType.isRecurring && 
        planByIdAndMerchantId?.planType?.trialPeriodDays > 0
    ) {
        return true
    }
    else return false
}

const handleFreeTrialEnd = async (planByIdAndMerchantId: any) => {
    return dayjs(new Date())
    .add(planByIdAndMerchantId?.planType?.trialPeriodDays, 'day')
    .toISOString()
}

const handleNextBillingDate = async (planByIdAndMerchantId: any) => {
    if(planByIdAndMerchantId?.planType.isRecurring === false) {
        return null
    }
    else if(await handleFreeTrial(planByIdAndMerchantId) === true) {
        return await handleFreeTrialEnd(planByIdAndMerchantId)
    }
    else {
        return dayjs(new Date())
        .add(planByIdAndMerchantId?.planType?.interval, planByIdAndMerchantId?.planType?.intervalUnit)
        .toISOString()
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
                ':s': SubscriptionStatus.CanceledByCustomer,
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