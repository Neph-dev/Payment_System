import AWS from 'aws-sdk'
import { IPlan } from "../models/Plan"

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const PLAN_TABLE_NAME = 'Plans'


export const findPlanByNameAndMerchantId = async (nameIndex: string, merchantIdIndex: string): Promise<IPlan | undefined> => {
    const params = {
        TableName: PLAN_TABLE_NAME,
        IndexName: 'NameMerchantIndex',
        KeyConditionExpression: '#nameIndex = :nameIndex AND #merchantIdIndex = :merchantIdIndex',
        ExpressionAttributeNames: { '#nameIndex': 'nameIndex', '#merchantIdIndex': 'merchantIdIndex' },
        ExpressionAttributeValues: { ':nameIndex': nameIndex, ':merchantIdIndex': merchantIdIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IPlan
}

export const findPlanByIdAndMerchantId = async (PlanId: string, merchantIdIndex: string): Promise<IPlan | undefined> => {
    const params = {
        TableName: PLAN_TABLE_NAME,
        IndexName: 'PlanIdMerchantIndex',
        KeyConditionExpression: '#PlanId = :PlanId AND #merchantIdIndex = :merchantIdIndex',
        ExpressionAttributeNames: { '#PlanId': 'PlanId', '#merchantIdIndex': 'merchantIdIndex' },
        ExpressionAttributeValues: { ':PlanId': PlanId, ':merchantIdIndex': merchantIdIndex }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as IPlan
}