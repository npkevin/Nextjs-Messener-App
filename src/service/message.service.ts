import mongoose from "mongoose";
import { CreateMessageInput } from "@/schema/message.schema";
import MessageModel, { MessageDocument } from "@/models/message.model";
import ConvoModel, { ConvoDocument } from "@/models/convo.model";

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
        users: { $in: [client_id] },
    });
    if (!convo) return [];

    await convo.populate({ path: "messages", options: { sort: { createdAt: -1 } } });
    return convo.messages as MessageDocument[];
}
