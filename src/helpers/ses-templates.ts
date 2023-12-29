import { SESClient, CreateTemplateCommand } from '@aws-sdk/client-ses'

const SES_CONFIG = {
    accessKeyId: process.env.SES_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    region: 'af-south-1'
}

const sesClient = new SESClient(SES_CONFIG)