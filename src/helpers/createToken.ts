const jwt = require('jsonwebtoken')


export const CreateToken = (data: any) => {
    const token = jwt.sign({
        data: data
    }, process.env.JWT_SECRET, { expiresIn: '24h' })
    
    return token
}