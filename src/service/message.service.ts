import mongoose from "mongoose";
import { CreateMessageInput } from "@/schema/message.schema";
import MessageModel, { MessageDocument } from "@/models/message.model";
import ConvoModel, { ConvoDocument } from "@/models/convo.model";
import { createConvo } from "./convo.service";

export async function createMessage(input: CreateMessageInput): Promise<MessageDocument> {
    try {
        return await MessageModel.create(input);
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getMessagesByConvoId(
    client_id: mongoose.Types.ObjectId,
    convo_id: mongoose.Types.ObjectId,
): Promise<MessageDocument[]> {
    const convo = await ConvoModel.findOne<ConvoDocument>({
        _id: convo_id,
        users: { $all: [client_id] },
    });
    if (!convo) return [];

    await convo.populate({ path: "messages", options: { sort: { createdAt: -1 } } });
    return convo.messages as MessageDocument[];
}

export async function getMessagesByUserId(
    client_id: mongoose.Types.ObjectId,
    recip_id: mongoose.Types.ObjectId,
): Promise<{ convo_id: mongoose.Types.ObjectId; messages: MessageDocument[] } | null> {
    let convo = await ConvoModel.findOne<ConvoDocument>({
        users: { $all: [client_id, recip_id] },
    });
    // if (!convo) return null;
    if (!convo) convo = await createConvo({ users: [client_id.toString(), recip_id.toString()] });

    await convo.populate({ path: "messages", options: { sort: { createdAt: -1 } } });
    return { convo_id: convo._id, messages: convo.messages as MessageDocument[] };
}
