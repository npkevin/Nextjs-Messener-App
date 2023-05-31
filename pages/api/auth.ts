import type { NextApiRequest, NextApiResponse } from "next"
import connect from "../../src/utils/connect"
import logger from "../../src/utils/logger"
import cookie from 'cookie'

import { createUser, createSession, validatePassword, validateToken, deleteToken } from '../../src/service/user.service'
import { createUserSchema } from "../../src/schema/user.schema"


export default async (req: NextApiRequest, res: NextApiResponse) => {
    await connect()

    // Sign-In / Sign-Up
    if (req.method == "POST") {
        if (req.body.signin)
            return createSessionHandler(req, res)

        return createUserHandler(req, res)
    }
    // token validation
    if (req.method == "GET") {
        return validateSessionHandler(req, res)
    }

    // Sign-out / remove token
    if (req.method = "DELETE") {
        return deleteSessionHandler(req, res)
    }
    return res.status(405).send('')
}

async function createUserHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const parseResult = createUserSchema.safeParse({ body: req.body, query: req.query, })
        if (!parseResult.success)
            return res.status(403).send(parseResult.error.issues)

        const user = await createUser(req.body)
        const session = await createSession(user)
        return res.status(200).json({ name: user.name, session })

    } catch (error: any) {
        logger.error(error)
        return res.status(409).json([{ message: error.message }]) // to "match" zoderrors[]
    }
}

async function createSessionHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await validatePassword(req.body)
        if (!user)
            return res.status(401).send("Invalid Email/Password")

        const session = await createSession(user)
        return res.status(200).json({ name: user.name, session })

    } catch (error: any) {
        logger.error(error)
        return res.status(409).json([{ message: error.message }]) // to "match" zoderrors[]
    }
}

async function validateSessionHandler(req: NextApiRequest, res: NextApiResponse) {
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.token
    const user = await validateToken(token)
    if (!user)
        return res.status(409).send("Invalid Token")
    return res.status(200).json({ name: user.name })
}

async function deleteSessionHandler(req: NextApiRequest, res: NextApiResponse) {
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.token
    deleteToken(token)
    return res.status(200).send('')

}