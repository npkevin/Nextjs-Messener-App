import mongoose, { Schema } from "mongoose";

export interface MessageDocument extends mongoose.Document {
    content: string;
    sender_id: mongoose.Types.ObjectId;
    convo_id: mongoose.Types.ObjectId;
    updatedAt: Date;
    createdAt: Date;
}

const MessageSchema = new Schema<MessageDocument>(
    {
        content: { type: Schema.Types.String, required: true },
        sender_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        convo_id: { type: Schema.Types.ObjectId, required: true, ref: "Convo" },
    },
    {
        timestamps: true,
    },
);

const MessageModel = mongoose.models["Message"] || mongoose.model("Message", MessageSchema);
export default MessageModel;
