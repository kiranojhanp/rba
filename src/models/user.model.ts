/* eslint-disable @typescript-eslint/ban-types */
import { Document, Model, model, Schema } from "mongoose"
import { HASH_ASYNC, HASH_COMPARE_ASYNC } from "../helpers/hash_password"

interface IUserDocument extends Document {
    email: string
    password: string
    role: string
}

interface IUser extends IUserDocument {
    isValidPassword: (password: string) => Promise<boolean>
}

type IUserModel = Model<IUserDocument, {}>

const UserSchema = new Schema<IUser, IUserModel>({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: "basic",
        enum: ["basic", "admin", "super-admin"],
    },
})

UserSchema.pre("save", async function (next) {
    try {
        // hash the password only when the document is new or password has changed
        if (this.isNew || this.isModified("password")) {
            const hashedPassword = await HASH_ASYNC(this.password)
            this.password = hashedPassword
        }
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.isValidPassword = async function (password: string) {
    return await HASH_COMPARE_ASYNC(this.password, password)
}

const User = model<IUser>("user", UserSchema)
export default User
