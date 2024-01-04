import { findSubscriptionsForBilling } from './findSubscription';
import { resetTime } from './handleTimeReset';


export const schedulePayment = async () => {
    try {
        const today = resetTime(new Date())

        const subscriptionsToBill = await findSubscriptionsForBilling(today)
  
        // Iterate through subscriptions and initiate payments
        for (const subscription of subscriptionsToBill) {
            // await initiatePayment(subscription)
        }
    } catch (error: any) {
        console.error(`Error scheduling billing job: ${error.message}`)
    }
}
// 2024-01-03T10:13:29.989Z