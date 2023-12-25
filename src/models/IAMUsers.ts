import { UserRole } from "../helpers/users"

export interface IIAMUser  {
    emailIndex: string
    nameIndex: string
    
    IAMid: string
    auth: {
        password: string
        email: string
    }
    name: string
    role: UserRole.IAM
    merchant: string
    createdAt: Date
}