import { IIAMUser } from "../models/IAMUsers"
import { ISuperAdmin } from "../models/SuperAdmin"
import AWS from 'aws-sdk'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUPERADMIN_TABLE_NAME = 'SuperAdmins'
const IAM_TABLE_NAME = 'IAMusers'


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

export const findIAMuserByEmail = async (emailIndex: string): Promise<IIAMUser | undefined> => {
    const params = {
        TableName: IAM_TABLE_NAME,
        IndexName: 'emailIndex-index',
        KeyConditionExpression: '#emailIndex = :emailIndex',
        ExpressionAttributeNames: { '#emailIndex': 'emailIndex' },
        ExpressionAttributeValues: { ':emailIndex': emailIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IIAMUser
}

export const findIAMuserByName = async (nameIndex: string): Promise<IIAMUser | undefined> => {
    const params = {
        TableName: IAM_TABLE_NAME,
        IndexName: 'nameIndex-index',
        KeyConditionExpression: '#nameIndex = :nameIndex',
        ExpressionAttributeNames: { '#nameIndex': 'nameIndex' },
        ExpressionAttributeValues: { ':nameIndex': nameIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IIAMUser
}

// export const findIAMuserByMerchantID = async (nameIndex: string): Promise<IIAMUser | undefined> => {
//     const params = {
//         TableName: IAM_TABLE_NAME,
//         IndexName: 'nameIndex-index',
//         KeyConditionExpression: '#nameIndex = :nameIndex',
//         ExpressionAttributeNames: { '#nameIndex': 'nameIndex' },
//         ExpressionAttributeValues: { ':nameIndex': nameIndex }
//     }

//     const data = await dynamoDB.query(params).promise()

//     if (!data.Items || data.Items.length === 0) {
//         return undefined
//     }

//     return data.Items[0] as IIAMUser
// }