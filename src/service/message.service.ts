import MessageModel, { MessageDocument } from "../models/message.model"
import { CreateMessageInput } from "../schema/message.schema"

export async function createMessage(input: CreateMessageInput): Promise<MessageDocument> {
    try {
        return await MessageModel.create(input)
    } catch (error: any) {
        throw new Error(error)
    }
}