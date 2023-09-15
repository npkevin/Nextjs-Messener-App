import mongoose, { Schema } from "mongoose";
import { MessageDocument } from "./message.model";
import { UserDocument } from "./user.model";

export interface ConvoDocument extends mongoose.Document {
    messages: mongoose.Types.Array<MessageDocument | mongoose.Types.ObjectId>;
    users: mongoose.Types.Array<UserDocument | mongoose.Types.ObjectId>;
    createdAt: Date;
    updatedAt: Date;
}

const ConvoSchema = new Schema<ConvoDocument>(
    {
        messages: {
            type: [{ type: Schema.Types.ObjectId, ref: "Message" }],
            // required: true,
            default: [],
        },
        users: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
    },
);

// ConvoSchema.pre('save', async function (next) {
//     let convo = this as ConvoDocument
//     return next()
// })

const ConvoModel = mongoose.models["Convo"] || mongoose.model<ConvoDocument>("Convo", ConvoSchema);
export default ConvoModel;
