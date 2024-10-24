//use this class to define the structure of the response from the mpesa express api and spread it to match the type from prisma to save it to the database

export class MpesaExpress {
    MerhcantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResultDesc: string;
    ResultDescription: string;
    ResultCode: string;
}
