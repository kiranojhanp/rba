import { NextFunction, Request, Response } from "express"
import createError from "http-errors"
import client from "../helpers/init_redis"
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../helpers/jwt_helpers"
import User from "../models/user.model"

// @desc get admin profile , @route POST /auth/admin, @access Private/Admin
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const admin = async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.payload.aud)
    if (!user) throw new createError.NotFound()
    res.status(200).json(user)
}

// @desc register an account , @route POST /auth/register, @access Public
const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = req.body

        // check if user already exists
        const { email } = result
        const doesExist = await User.findOne({ email })
        if (doesExist) throw new createError.Conflict(`${email} is already been registered`)

        // save user and return access + refresh tokens
        const user = new User(result)
        const savedUser = await user.save()
        const { id, role } = savedUser

        const accessToken = await signAccessToken(id, role)
        const refreshToken = await signRefreshToken(id, role)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

// @desc login , @route POST /auth/login, @access Public
const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = req.body

        // check if user exists
        const { email, password } = result
        const doesExist = await User.findOne({ email })
        if (!doesExist) throw new createError.NotFound("User not registered")

        // verify password and return access + refresh tokens
        const { id, role } = doesExist
        const isMatch = await doesExist.isValidPassword(password)
        if (!isMatch) throw new createError.Unauthorized("Username/password not valid")

        const accessToken = await signAccessToken(id, role)
        const refreshToken = await signRefreshToken(id, role)

        res.send({ accessToken, refreshToken })
    } catch (error) {
        if (error.isJoi === true) return next(new createError.BadRequest("Invalid Username/Password"))
        next(error)
    }
}

// @desc generate new access token , @route POST /auth/refresh-token, @access Private
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body
        if (!refreshToken) throw new createError.BadRequest()

        const { userId, role } = await verifyRefreshToken(refreshToken)
        // remove refresh token from list
        // allow one refresh token to sign access token only once
        await client.lRem(`refreshTokens-${userId}`, 0, refreshToken)

        const accessToken = await signAccessToken(userId, role)
        const refToken = await signRefreshToken(userId, role)

        res.send({
            accessToken: accessToken,
            refreshToken: refToken,
        })
    } catch (error) {
        next(error)
    }
}

export { admin, register, login, refreshToken }
