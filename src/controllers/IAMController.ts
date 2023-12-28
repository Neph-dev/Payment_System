import { Request, Response } from 'express'

import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import bcrypt from 'bcrypt'
import generator from 'generate-password'

import AWS from 'aws-sdk'
import { IIAMUser } from '../models/IAMUsers'
import { UserRole } from '../helpers/users'
import { findIAMuserByEmail, findIAMuserByName } from '../helpers/findUser'
import { findMerchantById } from '../helpers/findMerchant'
import { sendIAMVerificationEmail } from '../helpers/sendEmail'

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

        let password = generator.generate({ length: 10, numbers: true })

        const hashedPassword = await bcrypt.hash(password, 10)

        const IAMUser: IIAMUser = {
            emailIndex: body.email,
            nameIndex: body.name,
            
            IAMid: uuidv4(),
            name: body.name,
            isAccountVerified: false,
            auth: {
                email: body.email,
                password: hashedPassword
            },
            role: UserRole.IAM,
            merchant: body.decoded.data.MerchantId,
            createdAt: new Date()
        }

        const verificationToken = uuidv4()
        IAMUser.auth.confirmationCode = verificationToken
        IAMUser.auth.codeExpirationDate = dayjs().hour(24).format()
        
        const params = { TableName: IAM_TABLE_NAME, Item: IAMUser}

        await dynamoDB.put(params).promise()

        await sendIAMVerificationEmail(body.email, verificationToken, body.decoded.data.name, password)

        return res.status(200).json({
            message: 'IAM generated successfully'
        })
    }
    catch(err){
        return res.status(500).json({ message: 'Internal server error' })
    }
}