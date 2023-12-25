export interface IPlan {

    merchantIdIndex: string
    nameIndex: string

    PlanId: string
    name: string
    description: string
    price: number
    currency: string
    promotion: {
        isOnPromotion: boolean
        oldPrice?: number
        promotionStart?: Date
        promotionEnd?: Date
    }
    features: [
        {
            featureId: string
            featureName: string
            featureDescription: string
        }
    ]
    isActive: boolean
    createdAt: Date
}