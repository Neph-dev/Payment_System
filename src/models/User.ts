import { UserRole } from "../helpers/users"

export interface IUser  {
    referenceIndex: string
    merchantIdIndex: string
    
    userId: string
    email?: String
    phoneNumber?: String
    auth?: {
        username?: string
        password?: string
    }
    verification?: {
        isEmailVerified?: boolean
        isPhoneNumberVerified?: boolean
    }
    role: UserRole.USER
    createdAt: string
}