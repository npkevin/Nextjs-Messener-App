import type { NextApiRequest, NextApiResponse } from "next";
import logger from "../../src/utils/logger";
import connect from "../../src/utils/connect";
import cookie from "cookie";

import mongoose from "mongoose";
import ConvoModel, { ConvoDocument } from "../../src/models/convo.model";
import { CreateMessageInput, createMessageSchema } from "../../src/schema/message.schema";
import { validateToken } from "../../src/service/user.service";
import {
    createMessage,
    getMessagesByConvoId,
    getMessagesByUserId,
} from "../../src/service/message.service";
import { getConvoByIds, getConvoByUser, getUserConvos } from "../../src/service/convo.service";
import { UserDocument } from "@/models/user.model";

const handleConversationsRequest = async (req: NextApiRequest, res: NextApiResponse) => {
    const { token } = cookie.parse(req.headers.cookie || "");
    if (!token) res.status(400).send("Invalid Request: Token Required");

    const client = await validateToken(token);
    if (!client) return res.status(400).send("Invalid Request: Invalid Session Token");

    await connect();

    if (req.method == "GET") {
        const { user_id, convo_id } = req.query;
        if (Array.isArray(user_id) || Array.isArray(convo_id) || (user_id && convo_id))
            return res.status(400).send("Invalid Request: Too many parameters");

        if (user_id) {
            const recip_id = user_id; // query
            logger.info(`GET Conv by USER_ID: ${recip_id}`);
            return getMessagesByUserIdHandler(res, client, recip_id);
        }
        if (convo_id) {
            logger.info(`GET Conv by CONVO_ID: ${convo_id}`);
            return getMessagesByConvoIdHandler(res, client, convo_id);
        }
    }
    if (req.method == "POST") return appendMessageToConvo(req, res, client);

    res.status(405).send("");
};

export default handleConversationsRequest;

// ========================================================================================
//                                       HANDLERS
// ========================================================================================

async function getConvoByUserIdHandler(
    res: NextApiResponse,
    client: UserDocument,
    recip_id: string,
) {
    const client_id = client._id.toString();
    if (client_id === recip_id)
        return res.status(400).send("Invalid Request: Cannot have a Conversation with self");

    const convo_doc = await getConvoByUser(client_id, new mongoose.Types.ObjectId(recip_id));
    res.status(200).json(convo_doc);
}

async function getMessagesByUserIdHandler(
    res: NextApiResponse,
    client: UserDocument,
    recip_id: string,
) {
    const query = await getMessagesByUserId(client._id, new mongoose.Types.ObjectId(recip_id));
    if (!query) return res.status(404).send("Conversation Not Found");

    return res.status(200).json(query);
}

async function getConvoByConvoIdHandler(
    res: NextApiResponse,
    client: UserDocument,
    convo_id: string,
) {
    const convo = await getConvoByIds(client._id, new mongoose.Types.ObjectId(convo_id));
    if (convo) return res.status(404).send("Conversation Not Found");

    res.status(200).json(convo);
}

async function getMessagesByConvoIdHandler(
    res: NextApiResponse,
    client: UserDocument,
    convo_id: string,
) {
    const query = await getMessagesByConvoId(client._id, new mongoose.Types.ObjectId(convo_id));

    if (!query) res.status(404).send("Conversation Not Found");

    return res.status(200).json(query);
}

async function appendMessageToConvo(
    req: NextApiRequest,
    res: NextApiResponse,
    client: UserDocument,
) {
    // Zod
    const input: CreateMessageInput = {
        content: req.body.content,
        convo_id: req.body.convo_id,
        sender_id: client._id.toString(),
    };
    const parse_result = createMessageSchema.safeParse(input);
    if (!parse_result.success) return res.status(403).send(parse_result.error.issues);

    const convo = await ConvoModel.findById<ConvoDocument>(req.body.convo_id);
    if (!convo) return res.status(403).send("Invalid convo_id");

    const message = await createMessage(input);
    convo.messages.push(message);
    convo.save();

    res.status(200).json(message);
}

async function deleteConvoHandler(req: NextApiRequest, res: NextApiResponse) {
    logger.error("Not implemented");
    res.status(404).send("Not implemented");
}
