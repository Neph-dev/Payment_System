import { UserRole } from "../helpers/users"

export interface ISuperAdmin  {
    superAdminId: string
    
    emailIndex: string
    IDNumberIndex: string
  
    personal: {
      firstName: string
      middleName: string
      lastName: string
      phoneNumber: string
      IDType?: string
      IDNumber?: string
    }
    contact: {
      email: string
      phoneNumber: string
      physicalAddress: {
        streetAddress: string
        postalCode: string
        city: string
        country: string
      }
    }
    role: UserRole.SUPERADMIN
    merchants: [string?]
    createdAt: Date
  }
  
