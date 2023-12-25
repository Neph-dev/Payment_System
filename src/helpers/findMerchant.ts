import { IMerchant } from "../models/Merchant"
import AWS from 'aws-sdk'

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const MERCHANT_TABLE_NAME = 'Merchants'


export const findMerchantById = async (merchantId: string): Promise<IMerchant | undefined> => {
    const params = {
        TableName: MERCHANT_TABLE_NAME,
        KeyConditionExpression: '#MerchantId = :MerchantId',
        ExpressionAttributeNames: { '#MerchantId': 'MerchantId' },
        ExpressionAttributeValues: { ':MerchantId': merchantId }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IMerchant
}

export const findMerchantByEmail = async (email: string): Promise<IMerchant | undefined> => {
    const params = {
        TableName: MERCHANT_TABLE_NAME,
        IndexName: 'email-index',
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: { '#email': 'email' },
        ExpressionAttributeValues: { ':email': email }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IMerchant
}

export const findMerchantByName = async (name: string): Promise<IMerchant | undefined> => {
    const params = {
        TableName: MERCHANT_TABLE_NAME,
        IndexName: 'name-index',
        KeyConditionExpression: '#name = :name',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': name }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IMerchant
}

export const findMerchantByRegistrationNumber = async (registrationNumber: string): Promise<IMerchant | undefined> => {
    const params = {
        TableName: MERCHANT_TABLE_NAME,
        IndexName: 'registrationNumber-index',
        KeyConditionExpression: '#registrationNumber = :registrationNumber',
        ExpressionAttributeNames: { '#registrationNumber': 'registrationNumber' },
        ExpressionAttributeValues: { ':registrationNumber': registrationNumber }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IMerchant
}