import { Request, Response } from 'express'

import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcrypt'

import AWS from 'aws-sdk'
import { IIAMUser } from '../models/IAMUsers'
import { UserRole } from '../helpers/users'
import { findIAMuserByEmail, findIAMuserByName } from '../helpers/findUser'
import { findMerchantById } from '../helpers/findMerchant'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const IAM_TABLE_NAME = 'IAMusers'


export const generateIAM = async (req: Request, res: Response) => {
    try{

        const body = req.body

        const merchantById = await findMerchantById(body.decoded.data.MerchantId)
        if(!merchantById) {
            return res.status(400).json({ 
                status: 400,
                message: `Merchant with id ${body.decoded.data.MerchantId} does not exist` 
            })
        }

        const IAMuserByEmail = await findIAMuserByEmail(body.email)
        const IAMuserByName = await findIAMuserByName(body.name)

        if(IAMuserByEmail || IAMuserByName) {
            return res.status(400).json({ 
                status: 400,
                message: `IAM with same name or email already exist` 
            })
        }

        const hashedPassword = await bcrypt.hash(body.password, 10)
        body.password = hashedPassword

        const IAMUser: IIAMUser = {
            emailIndex: body.email,
            nameIndex: body.name,
            
            IAMid: uuidv4(),
            name: body.name,
            auth: {
                email: body.email,
                password: body.password
            },
            role: UserRole.IAM,
            merchant: body.decoded.data.MerchantId,
            createdAt: new Date()
        }

        const params = {
            TableName: IAM_TABLE_NAME,
            Item: IAMUser
        }
        await dynamoDB.put(params).promise()

        return res.status(200).json({
            message: 'IAM generated successfully',
            data: req.body
        })
    }
    catch(err){
        return res.status(500).json({ message: 'Internal server error' })
    }
}