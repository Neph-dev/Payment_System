import { NextFunction, Request, Response } from 'express'

import { v4 as uuidv4 } from 'uuid'
import { ITransaction, TransactionStatus } from '../models/Transaction'


export const initializePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {
            transactionType,
            transactionAmount,
            transactionCurrency,
            transactionDescription,
            transactionMetadata,
            userId,
            merchantId,
            planId
        } = req.body

        const transaction: ITransaction = {
            userIdIndex: userId,
            merchantIdIndex: merchantId,
            planIdIndex: planId,

            transactionId: uuidv4(),
            transactionStatus: TransactionStatus.PENDING,
            transactionType: transactionType,
            transactionAmount: transactionAmount,
            transactionCurrency: transactionCurrency,
            transactionDescription: transactionDescription || undefined,
            transactionCreatedAt: new Date().toISOString(),
            transactionMetadata: transactionMetadata || undefined,
        }

        req.body = transaction

        next()
    }
    catch (err: any) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: err.message
        })
    }
}