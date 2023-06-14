import type { NextApiRequest, NextApiResponse } from "next"
import { io } from "socket.io-client"
import logger from "../../src/utils/logger"
import connect from "../../src/utils/connect"
import cookie from 'cookie'

import mongoose from "mongoose"
import ConvoModel, { ConvoDocument } from "../../src/models/convo.model"
import { CreateMessageInput, createMessageSchema } from "../../src/schema/message.schema"
import { validateToken } from "../../src/service/user.service"
import { createMessage } from "../../src/service/message.service"
import { getConvoByUser, getUserConvos } from "../../src/service/convo.service"
import getConfig from "next/config"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { token } = cookie.parse(req.headers.cookie || '')
    if (!token) res.status(400).send("Invalid Request: Token Required")

    await connect()

    if (req.method == "GET") {
        const { user_id, convo_id } = req.query
        if (Array.isArray(user_id) || Array.isArray(convo_id) || (user_id && convo_id))
            return res.status(400).send("Invalid Request: Too many parameters")

        if (user_id) {
            logger.info(`GET Conv by USER_ID: ${user_id}`)
            return getConvoByUserIdHandler(req, res, token, user_id)
        }
        if (convo_id) {
            logger.info(`GET Conv by CONVO_ID: ${convo_id}`)
            return getConvoByIdHandler(req, res, token, convo_id,)
        }
    }
    if (req.method == "POST")
        return appendMessageToConvo(req, res, token)

    res.status(405).send('')
}

// ========================================================================================
//                                       HANDLERS
// ========================================================================================

async function deleteConvoHandler(req: NextApiRequest, res: NextApiResponse) {
}

async function getConvoByUserIdHandler(req: NextApiRequest, res: NextApiResponse, token: string, other_user_id: string) {
    const user = await validateToken(token)
    if (!user)
        return res.status(400).send("Invalid Request: Invalid Session Token")
    if (user._id.toString() === other_user_id)
        return res.status(400).send("Invalid Request: Cannot have a Conversation with self")

    const convo_doc = await getConvoByUser(user._id, new mongoose.Types.ObjectId(other_user_id))
    return res.status(200).json(convo_doc)
}

async function getConvoByIdHandler(req: NextApiRequest, res: NextApiResponse, token: string, convo_id: string) {
    // TODO: Get convo from an existing conversation by ID
    return res.status(404).send("Not implemented")
}

// TODO: Figure out what this was for
async function getConvoIdsByToken(req: NextApiRequest, res: NextApiResponse, token: string) {
    const user = await validateToken(token)
    if (!user) return res.status(400).send("Invalid Request: Invalid Session Token")

    const convos = await getUserConvos(user._id)
    const convo_ids = convos.map(c => { return c._id })
    return res.status(200).send(convo_ids) // can be [empty]
}

async function appendMessageToConvo(req: NextApiRequest, res: NextApiResponse, token: string) {
    const user = await validateToken(token)
    if (!user) return res.status(400).send("Invalid Request: Invalid Session Token")

    // Zod
    const input: CreateMessageInput = {
        content: req.body.content,
        convo_id: req.body.convo_id,
        sender_id: user._id.toString()
    }
    const parse_result = createMessageSchema.safeParse(input)
    if (!parse_result.success) return res.status(403).send(parse_result.error.issues)

    const convo = await ConvoModel.findById<ConvoDocument>(req.body.convo_id)
    if (!convo) return res.status(403).send("Invalid convo_id")

    const message = await createMessage(input)
    convo.messages.push(message)
    convo.save()

    // broadcast message to clients in room
    const { SOCKETIO_URI } = getConfig().publicRuntimeConfig
    const socket = io(SOCKETIO_URI)
    socket.emit("joinRoom", req.body.convo_id)
    socket.emit("roomMessage", { convo_id: req.body.convo_id, content: JSON.stringify(message) })
    socket.emit("leaveRoom", req.body.convo_id)

    return res.status(200).json(message)
}