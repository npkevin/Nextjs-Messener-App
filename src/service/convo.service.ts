import ConvoModel, { ConvoDocument } from "../models/convo.model"
import { CreateConvoInput } from "../schema/convo.schema"


export async function createConvo(input: CreateConvoInput) {
    try {
        return await ConvoModel.create(input)
    } catch (error: any) {
        throw new Error(error)
    }
}