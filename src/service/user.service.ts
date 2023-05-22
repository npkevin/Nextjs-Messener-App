import getConfig from "next/config"
import jwt from "jsonwebtoken"
import logger from "../utils/logger"

import UserModel, { UserDocument } from "../models/user.model"
import SessionModel, { IPayload, SessionDocument } from "../models/sessions.model"
import { CreateUserInput } from "../schema/user.schema"

export const createUser = async (input: CreateUserInput): Promise<UserDocument> => {
    try {
        return await UserModel.create(input) as UserDocument
    } catch (error: any) {
        throw new Error(error)
    }
}

export const validatePassword = async ({ email, password }: { email: string, password: string }): Promise<UserDocument> => {
    const user: UserDocument | null = await UserModel.findOne({ email: email })
    if (user == null)
        throw new Error("validatePassword: Invalid User")

    if (!await user.comparePassword(password))
        throw new Error("validatePassword: Invalid Password")
    // return omit(user.toJSON(), 'password')

    return user
}

export const createSession = async (user: UserDocument): Promise<string> => {
    try {
        // find/create session document
        const session: SessionDocument | null = await SessionModel.findOneAndUpdate(
            { user: user._id }, {},
            { upsert: true, new: true, setDefaultsOnInsert: true })

        if (session == null)
            throw new Error("createSession: Unexpected null")

        const token = await session.addSession()
        return token
    } catch (error: any) {
        throw error
    }
}

export const validateToken = async (token: string): Promise<UserDocument | null> => {
    if (!token)
        return null
    try {
        const { serverRuntimeConfig: { jwt_secret } } = getConfig()
        const decoded_token = jwt.verify(token, jwt_secret) as IPayload
        const session: SessionDocument | null = await SessionModel.findOne({
            user: decoded_token.id,
            sessions: { $in: [token] }
        })
        if (!session)
            return null
        await session.populate("user")
        return session.user as unknown as UserDocument
    } catch (error) {
        logger.error(error)
        return null
    }
}

export const deleteToken = async (token: string): Promise<boolean> => {
    if (!token)
        return false
    try {
        const { serverRuntimeConfig: { jwt_secret } } = getConfig()
        const decoded_token = jwt.verify(token, jwt_secret) as IPayload
        const session: SessionDocument | null = await SessionModel.findOne({
            user: decoded_token.id,
            sessions: { $in: [token] }
        })
        if (!session)
            return false
        session.removeSession(token)
        return true
    } catch (error) {
        logger.error(error)
        return false
    }
}