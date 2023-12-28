import AWS from 'aws-sdk'

const SES_CONFIG = {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    region: 'af-south-1'
}

const AWS_SES = new AWS.SES(SES_CONFIG)

export const sendMerchantVerificationEmail = async (email: string,  token: string) => {
    const params = {
        Source: process.env.SES_EMAIL  || '',
        Destination: {
            ToAddresses: [email || '']
        },
        ReplyToAddresses: [process.env.SES_EMAIL || ''],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <body>
                                <p>Dear User,</p>
                                <p>We have received a request to authorize this email address for use with Payment_System. If you requested this verification, please go to the following URL to confirm that you are authorized to use this email address:</p>
                                <p>Please use the following link to complete your registration:</p>
                                <p>${process.env.CLIENT_URL}/v1/verify/${token}/${email}</p>
                                <p>Your request will not be processed unless you confirm the address using this URL. This link expires 24 hours after your original verification request.</p>
                                <p></p>
                                <p></p>
                                <p>Sincerely,</p>

                                <p>Payment_System Team.</p>
                            </body>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Complete your registration'
            }
        }
    }

    return AWS_SES.sendEmail(params).promise();
}

export const sendIAMVerificationEmail = async (
    email: string, 
    token: string, 
    merchant: string,
    password: string
) => {
    const params = {
        Source: process.env.SES_EMAIL  || '',
        Destination: {
            ToAddresses: [email || '']
        },
        ReplyToAddresses: [process.env.SES_EMAIL || ''],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                        <html>
                            <body>
                                <p>Dear User,</p>
                                <p>You've been given access to ${merchant}</p>
                                <p>Please use the following link to complete your registration:</p>
                                <p>${process.env.CLIENT_URL}/v1/verify/IAM/${token}/${email}</p>
                                <p>Your auto-generated password is ${password}</p>
                                <p>Your request will not be processed unless you confirm the address using this URL. This link expires 24 hours after your original verification request.</p>
                                <p></p>
                                <p></p>
                                <p>Sincerely,</p>

                                <p>Payment_System Team.</p>
                            </body>
                        </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Complete your registration'
            }
        }
    }

    return AWS_SES.sendEmail(params).promise();
}