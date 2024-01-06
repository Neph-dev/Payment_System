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


// * When creating a Super Admin, we need to:
// *    1. Check iff the IdType is correct
// *    2. Check if the Super Admin already exists in the database
// *    3. If the Super Admin already exists, add the Merchant to the Super Admin's merchants list
// *    4. if the Super Admin does not exist, create the Super Admin and add the Merchant to the Super Admin's merchants list

export const CreateSuperAdmin = async (req: Request, res: Response) => {
    try{
        let body = req.body.user
        const { emailAddress } = req.body

        if (!Object.values(IdTypes).includes(body.IDType)) {
            return 500
        }
        else {

            const existingSuperAdminByEmail = await findSuperAdminByEmail(body.email)
            const existingSuperAdminByIDNumber = await findSuperAdminByIDNumber(body.IDNumber)

            const existingMerchantByEmail = await findMerchantByEmail(emailAddress)
            
            if (existingSuperAdminByEmail || existingSuperAdminByIDNumber ) {
                const params = {
                    TableName: SUPERADMIN_TABLE_NAME,
                    Key: {
                        superAdminId: existingSuperAdminByEmail?.superAdminId
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
    }
    catch (error) {
        console.error('Error creating superAdmin:', error)
        return 500
    }
}