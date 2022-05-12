import type { NextApiRequest, NextApiResponse } from "next"
import { Collection, MongoClient, UpdateResult } from "mongodb";
import type { WithId, Document } from "mongodb";

import type { tMessage } from "../../components/Messenger/ConversationView";
import { verify } from "./authjwt";

const uri = "mongodb://127.0.0.1:27017/"
const client = new MongoClient(uri)

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === "GET") {
        const oid: string = (typeof req.query.oid) === "string" ? req.query.oid as string : '';
        const token: JsonWebKey = req.cookies.auth_jwt as JsonWebKey;
        const result = await getConversation(token, oid);

        // 200 OK or 500 Internal
        if (result !== null) res.status(200).json(result);
        else res.status(500).send({});
        return;
    }

    if (req.method === "PUT" && req.headers["content-type"] === "application/json") {
        const oid: string = (typeof req.query.oid) === "string" ? req.query.oid as string : '';
        const message: string = typeof (req.body.message) === "string" ? req.body.message as string : '';

        if (message) {
            const result = await insertMessage(message, oid);

            // 201 Created or 500 Internal Error
            if (result !== null) res.status(201).send({});
            else res.status(500).send({});
            return
        }
    }

    // Bad Request
    res.status(400).send({});
}

// TODO: add sender
const insertMessage = async (draft: string, oid: string): Promise<UpdateResult | null> => {
    try {
        await client.connect()
        const convos = client.db("next-messenger").collection("conversations");

        const new_message: tMessage = {
            value: draft,
            posted: new Date(),
            sender: oid
        }

        const upsertResult: UpdateResult = await convos.updateOne(
            { _id: oid },
            {
                $setOnInsert: {
                    participants: {
                        // TODO: add participants here, this will be set if document is inserted rather than updated i think
                        // display_name1: _id1
                        // display_name2: _id2
                    }
                },
                $push: {
                    messages: new_message
                }
            },
            { upsert: true }
        );
        return upsertResult;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

const getConversation = async (jwtToken: JsonWebKey, oid: string): Promise<WithId<Document> | null> => {
    if (await verify(jwtToken) && oid) {
        try {
            await client.connect()
            const convos: Collection<Document> = client.db("next-messenger").collection("conversations");
            const getResult: WithId<Document> | null = await convos.findOne(
                {
                    _id: oid //TODO: fix this
                });
            console.log(getResult)
            return getResult;
        }
        catch (err) {
            console.error(err);
            return null;
        }
    }

    //else
    return null;
}