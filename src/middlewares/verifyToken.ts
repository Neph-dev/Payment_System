import { NextFunction, Request, Response } from "express"
const jwt = require('jsonwebtoken')


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers['access-token']

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }
    jwt.verify(token, process.env.JWT_SECRET!, (err: Error | null, decoded: any) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' })
        }
        req.body.decoded = decoded

        if(decoded.data.isAccountVerified === false) {
            return res.status(403).json({ 
                message: "Account not verified. Please check your email for verification link" 
            })
        }
        
        decoded.data.auth.password = null

        next()
    })
}