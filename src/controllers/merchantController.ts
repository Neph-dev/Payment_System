import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import bcrypt from 'bcrypt'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

import { AccountType, IMerchant, MerchantStatus } from '../models/Merchant'
import { 
    findMerchantByEmail, 
    findMerchantByName, 
    findMerchantByRegistrationNumber 
} from '../helpers/findMerchant'
import { CreateSuperAdmin } from './superAdminController'
import { sendMerchantVerificationEmail } from '../helpers/sendEmail'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const MERCHANT_TABLE_NAME = 'Merchants'


// * 1. Check if the merchant already exist by email, name, or registration number.
// * 2. If yes, send response
// * 3. If no, first, generate merchant,
// * 4. then, generate user with SuperAdmin role
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
            createdAt: new Date()
        }

        const verificationToken = uuidv4()
        merchant.auth.confirmationCode = verificationToken
        merchant.auth.codeExpirationDate = dayjs().hour(24).format()
        
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
        
        await sendMerchantVerificationEmail(email, verificationToken)

        res.status(201).json({ 
            message: 'Merchant Created Successfully!',
            status: 201,
            success: true,
            data: body
        })
    }
    catch (error) {
        console.error('Error creating merchant:', error)
        res.status(500).json({ 
            message: `Internal Server Error ${error}`,
            status: 500,
            success: false,
        })
    }
}