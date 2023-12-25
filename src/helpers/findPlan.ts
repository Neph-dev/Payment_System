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