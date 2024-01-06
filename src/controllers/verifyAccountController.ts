import { Request, Response } from 'express'

import AWS from 'aws-sdk'
import dayjs from 'dayjs'

import { findMerchantByEmail } from '../helpers/findMerchant'
import { sendMerchantVerificationEmail } from '../helpers/sendEmail'
import { generateVerificationCode } from '../helpers/createToken'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const MERCHANT_TABLE_NAME = 'Merchants'


export const verifyMerchantAccount = async (req: Request, res: Response) => {
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
            status: 201
        })

    }
    catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 500,
        })
    }
}

// * To resend the account verification code, we need to:
// *    1. Check if the Merchant exists in the database
// *    2. Check if the account is already verified
// *    3. Generate a verification token
// *    4. Send the verification email
// *    5. Save the verification token in the database
export const resendVerificationCode = async (req: Request, res: Response) => {
    try {
        const { email } = req.params

        const existingMerchantByEmail = await findMerchantByEmail(email)
        if (!existingMerchantByEmail) {
            return res.status(404).json({ message: "Merchant doesn't exist" })
        }
        if (existingMerchantByEmail.isAccountVerified) {
            return res.status(400).json({ message: 'Account already verified' })
        }

        let verificationData = await generateVerificationCode(existingMerchantByEmail)

        const params = {
            TableName: MERCHANT_TABLE_NAME,
            Key: {
                MerchantId: existingMerchantByEmail.MerchantId
            },
            UpdateExpression: 'set auth.confirmationCode = :confirmationCode, auth.codeExpirationDate = :codeExpirationDate',
            ExpressionAttributeValues: {
                ':confirmationCode': verificationData.verificationToken,
                ':codeExpirationDate': verificationData.codeExpirationDate
            },
            ReturnValues: 'UPDATED_NEW'
        }

        await dynamoDB.update(params).promise()

        await sendMerchantVerificationEmail(email, verificationData.verificationToken)

        res.status(201).json({ 
            message: 'Verification code sent successfully!',
            status: 201
        })

    }
    catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error',
            status: 500,
        })
    }
}