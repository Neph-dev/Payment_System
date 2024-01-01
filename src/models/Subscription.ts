export interface ISubscription {
    
    referenceIndex?: string 
    merchantIdIndex: string
    planIdIndex: string
    userIdIndex?: string
    email: string

    subscriptionId: string
    subscriptionStatus: SubscriptionStatus
    cancellationReason?: string | null
    billing: {
        nextBillingDate: string | null
        lastBillingDate?: string | null
        billingCycle?: number | null
        billingCycleUnit?: string | null
        billingCycleAnchor?: string | null //*represents the date that billing starts
        billingAmount?: number | null
        billingCurrency?: string
    }
    freeTrial?: {
        isOnFreeTrial: boolean
        freeTrialStart?: string
        freeTrialEnd?: string
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
    CanceledByMerchant = 'canceled by merchant',
    CanceledByCustomer = 'canceled by customer',
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