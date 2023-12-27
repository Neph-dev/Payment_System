export interface IPlan {

    merchantIdIndex: string
    nameIndex: string

    PlanId: string
    name: string
    description: string
    price: number
    currency: string
    type?: PlanType
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
    isOneTime: boolean
    interval?: string // recurring only
    trialPeriodDays?: number // recurring only
}

type PlanFeature = {
    featureId: string
    featureName: string
    featureDescription: string
}