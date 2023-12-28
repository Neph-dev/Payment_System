import { Request, Response } from 'express'

import AWS from 'aws-sdk'
import dayjs from 'dayjs'

import { findMerchantByEmail } from '../helpers/findMerchant'
import { findIAMuserByEmail } from '../helpers/findUser'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const MERCHANT_TABLE_NAME = 'Merchants'
const IAM_TABLE_NAME = 'IAMusers'


export const verifyMerchantAccountController = async (req: Request, res: Response) => {
    try {
        const { email, token } = req.params

        const existingMerchantByEmail = await findMerchantByEmail(email)
        if (!existingMerchantByEmail ) {
            return res.status(404).json({ message: "Merchant doesn't exist" })
        }
        if (existingMerchantByEmail.isAccountVerified) {
            return res.status(400).json({ message: 'Account already verified' })
        }
        if (existingMerchantByEmail.auth.confirmationCode !== token) {
            return res.status(400).json({ message: 'Invalid token' })
        }
        if (dayjs().isAfter(existingMerchantByEmail.auth.codeExpirationDate)) {
            return res.status(400).json({ message: 'Token expired' })
        }

        const params = {
            TableName: MERCHANT_TABLE_NAME,
            Key: {
                MerchantId: existingMerchantByEmail.MerchantId
            },
            UpdateExpression: 'set isAccountVerified = :isAccountVerified',
            ExpressionAttributeValues: {
                ':isAccountVerified': true
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await dynamoDB.update(params).promise()
        res.status(201).json({ 
            message: 'Merchant Verified Successfully!',
            status: 201,
            success: true,
        })

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 500,
            success: false
        })
    }
}


export const verifyIAMAccountController = async (req: Request, res: Response) => {
    try {
        const { email, token } = req.params

        const existingIAMByEmail = await findIAMuserByEmail(email)
        if (!existingIAMByEmail ) {
            return res.status(404).json({ message: "User doesn't exist" })
        }
        if (existingIAMByEmail.isAccountVerified) {
            return res.status(400).json({ message: 'Account already verified' })
        }
        if (existingIAMByEmail.auth.confirmationCode !== token) {
            return res.status(400).json({ message: 'Invalid token' })
        }
        if (dayjs().isAfter(existingIAMByEmail.auth.codeExpirationDate)) {
            return res.status(400).json({ message: 'Token expired' })
        }

        const params = {
            TableName: IAM_TABLE_NAME,
            Key: {
                IAMid: existingIAMByEmail.IAMid
            },
            UpdateExpression: 'set isAccountVerified = :isAccountVerified',
            ExpressionAttributeValues: {
                ':isAccountVerified': true
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await dynamoDB.update(params).promise()
        res.status(201).json({ 
            message: 'User Verified Successfully!',
            status: 201,
            success: true,
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 500,
            success: false
        })
    }
}