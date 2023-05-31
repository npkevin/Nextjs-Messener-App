import mongoose, { Schema } from "mongoose"
import { UserDocument } from "./user.model"

export interface MessageDocument extends mongoose.Document {
    content: string,
    sender: mongoose.Types.ObjectId | UserDocument
    // Omited
    createdAt: Date,
    updatedAt: Date,
}

const MessageSchema = new Schema<MessageDocument>({
    content: { type: Schema.Types.String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" }
}, {
    timestamps: true,
})

const MessageModel = mongoose.models['Message'] || mongoose.model('Message', MessageSchema)

export default MessageModel