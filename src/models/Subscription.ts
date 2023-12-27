export interface ISubscription {
    
    referenceIndex?: string 
    merchantIdIndex: string
    planIdIndex: string

    subscriptionId: string
    subscriptionStatus: SubscriptionStatus
    cancellationReason?: string
    merchantId: string
    planId: string
    billing: {
        nextBillingDate: Date
        lastBillingDate: Date
        billingCycle: number
        billingCycleUnit: string
        billingCycleAnchor: string //*represents the date that billing starts
        billingAmount: number
        billingCurrency: string
    }
    freeTrial?: {
        isOnFreeTrial: boolean
        freeTrialStart?: Date
        freeTrialEnd?: Date
    }
    paymentMethod?: {
        paymentMethodType: string
        paymentMethodId: string
        cardBrand: string
        cardLast4: string
        cardExpMonth: string
        cardExpYear: string
        cardHolderName: string
        cardCountry: string
        cardFunding: string
        billingAddress?: Address
    }
    renewal: {
        autoRenew: boolean
    }
    notificationPreferences: {
        notifyOnRenewal: boolean
        notifyOnCancellation: boolean
        notifyOnTrialEnd: boolean
    }
    metadata?: {
        [key: string]: string
    }
    createdAt: string
}

export enum SubscriptionStatus {
    Active = 'active',
    Canceled = 'canceled',
    Expired = 'expired',
}

type Address = {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
}