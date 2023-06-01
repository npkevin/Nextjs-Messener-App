import getConfig from "next/config"
import mongoose from "mongoose"
import jwt from 'jsonwebtoken'

import { IPayload } from "../models/sessions.model"
import ConvoModel, { ConvoDocument } from "../models/convo.model"
import { CreateConvoInput } from "../schema/convo.schema"
import { createMessage } from "./message.service"


export async function createConvo(input: CreateConvoInput): Promise<ConvoDocument> {
    try {
        return await ConvoModel.create(input)
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function getUserConvos(user_id: mongoose.Types.ObjectId): Promise<ConvoDocument[]> {
    const convos = await ConvoModel.find<ConvoDocument>({
        users: { $in: [user_id] }
    })
    return convos
}

export async function getConvoByUser(user_id: mongoose.Types.ObjectId, other_user_id: mongoose.Types.ObjectId): Promise<ConvoDocument[]> {
    // should should not be able start a conversation with yourself
    if (user_id.toString() === other_user_id.toString())
        return []

    const convo_docs = await ConvoModel.find<ConvoDocument>({
        users: { $all: [user_id, other_user_id] }
    })
    if (convo_docs.length === 0)
        return [await createConvo({ users: [user_id.toString(), other_user_id.toString()] })]

    return convo_docs
}

export async function getConvoById(token: string, convo_id: mongoose.Types.ObjectId): Promise<ConvoDocument | null> {
    const { serverRuntimeConfig: { jwt_secret } } = getConfig()
    const decoded_token = jwt.verify(token, jwt_secret) as IPayload

    return await ConvoModel.findById<ConvoDocument>(convo_id)
}

// export async function (convo_id: mongoose.Types.ObjectId) {

// }