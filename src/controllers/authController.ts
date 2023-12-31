import { Request, Response } from 'express'
import  bcrypt from 'bcrypt'

import { findMerchantByEmail, findMerchantById } from '../helpers/findMerchant'
import { LoginAs } from '../helpers/users'
import { CreateToken } from '../helpers/createToken'


export const Login = async (req: Request, res: Response) => {

    const { email, password, loginAs } = req.body

    if (!Object.values(LoginAs).includes(loginAs)) {
        return res.status(400).json({ message: 'Invalid login option' })
    }

    try{
        if(loginAs === LoginAs.SUPERADMIN) {
            const loginAsMerchant = await LoginAsMerchant(email, password)

            if(loginAsMerchant === 404) {
                return res.status(404).json({ message: 'Incorrect email address.' })
            }
            else if(loginAsMerchant === 401) {
                return res.status(401).json({ message: 'Incorrect password.' })
            }

            const token = await CreateToken(loginAsMerchant)

            if(loginAsMerchant.isAccountVerified === false) {
                return res.status(200).json({ 
                    message: 'Login Successfull',
                    status: 200,
                    token: token,
                    isAccountVerified: false
                })
            }
            
            return res.status(200).json({ 
                message: 'Login Successfull',
                status: 200,
                token: token
            })
        }
    }
    catch(err){
        return res.status(500).json({ message: 'Internal server error' })
    }

}

const LoginAsMerchant = async (email: string, password: string) => {
    
    const merchantByEmail = await findMerchantByEmail(email)
    if (!merchantByEmail) {
        return 404
    }

    const isPasswordCorrect = await bcrypt.compare(password, merchantByEmail.auth.password)
    if (!isPasswordCorrect) {
        return 401
    }
    
    return merchantByEmail
}