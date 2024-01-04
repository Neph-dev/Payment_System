import AWS from 'aws-sdk'
import { ISubscription } from "../models/Subscription"

AWS.config.update({ region: 'af-south-1' })
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const SUBSCRIPTION_TABLE_NAME = 'Subscriptions'


export const findSubscriptionById = async (subscriptionId: string): Promise<ISubscription | undefined> => {
    const params = {
        TableName: SUBSCRIPTION_TABLE_NAME,
        KeyConditionExpression: '#subscriptionId = :subscriptionId',
        ExpressionAttributeNames: { '#subscriptionId': 'subscriptionId' },
        ExpressionAttributeValues: { ':subscriptionId': subscriptionId }
    }

    const data = await dynamoDB.query(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return undefined
    }

    return data.Items[0] as ISubscription
}

export const findSubscriptionsForBilling = async (date: Date): Promise<ISubscription[]> => {
    const params = {
        TableName: SUBSCRIPTION_TABLE_NAME,
        FilterExpression: '#nextBillingDate = :nextBillingDate',
        ExpressionAttributeNames: { '#nextBillingDate': 'nextBillingDate' },
        ExpressionAttributeValues: { ':nextBillingDate': date.toISOString() }
    }

    const data = await dynamoDB.scan(params).promise()

    if (!data.Items || data.Items.length === 0) {
        return []
    }

    return data.Items as ISubscription[]
}