import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import { v4 as uuidv4 } from 'uuid'
import { IPlan } from '../models/Plan'
import { findPlanByNameAndMerchantId } from '../helpers/findPlan'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const PLAN_TABLE_NAME = 'Plans'


export const createPlan = async (req: Request, res: Response) => {
    try {
        let body = req.body 
        let merchantId = body.decoded.data.MerchantId
        const { name, description, price, currency, features, planType } = req.body

        const existingPlanByName = await findPlanByNameAndMerchantId(name, merchantId)
        if (existingPlanByName) {
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: `Plan with name ${name} already exist`
            })
        }

        const plan: IPlan = {
            merchantIdIndex: merchantId,
            nameIndex: name,

            PlanId: uuidv4(),
            name: name,
            description: description,
            price: price,
            currency: currency,
            features: features,
            planType: planType,
            isActive: true,
            promotion: {
                isOnPromotion: false,
                oldPrice: price
            },
            createdAt: new Date().toISOString()
        }

        const params = {
            TableName: PLAN_TABLE_NAME,
            Item: plan
        }

        await dynamoDB.put(params).promise()

        res.status(201).json({ 
            message: 'Plan created successfully',
            status: 201,
            success: true,
            data: plan
        })
    }
    catch (error) {
        res.status(500).json({ 
            message: `Internal Server Error ${error}`,
            status: 500,
            success: false
        })
    }
}

export const getSinglePlan = async (req: Request, res: Response) => {
    try {
        let body = req.body
        let merchantId = body.decoded.data.MerchantId
        const { name } = req.params

        const existingPlanByName = await findPlanByNameAndMerchantId(name, merchantId)
        if (!existingPlanByName) {
            return res.status(400).json({ 
                status: 404,
                success: false,
                message: `Plan with name ${name} not found`
            })
        }
        res.status(200).json({
            message: 'Plan found',
            status: 200,
            success: true,
            data: existingPlanByName
        })
    }
    catch (error) {
        res.status(500).json({ 
            message: `Internal Server Error ${error}`,
            status: 500,
            success: false
        })
    }
}

export const getPlans = async (req: Request, res: Response) => {
    try {
        const merchantId = req.body.decoded.data.MerchantId

        const params = {
            TableName: PLAN_TABLE_NAME,
            IndexName: 'merchantIdIndex-index',
            KeyConditionExpression: '#merchantIdIndex = :merchantIdIndex',
            ExpressionAttributeNames: { '#merchantIdIndex': 'merchantIdIndex' },
            ExpressionAttributeValues: { ':merchantIdIndex': merchantId }
        }

        const data = await dynamoDB.query(params).promise()

        if (!data.Items || data.Items.length === 0) {
            return res.status(404).json({ 
                message: 'No Plans Found',
                status: 404,
                success: false
            })
        }

        res.status(200).json({ 
            message: 'Plans Found',
            status: 200,
            success: true,
            data: data.Items
        })

    }
    catch (error) {
        res.status(500).json({ 
            message: `Internal Server Error ${error}`,
            status: 500,
            success: false
        })
    }
}


// *! NOT WORKING
export const updatePlan = async (req: Request, res: Response) => {
    try {
        const body = req.body
        const merchantId = body.decoded.data.MerchantId
        const { name } = req.params
        const { description, price, currency, features } = req.body

        const existingPlanByName = await findPlanByNameAndMerchantId(name, merchantId)
        if (!existingPlanByName) {
            return res.status(400).json({ 
                status: 404,
                success: false,
                message: `Plan with name ${name} not found`
            })
        }

        const params = {
            TableName: PLAN_TABLE_NAME,
            Key: {
                merchantIdIndex: merchantId,
                nameIndex: name
            },
            UpdateExpression: 'set description = :description, price = :price, currency = :currency, features = :features',
            ExpressionAttributeValues: {
                // ':nameIndex': name,
                ':description': description,
                ':price': price,
                ':currency': currency,
                ':features': features
            },
            ReturnValues: 'UPDATED_NEW'
        }

        const data = await dynamoDB.update(params).promise()

        res.status(200).json({ 
            message: 'Plan updated successfully',
            status: 200,
            success: true,
            data: data
        })
    }
    catch (error) {
        res.status(500).json({ 
            message: `Internal Server Error ${error}`,
            status: 500,
            success: false
        })
    }
}