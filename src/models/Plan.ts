export interface IPlan {

    merchantIdIndex: string
    nameIndex: string

    PlanId: string
    name: string
    description: string
    price: number
    currency: string
    planType: PlanType
    promotion?: {
        isOnPromotion: boolean
        oldPrice?: number
        promotionStart?: string
        promotionEnd?: string
    }
    features?: PlanFeature[]
    isActive: boolean
    createdAt: string
}

type PlanType = {
    isRecurring: boolean
    interval: number // recurring only
    intervalUnit?: IntervalUnit // recurring only
    trialPeriodDays: number // recurring only
}

type PlanFeature = {
    featureId: string
    featureName: string
    featureDescription: string
}

export enum IntervalUnit {
    day = 'day',
    week = 'week',
    month = 'month',
    year = 'year'
}