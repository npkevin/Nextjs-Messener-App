import type { NextApiRequest, NextApiResponse } from "next"
import logger from "../../src/utils/logger"
import connect from "../../src/utils/connect"
import cookie from 'cookie'

import mongoose from "mongoose"
import { validateToken } from "../../src/service/user.service"
import { createConvo, getConvoByUser, getUserConvos } from "../../src/service/convo.service"

export default async (req: NextApiRequest, res: NextApiResponse) => {
    await connect()

    if (req.method == "GET") return getConvoHandler(req, res)
    // if (req.method == "POST") {
    //     const parse_result = createConvoSchema.safeParse({ body: req.body })
    //     if (!parse_result.success)
    //         return res.status(403).send(parse_result.error.issues)
    //     return createConvoHandler(req, res)
    // }
    res.status(405).send('')
}

// ============================================
//                  HANDLERS
// ============================================
async function getConvoHandler(req: NextApiRequest, res: NextApiResponse) {
    // Only 1 id should be given from client
    const { user_id, convo_id } = req.query
    if (Array.isArray(user_id) || Array.isArray(convo_id) || (user_id && convo_id))
        return res.status(400).send("Invalid Request: Too many parameters")

    // Validate Token
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.token
    if (!token)
        return res.status(400).send("Invalid Request: Session Token Required")
    const valid_user = await validateToken(token)
    if (valid_user === null)
        return res.status(400).send("Invalid Request: Invalid Session Token")

    if (user_id) {
        logger.info(`GET Conv by USER_ID: ${user_id}`)
        const _id = new mongoose.Types.ObjectId(user_id)
        const convo_docs = await getConvoByUser(token, _id)
        return res.status(200).json(convo_docs)
    }
    // Get convo from an existing conversation by ID
    if (convo_id) {
        logger.info(`GET Conv by CONVO_ID: ${convo_id}`)
        // return getConvoById(convo_id)
        return res.status(200).send('')
    }

    const convos = await getUserConvos(token)
    if (convos === null)
        return res.status(404).send("")

    const convo_ids = convos.map(c => { return { id: c._id } })
    return res.status(200).send(convo_ids)
}

async function createConvoHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const convo = await createConvo(req.body)
        return res.status(200).send(convo)
    } catch (error: any) {
        logger.error(error)
        return res.status(409).send(error.message)
    }
}

async function deleteConvoHandler(req: NextApiRequest, res: NextApiResponse) {

}