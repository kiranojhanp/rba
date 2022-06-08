export {}

declare global {
    namespace Express {
        interface Request {
            payload: any
        }
    }
}
