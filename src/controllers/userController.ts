import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'
import { UserRole } from '../helpers/users'
import { IUser } from '../models/User'


AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const USER_TABLE_NAME = 'Users'


export const createUser = async (
    email: string,
    referenceIndex: string,
    merchantIdIndex: string,
    phoneNumber: string
) => {
    const body = {
        referenceIndex: referenceIndex,
        merchantIdIndex: merchantIdIndex,
        
        userId: uuidv4(),
        phoneNumber: phoneNumber,
        email: email,
        role: UserRole.USER,
        createdAt: new Date().toISOString()
    }

    const params = {
        TableName: USER_TABLE_NAME,
        Item: body
    }

    await dynamoDB.put(params).promise()

    return body
}