import mongoose from "mongoose";

import { CreateConvoInput } from "@/schema/convo.schema";
import ConvoModel, { ConvoDocument } from "@/models/convo.model";
import { UserDocument } from "@/models/user.model";
import { IPayload } from "@/models/sessions.model";
import logger from "@/utils/logger";

export async function createConvo(input: CreateConvoInput): Promise<ConvoDocument> {
    try {
        const convo = await ConvoModel.create(input);
        logger.info(`Created new convo: ${convo._id}`);
        return convo;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getUserConvos(user_id: mongoose.Types.ObjectId): Promise<ConvoDocument[]> {
    const convos = await ConvoModel.find<ConvoDocument>({
        users: { $in: [user_id] },
    });
    return convos;
}

export async function getConvoByUser(
    user_id: mongoose.Types.ObjectId,
    other_user_id: mongoose.Types.ObjectId,
): Promise<ConvoDocument> {
    let convo_doc = await ConvoModel.findOne<ConvoDocument>({
        users: { $all: [user_id, other_user_id] },
    });

    if (!convo_doc)
        convo_doc = await createConvo({ users: [user_id.toString(), other_user_id.toString()] });

    await convo_doc.populate({
        path: "messages",
        options: { sort: { createdAt: -1 } },
    });
    return convo_doc;
}

export async function getConvoByIds(
    client_id: mongoose.Types.ObjectId,
    convo_id: mongoose.Types.ObjectId,
): Promise<ConvoDocument | null> {
    const convo = await ConvoModel.findOne<ConvoDocument>({
        _id: convo_id,
        users: { $in: [client_id] },
    });
    return convo;
}

export async function searchUserConvos(client: UserDocument, search_string: string) {
    // aggregate() => any
    // type ConvoGlance = {
    //     id: Types.ObjectId;
    //     other_users: Types.ObjectId[1]; 1 for now
    //     recent_messages: MessageDocument[5];
    //     matched_messages: MessageDocument[5];
    // };
    const convos = await ConvoModel.aggregate([
        // Get Convos client is in
        {
            $match: { users: { $all: [client._id] } },
        },
        {
            // get recent_messages
            $lookup: {
                from: "messages",
                localField: "messages",
                foreignField: "_id",
                pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 5 }],
                as: "recent_messages",
            },
        },
        {
            // get matched_messages
            $lookup: {
                from: "messages",
                localField: "messages",
                foreignField: "_id",
                pipeline: [
                    { $match: { content: { $regex: search_string, $options: "i" } } },
                    { $sort: { createdAt: -1 } },
                    { $limit: 5 },
                ],
                as: "matched_messages",
            },
        },
        {
            // get other_users
            $lookup: {
                from: "users",
                localField: "users",
                foreignField: "_id",
                pipeline: [{ $match: { _id: { $ne: client._id } } }],
                as: "other_users",
            },
        },
        {
            // populate messages
            $lookup: {
                from: "messages", // collection
                localField: "messages", // match each 'messages ref'
                foreignField: "_id", // to '_id' of collection (messages)
                as: "messages", // new []
            },
        },
        {
            // select convo with search_string in messages
            $match: { "messages.content": { $regex: search_string, $options: "i" } },
        },
    ]);
    return convos;
}
