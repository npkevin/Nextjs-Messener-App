import { DocumentDefinition } from "mongoose"
import MessageModel, { MessageDocument } from "../models/message.model"

export async function createMessage(input: DocumentDefinition<Omit<MessageDocument, 'createdAt' | 'updatedAt'>>) {
    try {
        return await MessageModel.create(input)
    } catch (error: any) {
        throw new Error(error)
    }
}