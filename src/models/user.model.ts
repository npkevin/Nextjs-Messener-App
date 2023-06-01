import mongoose, { Schema } from "mongoose"
import getConfig from "next/config"
import bcrypt from 'bcrypt'

import { CreateUserInput } from "../schema/user.schema"

export interface UserDocument extends CreateUserInput, mongoose.Document {
    comparePassword(candidatePassword: string): Promise<Boolean>
}

// Define Mongoose Schema
const userSchema = new Schema<UserDocument>({
    email: { type: Schema.Types.String, required: true, unique: true },
    password: { type: Schema.Types.String, required: true },
    name: {
        first: { type: Schema.Types.String, required: true },
        middle: { type: Schema.Types.String, required: false },
        last: { type: Schema.Types.String, required: true },
    },

}, {
    timestamps: true,
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    const user = this as CreateUserInput
    return bcrypt.compare(candidatePassword, user.password).catch(_ => false)
}


// Salt and Hash password whenever it is created/modified
userSchema.pre('save', async function (next) {
    let user = this as UserDocument

    if (!user.isModified('password'))
        return next()

    const { saltWorkFactor } = getConfig().serverRuntimeConfig
    const salt = await bcrypt.genSalt(saltWorkFactor)
    const hash = bcrypt.hashSync(user.password, salt)
    user.password = hash

    return next()
})

const UserModel = mongoose.models['User'] || mongoose.model<UserDocument>('User', userSchema)
export default UserModel