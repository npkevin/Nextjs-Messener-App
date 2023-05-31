import getConfig from "next/config"
import mongoose, { Schema, Document } from "mongoose"
import jwt from "jsonwebtoken"

import { UserDocument } from "./user.model"
import logger from "../utils/logger"

export interface SessionDocument extends Document {
    user: mongoose.Types.ObjectId | UserDocument,
    sessions: mongoose.Types.Array<String> // Type depends on how we generate sessions

    createdAt: Date,
    updatedAt: Date,

    removeSession(session: string): Promise<void>,
    addSession(): Promise<string>
}

// Define Mongoose Schema
const sessionSchema = new Schema<SessionDocument>({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    sessions: { type: [String], required: true, default: [] }
}, {
    timestamps: true,
})

export interface IPayload {
    id: mongoose.Types.ObjectId,
    name_first: string,
    name_middle: string,
    name_last: string,
    email: string,
    iat: number,
    // TODO: maybe browserinfo?
}

sessionSchema.methods.removeSession = async function (token: string) {
    const session = this as SessionDocument
    session.sessions.pull(token)
    await session.save()
}

sessionSchema.methods.addSession = async function (): Promise<string> {
    const session = this as SessionDocument
    await session.populate("user")
    const session_user = session.user as unknown as UserDocument

    const payload: IPayload = {
        id: session_user._id,
        name_first: session_user.name.first,
        name_middle: session_user.name.middle,
        name_last: session_user.name.last,
        email: session_user.email,
        iat: Date.now(),
    }
    const { serverRuntimeConfig: { jwt_secret } } = getConfig()
    const token = jwt.sign(payload, jwt_secret)

    session.sessions.push(token)
    await session.save()
    return token
}

const SessionModel = mongoose.models['Session'] || mongoose.model<SessionDocument>('Session', sessionSchema)
export default SessionModel