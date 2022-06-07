import type { NextApiRequest, NextApiResponse } from "next"
import { Collection, MongoClient, ObjectId, UpdateResult } from "mongodb"
import type { WithId, Document } from "mongodb"

import type { tMessage } from "../../components/Messenger/ConversationView"
import { JwtPayload, _SECRET_, _URI_ } from './auth'
import { verify } from "./authjwt"

const client = new MongoClient(_URI_)

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const token: JsonWebKey | null = typeof req.cookies.auth_jwt === "string" ? req.cookies.auth_jwt as JsonWebKey : null
    if (token === null || !verify(token)) {
        res.status(400).json({
            error: "Invalid_JWT",
            message: "Failed to verify JWT or None given"
        })
        return
    }

    if (req.method === "GET") {

        // Search Conversation by string
        const search_query: string | null = typeof req.query.search === "string" ? req.query.search as string : null
        if (search_query !== null) {
            // TODO: Get list of user's conversations
            const result = await searchConvos(search_query, token)
            res.status(200).json(result)
            return
        }

        // Get Conversation by it's ID
        const convo_oid: string = typeof req.query.convo_oid === "string" ? req.query.convo_oid as string : ''
        if (convo_oid !== '') {
            const result = await getConversation(convo_oid)
            if (result === null) {
                res.status(404).send({
                    error: "Invalid_OID",
                    message: "Conversation not found"
                })
                return
            }
            res.status(200).json(result)
            return
        } else {
            res.status(400).json({
                error: "Invalid_OID",
                message: "None given"
            })
            return
        }
    }

    // Post message to a Conversation
    if (req.method === "POST" && req.headers["content-type"] === "application/json") {
        const message: string = typeof req.body.message === "string" ? req.body.message as string : ''
        const convo_oid: string = typeof req.query.convo_oid === "string" ? req.query.convo_oid as string : ''
        if (message) {
            const result = await insertMessage(message, convo_oid, token)

            // 201 Created or 500 Internal Error
            if (result !== null) res.status(201).send(result)
            else res.status(500).send({})
            return
        }
    }

    // Bad Request
    res.status(400).send('')
}

const searchConvos = async (search: string, token: JsonWebKey) => {
    const JWT = require('jsonwebtoken')
    const payload: JwtPayload = await JWT.verify(token, _SECRET_)

    try {
        await client.connect()
        const convos = client.db("next-messenger").collection("conversations")
        const users = client.db("next-messenger").collection("users")

        // Search by ID (of caller)
        if (search === '') {
            const foundConvosByID = convos.find({
                participants: { $all: [payload.user_oid] }
            })
            const result = await foundConvosByID.toArray()
            console.log(result)
            return result
        }
        // Search by name
        else {
            await users.createIndex({ firstname: "text", lastname: "text" });
            const foundUsersByName = users
                .find({
                    $text: {
                        $search: search,
                        $caseSensitive: false,
                    },
                })
                .project({
                    _id: 1,
                    firstname: 1,
                    lastname: 1
                })
            const result = await foundUsersByName.toArray()
            console.log(result)
            return result
        }
    } catch (err) {
        console.error(err)
    }
}



const insertMessage = async (draft: string, oid: string, token: JsonWebKey): Promise<tMessage | null> => {


    const JWT = require('jsonwebtoken')
    const payload: JwtPayload = await JWT.verify(token, _SECRET_)

    try {
        await client.connect()
        const convos = client.db("next-messenger").collection("conversations")
        const date: Date = new Date()

        const new_message: tMessage = {
            value: draft,
            posted: date,
            sender: payload.user_oid,
        }

        const upsertResult: UpdateResult = await convos.updateOne(
            { _id: oid },
            {
                $setOnInsert: {
                    participants: [
                        {
                            // display_name: payload.user_info.firstname + " " + payload.user_info.lastname,
                            oid: payload.user_oid,
                        }
                        // TODO: add other user
                    ]
                },
                $push: {
                    messages: new_message
                }
            },
            { upsert: true }
        )

        if (upsertResult.modifiedCount === 1 && upsertResult.acknowledged === true) {
            return new_message
        }
        return null
    }
    catch (err) {
        console.error(err)
        return null
    }
}

const getConversation = async (convo_oid: string): Promise<WithId<Document> | null> => {
    if (convo_oid) {
        try {
            await client.connect()
            const convos: Collection<Document> = client.db("next-messenger").collection("conversations")
            const getResult: WithId<Document> | null = await convos.findOne(
                {
                    _id: convo_oid
                })
            return getResult
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    //else
    return null
}