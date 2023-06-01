import { array, object, string, TypeOf } from 'zod'
import mongoose from 'mongoose';


const objectId = string().refine(value => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
});

const bodySchema = object({
    messages: array(objectId).optional(),
    users: array(objectId).min(2, "Conversations requires at least 2 participants"),
});

export const createConvoSchema = bodySchema
export type CreateConvoInput = TypeOf<typeof bodySchema>;