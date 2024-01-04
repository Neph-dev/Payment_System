export interface ITransaction  {
    userIdIndex?: string
    merchantIdIndex: string
    planIdIndex: string

    transactionId: string
    transactionStatus: TransactionStatus
    transactionType: TransactionType
    transactionAmount: number
    transactionCurrency: string
    transactionDescription: string
    transactionMetadata?: {
        [key: string]: string
    }
    transactionCreatedAt: string
}

export enum TransactionStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed'
}

export enum TransactionType {
    Payment = 'payment',
    Refund = 'refund',
    Chargeback = 'chargeback'
}