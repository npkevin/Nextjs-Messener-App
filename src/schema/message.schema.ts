import mongoose from "mongoose";
import { object, string, TypeOf } from "zod";

const objectId = string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid ObjectId",
});

export const createMessageSchema = object({
    content: string({ required_error: "Message contents not provided" })
        .min(1, "Message too short")
        .max(500, "Message too long (500 Characters)"),
    sender_id: objectId,
    convo_id: objectId,
});

export type CreateMessageInput = TypeOf<typeof createMessageSchema>;
