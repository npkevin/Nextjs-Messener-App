import getConfig from "next/config"
import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import logger from "../utils/logger"

import { IPayload } from "../models/sessions.model"
import ConvoModel, { ConvoDocument } from "../models/convo.model"
import { CreateConvoInput } from "../schema/convo.schema"


export async function createConvo(input: CreateConvoInput): Promise<ConvoDocument> {
    try {
        return await ConvoModel.create(input)
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function getUserConvos(token: string): Promise<ConvoDocument[] | null> {
    const { serverRuntimeConfig: { jwt_secret } } = getConfig()
    const decoded_token = jwt.verify(token, jwt_secret) as IPayload

    const convos: ConvoDocument[] | null = await ConvoModel.find({
        users: { $in: [decoded_token.id] }
    })

    if (!convos || convos.length === 0)
        return null
    return convos
}

// Get convo where both user_id and client are participants, create a new doc if none
export async function getConvoByUser(token: string, id: mongoose.Types.ObjectId): Promise<ConvoDocument[]> {
    const { serverRuntimeConfig: { jwt_secret } } = getConfig()
    const decoded_token = jwt.verify(token, jwt_secret) as IPayload

    const convo_docs = await ConvoModel.find({ users: { $all: [decoded_token.id, id] } })
    logger.info(convo_docs)

    if (convo_docs.length === 0)
        return [await createConvo({ messages: [], users: [decoded_token.id.toString(), id.toString()] })]

    return convo_docs

}