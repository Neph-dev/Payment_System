// ! REMINDER: change indexes names to e.g: nameIndex

export interface IMerchant {
    MerchantId: string
    name: string
    email: string
    registrationNumber: string
    accountType: AccountType
    auth: {
        emailAddress: string
        password: string
    }
    information: {
        logo?: string
        industry: string
        websiteUrl?: string
        description?: string
        registrationNumber: string
        merchantStatus: MerchantStatus
    }
    contact: {
        phoneNumber: string
        physicalAddress: {
            streetAddress: string
            postalCode: string
            city: string
            country: string
        }
    }
    documentation?: [
        {
            documentId: string
            documentName: DocumentationType
            documentUrl: string
        }
    ]
    ownerInformation?: string
    createdAt?: Date
}

export enum MerchantStatus {
    Active = 'Active',
    Pending = 'Pending',
    Suspended = 'Suspended'
}

export enum AccountType {
    // SoleTrader = 'SoleTrader', // ! For now the focus will be on business accounts only
    Merchant = 'Merchant'
}

enum DocumentationType {
    RegistrationDocument = "Registration Document",
    BusinessBankAccount = "Business Bank Account",
    ProofOfAddress = "Proof Of Address",
    DirectorID = "Director ID",
    DirectorProofOfAddress = "Director Proof Of Address",
    Other = "Other"
}