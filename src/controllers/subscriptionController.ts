import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

import { ISubscription, SubscriptionStatus } from '../models/Subscription'
import { findPlanByIdAndMerchantId } from '../helpers/findPlan'
import { sendSubscriptionReceiptEmail } from '../helpers/sendEmail'
import { findMerchantById } from '../helpers/findMerchant'
import { upgradeDuringBillingCycle } from '../helpers/handleProration'
import { findSubscriptionById, getSubscriptionByMerchantIdAndReference } from '../helpers/findSubscription'
import { resetTime } from '../helpers/handleTimeReset'
import { findUserByRefAndMerchand } from '../helpers/findUser'
import { createUser } from './userController'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUBSCRIPTION_TABLE_NAME = 'Subscriptions'


export const subscribe = async (req: Request, res: Response) => {
    try {
        const {
            merchantId,
            planId,
            paymentMethod,
            renewal,
            notificationPreferences,
            metadata,
            email,
            referenceIndex,
            merchantIdIndex,
            phoneNumber
        } = req.body

        // *Might not need it.
        const planByIdAndMerchantId = await findPlanByIdAndMerchantId(planId, merchantId)
        if(!planByIdAndMerchantId) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `Plan with id ${planId} and Merchant ID ${merchantId} does not exist` 
            })
        }

        const subscriptionByMerchantIdAndReference = await getSubscriptionByMerchantIdAndReference(merchantIdIndex, referenceIndex)

        if(subscriptionByMerchantIdAndReference.length > 0) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `Subscription with reference ${referenceIndex} and Merchant ID ${merchantId} already exist` 
            })
        }

        let userByRefAndMerchand = await findUserByRefAndMerchand(referenceIndex, merchantIdIndex)
        let newUserByRefAndMerchand

        if(!userByRefAndMerchand) {
            newUserByRefAndMerchand = await createUser(
                email,
                referenceIndex,
                merchantIdIndex,
                phoneNumber
            )
        }

        const merchantById = await findMerchantById(merchantId)

        const subscription: ISubscription = {

            referenceIndex: referenceIndex,
            merchantIdIndex: merchantId,
            planIdIndex: planId,
            userIdIndex: userByRefAndMerchand?.userId.toString() || newUserByRefAndMerchand?.userId.toString(),

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
        return dayjs(resetTime(new Date()))
        .add(planByIdAndMerchantId?.planType?.interval, planByIdAndMerchantId?.planType?.intervalUnit)
        .toISOString()
    }
}  

export const upgradeSubscription = async (req: Request, res: Response) => {
    try {
        const { oldPlanId, newPlanId, subscriptionId, merchantId } = req.body

        const oldPlanByIdAndMerchantId = await findPlanByIdAndMerchantId(oldPlanId, merchantId)
        const newPlanByIdAndMerchantId = await findPlanByIdAndMerchantId(newPlanId, merchantId)
        const subscriptionById = await findSubscriptionById(subscriptionId)

        if(
            !oldPlanByIdAndMerchantId || 
            !newPlanByIdAndMerchantId || 
            !subscriptionById
        ) {
            return res.status(404).json({ 
                status: 404,
                success: false,
                message: `Something went wrong. Please ensure that the old plan, new plan and subscription exist` 
            })
        }

        if(newPlanByIdAndMerchantId.isActive === false) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `The new plan is not active` 
            })
        }

        if(oldPlanByIdAndMerchantId.price > newPlanByIdAndMerchantId.price) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `You cannot upgrade from a higher plan to a lower plan.` 
            })
        }

         // Check if billing cycle has started
         const today = dayjs(new Date())
        //  const billingCycleStart = dayjs(subscriptionById?.billing?.billingCycleAnchor)
        // const isBillingCycleStarted = today.isAfter(billingCycleStart)

        // Amount to be charged, add proration
        const amountToBeCharged = await upgradeDuringBillingCycle(
            newPlanByIdAndMerchantId,
            oldPlanByIdAndMerchantId,
            subscriptionById
        )

        subscriptionById.planIdIndex = newPlanByIdAndMerchantId.PlanId,
        subscriptionById.billing.nextBillingDate = dayjs(today)
            .add(newPlanByIdAndMerchantId.planType.interval, newPlanByIdAndMerchantId.planType.intervalUnit)
            .toISOString(),
        subscriptionById.billing.lastBillingDate = new Date().toISOString(),
        subscriptionById.billing.billingCycle = newPlanByIdAndMerchantId.planType.interval,
        subscriptionById.billing.billingCycleUnit = newPlanByIdAndMerchantId.planType.intervalUnit,
        subscriptionById.billing.billingCycleAnchor = today.toISOString(),
        subscriptionById.billing.billingAmount = newPlanByIdAndMerchantId.price,
        subscriptionById.billing.billingCurrency = newPlanByIdAndMerchantId.currency
        
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Subscription upgraded successfully',
            subscription: subscriptionById,
            amountCharged: amountToBeCharged
        })
    }
    catch (err: any) {
        res.status(500).json({ 
            status: 500,
            success: false,
            message: 'Error upgrading subscription', 
            error: err.message
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