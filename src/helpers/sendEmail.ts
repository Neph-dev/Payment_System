import AWS from 'aws-sdk'

const SES_CONFIG = {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    region: 'af-south-1'
}

const AWS_SES = new AWS.SES(SES_CONFIG)


export const sendMerchantVerificationEmail = async (email: string, token: string) => {
    const params = {
      Source: process.env.SES_EMAIL || '',
      Destination: {
        ToAddresses: [email || ''],
      },
      ReplyToAddresses: [process.env.SES_EMAIL || ''],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
              <html>
                <head>
                  <style>
                    body {
                      font-family: 'Arial', sans-serif;
                      margin: 20px;
                      padding: 20px;
                      background-color: #f7f7f7;
                    }
  
                    h2 {
                      color: #333;
                    }
  
                    p {
                      margin: 10px 0;
                      color: #555;
                    }
  
                    a {
                      color: #007bff;
                      text-decoration: none;
                    }
  
                    .expiration {
                      color: #f00;
                    }
  
                    .footer {
                      margin-top: 20px;
                      color: #777;
                    }
                  </style>
                </head>
                <body>
                  <h2>Dear User,</h2>
                  <p>We have received a request to authorize this email address for use with Payment_System. If you requested this verification, please go to the following URL to confirm that you are authorized to use this email address:</p>
                  <p><strong>Please use the following link to complete your registration:</strong></p>
                  <p><a href="${process.env.CLIENT_URL}/v1/verify/${token}/${email}" target="_blank">${process.env.CLIENT_URL}/v1/verify/${token}/${email}</a></p>
                  <p><span class="expiration">Note: This link expires 24 hours after your original verification request.</span></p>
                  <p class="footer">Sincerely,<br />Payment_System Team</p>
                </body>
              </html>
            `,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Complete your registration',
        },
      },
    };
  
    return AWS_SES.sendEmail(params).promise();
};  

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

export const sendSubscriptionReceiptEmail = async (
    email: string,
    merchant: string,
    plan: any,
    total: number
  ) => {
    const params = {
      Source: process.env.SES_EMAIL || '',
      Destination: {
        ToAddresses: [email || ''],
      },
      ReplyToAddresses: [process.env.SES_EMAIL || ''],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `
              <html>
                <head>
                  <style>
                    body {
                      font-family: 'Arial', sans-serif;
                      margin: 20px;
                      padding: 20px;
                      background-color: #f7f7f7;
                    }
  
                    h2 {
                      color: #333;
                    }
  
                    p {
                      margin: 10px 0;
                      color: #555;
                    }
  
                    table {
                      width: 100%;
                      border-collapse: collapse;
                      margin-top: 20px;
                    }
  
                    th, td {
                      padding: 12px;
                      text-align: left;
                      border-bottom: 1px solid #ddd;
                    }
  
                    th {
                      background-color: #f2f2f2;
                    }
  
                    .footer {
                      margin-top: 20px;
                      color: #777;
                    }
                  </style>
                </head>
                <body>
                  <h2>Dear Nephthali Salam,</h2>
                  <p>Thank you for your purchase from <b>${merchant}</b>.</p>
                  <hr />
                  <h2>${merchant} RECEIPT - ${plan.name} - Nephthali Salam</h2>
                  <table>
                    <tr>
                      <th>Item</th>
                      <th>Amount</th>
                    </tr>
                    <tr>
                      <td>${plan.name}</td>
                      <td>${plan.price}</td>
                    </tr>
                    <tr>
                      <td><b>Total</b></td>
                      <td><b>${total}</b></td>
                    </tr>
                  </table>
                  <p class="footer">Sincerely,<br />Payment_System Team</p>
                </body>
              </html>
            `,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Payment Receipt for Nephthali Salam`,
        },
      },
    };
  
    return AWS_SES.sendEmail(params).promise();
};
  