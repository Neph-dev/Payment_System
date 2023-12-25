import { Request, Response } from 'express'

import AWS from 'aws-sdk'

import { v4 as uuidv4 } from 'uuid'

import { findSuperAdminByEmail, findSuperAdminByIDNumber } from '../helpers/findUser'
import { findMerchantByEmail } from '../helpers/findMerchant'
import { IdTypes, UserRole } from '../helpers/users'
import { ISuperAdmin } from '../models/SuperAdmin'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUPERADMIN_TABLE_NAME = 'SuperAdmins'


export const CreateSuperAdmin = async (req: Request, res: Response) => {
    try{
        let body = req.body.user
        const { emailAddress } = req.body

        if (!Object.values(IdTypes).includes(body.IDType)) {
            return res.status(400).json({ 
                message: 'Invalid Id Type',
                status: 400,
                success: false
            })
        }

        const existingUserByEmail = await findSuperAdminByEmail(body.email)
        const existingUserByIDNumber = await findSuperAdminByIDNumber(body.IDNumber)

        const existingMerchantByEmail = await findMerchantByEmail(emailAddress)
        
        if (existingUserByEmail || existingUserByIDNumber ) {
            const params = {
                TableName: SUPERADMIN_TABLE_NAME,
                Key: {
                    superAdminId: existingUserByEmail?.superAdminId
                },
                UpdateExpression: 'SET merchants = list_append(merchants, :merchantId)',
                ExpressionAttributeValues: {
                    ':merchantId': [existingMerchantByEmail?.MerchantId]
                },
                ReturnValues: 'UPDATED_NEW'
            }
            await dynamoDB.update(params).promise()
            return 200
        }

        const superAdmin: ISuperAdmin = {
            superAdminId: uuidv4(),
            
            emailIndex: body.email,
            IDNumberIndex: body.IDNumber,

            personal: {
                firstName: body.firstName,
                middleName: body.middleName || null,
                lastName: body.lastName,
                phoneNumber: body.phoneNumber,
                IDType: body.IDType,
                IDNumber: body.IDNumber
            },
            contact: {
                email: body.email,
                phoneNumber: body.phoneNumber,
                physicalAddress: {
                    streetAddress: body.streetAddress,
                    postalCode: body.postalCode,
                    city: body.city,
                    country: body.country
                }
            },
            role: UserRole.SUPERADMIN,
            merchants: existingMerchantByEmail ? [existingMerchantByEmail.MerchantId] : [],
            createdAt: new Date()
        }

        const params = { TableName: SUPERADMIN_TABLE_NAME, Item: superAdmin }

        await dynamoDB.put(params).promise()
        return 201
    }
    catch (error) {
        console.error('Error creating superAdmin:', error)
        return 500
    }
}

export const CreateAdmin = async (req: Request, res: Response) => {
    // Only the Super admin can create an Admin. In this case, 
    // first check that the userId of the request belongs to an admin, 
    // then generate password associated to the email
    // then create the admin
    // then send the password to the admin's email
    // then return the admin object
}
