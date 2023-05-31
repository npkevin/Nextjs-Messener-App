import MessageModel, { MessageDocument } from "../models/message.model"

export async function createMessage(input: any) {
    try {
        return await MessageModel.create(input)
    } catch (error: any) {
        throw new Error(error)
    }
}