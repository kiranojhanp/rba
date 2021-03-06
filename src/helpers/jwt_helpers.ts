import createError from "http-errors"
import JWT from "jsonwebtoken"
import { client } from "./init_redis"

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env as { [key: string]: string }
const issued_by = "www.ghurghura.com"

const signAccessToken = (userId: string, role: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = { role: role }
        const secret = ACCESS_TOKEN_SECRET

        const options = {
            expiresIn: "1h",
            issuer: issued_by,
            audience: userId,
        }

        JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
                return
            }
            resolve(token as string)
        })
    })
}

const signRefreshToken = (userId: string, role: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const payload = {
            role: role,
        }
        const secret = REFRESH_TOKEN_SECRET
        const options = {
            expiresIn: "1y",
            issuer: issued_by,
            audience: userId,
        }
        JWT.sign(payload, secret, options, async (err, token) => {
            if (err) return reject(new createError.InternalServerError())

            try {
                // add new refresh token to redis list
                const addOneYearToToday = new Date().setFullYear(new Date().getFullYear() + 1)
                const tokenData = { token: token, expiresAt: addOneYearToToday }
                const saveResult = await client.rPush(`refreshTokens-${userId}`, JSON.stringify(tokenData))

                if (saveResult) return resolve(token as string)
            } catch (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
            }
        })
    })
}

const verifyRefreshToken = (refreshToken: string): Promise<{ userId: string; role: string }> => {
    return new Promise((resolve, reject) => {
        JWT.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, payload: any) => {
            if (err) return reject(new createError.Unauthorized())

            const userId = payload.aud
            const role = payload.role

            try {
                const getRefreshTokenFromList = await client.lRange(`refreshTokens-${userId}`, 0, -1)
                let expiresAt = 0

                for (const token of getRefreshTokenFromList) {
                    const parsedToken = JSON.parse(token)
                    if (parsedToken.token === refreshToken) {
                        expiresAt = parsedToken.expiresAt
                        return resolve({ userId, role })
                    }
                }

                if (expiresAt !== 0) {
                    await client.lRem(`refreshTokens-${userId}`, 0, JSON.stringify({ token: refreshToken, expiresAt }))
                }

                reject(new createError.Unauthorized())
            } catch (err) {
                console.log(err.message)
                reject(new createError.InternalServerError())
                return
            }
        })
    })
}

export { signAccessToken, signRefreshToken, verifyRefreshToken }
