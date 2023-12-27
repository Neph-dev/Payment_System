import { UserRole } from "../helpers/users"

export interface IUser  {
    emailIndex?: string 
    phoneNumberIndex?: string 

    userId: string
    email?: String
    phoneNumber?: String
    auth?: {
        username: string,
        password: string
    }
    verification: {
        isEmailVerified?: boolean
        isPhoneNumberVerified?: boolean
    }
    role: UserRole
    createdAt: Date
}