import { ISuperAdmin } from "../models/SuperAdmin"
import AWS from 'aws-sdk'
import { IUser } from "../models/User"

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUPERADMIN_TABLE_NAME = 'SuperAdmins'
const IAM_TABLE_NAME = 'IAMusers'
const USER_TABLE_NAME = 'Users'


export const findSuperAdminByEmail = async (emailIndex: string): Promise<ISuperAdmin | undefined> => {
    const params = {
        TableName: SUPERADMIN_TABLE_NAME,
        IndexName: 'emailIndex-index',
        KeyConditionExpression: '#emailIndex = :emailIndex',
        ExpressionAttributeNames: { '#emailIndex': 'emailIndex' },
        ExpressionAttributeValues: { ':emailIndex': emailIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as ISuperAdmin
}

export const findSuperAdminByIDNumber = async (IDNumberIndex: string): Promise<ISuperAdmin | undefined> => {
    const params = {
        TableName: SUPERADMIN_TABLE_NAME,
        IndexName: 'IDNumberIndex-index',
        KeyConditionExpression: '#IDNumberIndex = :IDNumberIndex',
        ExpressionAttributeNames: { '#IDNumberIndex': 'IDNumberIndex' },
        ExpressionAttributeValues: { ':IDNumberIndex': IDNumberIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as ISuperAdmin
}

export const findUserByEmail = async (emailIndex: string): Promise<IUser | undefined> => {
    const params = {
        TableName: USER_TABLE_NAME,
        IndexName: 'emailIndex-index',
        KeyConditionExpression: '#emailIndex = :emailIndex',
        ExpressionAttributeNames: { '#emailIndex': 'emailIndex' },
        ExpressionAttributeValues: { ':emailIndex': emailIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IUser
}

export const findUserByPhoneNumber = async (phoneNumberIndex: string): Promise<IUser | undefined> => {
    const params = {
        TableName: USER_TABLE_NAME,
        IndexName: 'phoneNumberIndex-index',
        KeyConditionExpression: '#phoneNumberIndex = :phoneNumberIndex',
        ExpressionAttributeNames: { '#phoneNumberIndex': 'phoneNumberIndex' },
        ExpressionAttributeValues: { ':phoneNumberIndex': phoneNumberIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IUser
}

export const findUserByRefAndMerchand = async (
    referenceIndex: string, merchantIdIndex:string
): Promise<IUser | undefined> => {
    const params = {
        TableName: USER_TABLE_NAME,
        IndexName: 'RefMerchantIndex',
        KeyConditionExpression: '#referenceIndex = :referenceIndex AND #merchantIdIndex = :merchantIdIndex',
        ExpressionAttributeNames: { 
            '#referenceIndex': 'referenceIndex', 
            '#merchantIdIndex': 'merchantIdIndex' 
        },
        ExpressionAttributeValues: { 
            ':referenceIndex': referenceIndex, 
            ':merchantIdIndex': merchantIdIndex 
        }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IUser
}