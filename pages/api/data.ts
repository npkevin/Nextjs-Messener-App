import { ObjectId } from "mongodb"


export interface ConvoObj {
    id: ObjectId | null,
    recipient_id: ObjectId | null
}

export interface Conversation {
    id: ObjectId,
    messages: Message[],
    participants: Participant[]
}

export interface Message {
    posted: Date,
    value: string,
    sender: ObjectId,
}

export interface Participant {
    display_name: string,
    user_id: ObjectId
}
