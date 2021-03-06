import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import JWT from "jsonwebtoken"
import { checkIfExists } from "../helpers/utility_functions"
import { roles } from "../types/roles"
const { ACCESS_TOKEN_SECRET } = process.env as { [key: string]: string }

const verifyAuthentication = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers["authorization"]) return next(new createError.Unauthorized())
    const authHeader = req.headers["authorization"]
    const bearerToken = authHeader.split(" ")
    const token = bearerToken[1]
    JWT.verify(token, ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            const message = err.name === "JsonWebTokenError" ? "Unauthorized" : err.message
            return next(new createError.Unauthorized(message))
        }
        req.payload = payload
        next()
    })
}

const verifyAuthorization = (allowedRoles: roles[]) => (req: Request, res: Response, next: NextFunction) => {
    checkIfExists(allowedRoles, req?.payload?.role)
        .then(() => {
            next()
        })
        .catch(() => next(new createError.Unauthorized("You don't have enough priviledge to view this resource.")))
}

export { verifyAuthentication, verifyAuthorization }
