import type { NextApiRequest, NextApiResponse } from "next"
import { Collection, InsertOneResult, MongoClient, ObjectId, UpdateResult } from "mongodb"
import type { WithId, Document } from "mongodb"
import * as JWT from "jsonwebtoken"

import { TokenPayload, _SECRET_, _URI_ } from './auth'
import { verify } from "./authjwt"

const client = new MongoClient(_URI_)

type participant = {
    display_name: string,
    user_oid: ObjectId
}

export type ConvoObj = {
    convo_oid: ObjectId | null,
    recipient_oid: ObjectId | null
} | null

export type Conversation = {
    oid: ObjectId,
    messages: Message[],
    participants: participant[]
}

export type Message = {
    posted: Date,
    value: string,
    sender: ObjectId,
}

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const token: string = req.cookies.auth_jwt
    if (!verify(token)) {
        res.status(400).json({
            error: "Invalid_JWT",
            message: "Failed to verify JWT or None given"
        })
        return
    }

    if (req.method === "GET") {
        const convo_oid: string = typeof req.query.convo_oid === "string" ? req.query.convo_oid as string : ''
        const search_query: string = typeof req.query.search === "string" ? req.query.search as string : ''

        // Get a single Conversation by it's Convo_OID
        if (convo_oid) {
            console.log("Searching by Convo_OID")
            const result = await getConversation(new ObjectId(convo_oid))
            if (result === null) {
                res.status(404).json({
                    error: "Invalid_OID",
                    message: "Conversation not found"
                })
                return
            }
            res.status(200).json(result)
            return
        }

        // Search Conversation[] by string or caller's User_OID (from jwt)
        else {
            const result = await searchConvos(search_query, token)
            res.status(200).json(result)
            return
        }
    }

    // Post message to a Conversation
    if (req.method === "POST" && req.headers["content-type"] === "application/json") {
        const message: string = req.body.message ? req.body.message as string : ''
        const convo: ConvoObj = req.query.convo_obj ? JSON.parse(req.query.convo_obj as string) : null

        // console.log(JSON.stringify(convo))

        if (!message || convo === null) {
            res.status(400).json({})
            return
        }

        if (convo?.recipient_oid !== null) {
            console.log("Creating new conversation")
            const recipient_oid = new ObjectId(convo.recipient_oid)
            const convo_oid = await insertConversation(recipient_oid, message, token);
            if (convo_oid !== null) {
                res.status(201).json(convo_oid)
                return
            }

            res.status(500).send({})
            return
        }
        else if (convo?.convo_oid !== null) {
            console.log("Appending to existing conversation")
            const result = await insertMessage(message, new ObjectId(convo.convo_oid), token)

            // 201 Created or 500 Internal Error
            if (result !== null) res.status(201).send(result)
            else res.status(500).json({})
            return
        }


    }

    // Bad Request
    res.status(400).send('')
}

// search -> returns a list of converstations glances
const searchConvos = async (search: string, token: string) => {
    const payload: TokenPayload = await JWT.verify(token, _SECRET_) as TokenPayload

    try {
        await client.connect()
        const convos = client.db("next-messenger").collection("conversations")
        const users = client.db("next-messenger").collection("users")

        // Search by UserID (of caller) in participants
        if (search === '') {
            console.log("Searching by User_OID")
            const foundConvosByID = convos.find({
                participants: { $elemMatch: { user_oid: new ObjectId(payload.user_oid) } }
            })
            const result = await foundConvosByID.toArray()
            return result.map(convo => {
                return {
                    ...convo,
                    oid: convo._id,
                }
            })
        }
        // Search by name
        else {
            console.log("Searching by Name")
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
            return result
        }
    } catch (err) {
        console.error(err)
    }
}

// Get specific convo by ConvoID -> returns a conversation
const getConversation = async (convo_oid: ObjectId): Promise<WithId<Document> | null> => {

    await client.connect()
    const convos: Collection<Document> = client.db("next-messenger").collection("conversations")
    const getResult: WithId<Document> | null = await convos.findOne({ _id: convo_oid })
    return getResult
}

const insertConversation = async (user_oid: ObjectId, draft: string, token: string): Promise<ObjectId | null> => {

    const payload: TokenPayload = await JWT.verify(token, _SECRET_) as TokenPayload

    console.log(JSON.stringify(payload))

    await client.connect()
    const convos = client.db("next-messenger").collection("conversations")
    const users = client.db("next-messenger").collection("users")

    const s = await users.findOne({
        _id: new ObjectId(payload.user_oid)
    })
    const r = await users.findOne({
        _id: user_oid
    })

    if (s === null || r === null)
        return null

    const sender: participant = {
        user_oid: new ObjectId(payload.user_oid),
        display_name: `${s.firstname} ${s.lastname}`,
    }
    const receiver: participant = {
        user_oid: new ObjectId(user_oid),
        display_name: `${r.firstname} ${r.lastname}`,
    }

    const new_message: Message = {
        value: draft,
        posted: new Date(),
        sender: sender.user_oid,
    }

    const insertResult: InsertOneResult<Document> = await convos.insertOne({
        messages: [
            new_message
        ],
        participants: [
            sender,
            receiver
        ]
    })

    return insertResult.insertedId
}


const insertMessage = async (draft: string, oid: ObjectId, token: string): Promise<Message | null> => {

    const payload: any = JWT.verify(token, _SECRET_)

    try {
        await client.connect()
        const convos = client.db("next-messenger").collection("conversations")

        const new_message: Message = {
            value: draft,
            posted: new Date(),
            sender: payload.user_oid,
        }

        const updateResult: UpdateResult = await convos.updateOne(
            { _id: oid },
            { $push: { messages: new_message } },
        )

        if (updateResult.modifiedCount === 1 && updateResult.acknowledged === true) {
            return new_message
        }
        return null
    }
    catch (err) {
        console.error(err)
        return null
    }
}