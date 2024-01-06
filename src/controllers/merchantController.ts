import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

import { CreateSuperAdmin } from './superAdminController'
import { sendMerchantVerificationEmail } from '../helpers/sendEmail'
import { AccountType, IMerchant, MerchantStatus } from '../models/Merchant'
import { findMerchantByEmail, findMerchantByName, findMerchantByRegistrationNumber } from '../helpers/findMerchant'
import { generateVerificationCode } from '../helpers/createToken'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const MERCHANT_TABLE_NAME = 'Merchants'


// * Creating the Merchant, we need to:
// *    1. Check if the Merchant already exists in the database   
// *    2. Hash the password
// *    3. Generate a verification token
// *    4. Send the verification email
// *    5. Create a Super Admin if one doesn't exist
// *    6. Save the Merchant in the database
// *    7. Return a success message

export const createMerchant = async (req: Request, res: Response) => {
    try{
        let body = req.body
        const { name, email, registrationNumber, accountType } = req.body

        if (!Object.values(AccountType).includes(accountType)) {
            return res.status(400).json({ 
                message: 'Invalid account type',
                status: 400,
                success: false
            })
        }

        const existingMerchantByName = await findMerchantByName(name)
        const existingMerchantByEmail = await findMerchantByEmail(email)
        const existingMerchantByRegistrationNumber = await findMerchantByRegistrationNumber(registrationNumber)

        if (
            existingMerchantByName || 
            existingMerchantByEmail || 
            existingMerchantByRegistrationNumber 
        ) {
            return res.status(400).json({ message: 'Merchant already exist' })
        }

        const hashedPassword = await bcrypt.hash(body.password, 10)
        body.password = hashedPassword

        const merchant: IMerchant = {
            MerchantId: uuidv4(),
            name: name,
            email: email,
            accountType: body.accountType,
            registrationNumber: body.registrationNumber,
            isAccountVerified: false,
            auth: {
                emailAddress: email,
                password: body.password
            },
            information: {
                logo: body.logo || null,
                industry: body.industry,
                websiteUrl: body.websiteUrl || null,
                description: body.description || null,
                registrationNumber: body.registrationNumber,
                merchantStatus: MerchantStatus.Pending
            },
            contact: {
                phoneNumber: body.phoneNumber,
                physicalAddress: {
                    streetAddress: body.streetAddress,
                    postalCode: body.postalCode,
                    city: body.city,
                    country: body.country
                }
            },
            createdAt: new Date().toISOString()
        }

        let verificationData = await generateVerificationCode(merchant)

        merchant.auth.confirmationCode = verificationData.verificationToken
        merchant.auth.codeExpirationDate = verificationData.codeExpirationDate
        
        const params = { TableName: MERCHANT_TABLE_NAME, Item: merchant }
        
        await dynamoDB.put(params).promise()

        const createSuperAdmin = await CreateSuperAdmin(req, res)
        if (createSuperAdmin === 500) {
            return res.status(500).json({ 
                message: 'Error Creating Super Admin',
                status: 500,
                success: false
            })
        }
        
        await sendMerchantVerificationEmail(email, verificationData.verificationToken)

        res.status(201).json({ 
            message: 'Merchant Created Successfully!',
            status: 201,
            success: true,
            data: body
        })
    }
    catch (error) {
        res.status(500).json({ 
            message: `Internal Server Error ${error}`,
            status: 500,
            success: false,
        })
    }
}