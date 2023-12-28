import { UserRole } from "../helpers/users"

export interface IIAMUser  {
    emailIndex: string
    nameIndex: string
    
    IAMid: string
    isAccountVerified: boolean
    auth: {
        password: string
        email: string
        confirmationCode?: string
        codeExpirationDate?: string
    }
    name: string
    role: UserRole
    merchant: string
    createdAt: Date
}