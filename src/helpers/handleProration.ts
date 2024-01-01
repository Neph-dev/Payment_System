import dayjs from 'dayjs'
import { IntervalUnit } from '../models/Plan'


export const upgradeDuringBillingCycle = async (
    newPlanByIdAndMerchantId: any,
    oldPlanByIdAndMerchantId: any, 
    subscription: any
) => {
    try {
        const remaingDays = dayjs(subscription.billing.nextBillingDate).diff(dayjs(new Date()), 'day')
        const oldPlanDailyRate = oldPlanByIdAndMerchantId.price / remaingDays
        const amountPaidForTheInitialDays = remaingDays * oldPlanDailyRate
        const remainingAmountForNewPlan = newPlanByIdAndMerchantId.price - amountPaidForTheInitialDays

        return remainingAmountForNewPlan.toFixed(2)

    }
    catch (err: any) {
        console.log(err.message)
    }
}