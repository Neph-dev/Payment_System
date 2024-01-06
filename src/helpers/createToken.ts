const jwt = require('jsonwebtoken')
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

export const CreateToken = (data: any) => {
    const token = jwt.sign({
        data: data
    }, process.env.JWT_SECRET, { expiresIn: '24h' })
    
    return token
}

export const generateVerificationCode = async (merchant: any) => {
    const verificationToken = uuidv4()
    let data = {
        verificationToken: verificationToken,
        codeExpirationDate: dayjs().hour(24).format()
    }

    return data
}