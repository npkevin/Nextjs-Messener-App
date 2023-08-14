import React from "react";

import mongoose from "mongoose";
import { MessageDocument } from "../../models/message.model";

const MessageHistory = (props: {
    history: MessageDocument[];
    messages: MessageDocument[];
    sender_id: mongoose.Types.ObjectId;
}): JSX.Element => {
    return (
        <div className="flex flex-col-reverse h-fill p-4 overflow-y-auto">
            {props.messages.map((message) => {
                return (
                    <Message
                        key={message._id}
                        date={message.createdAt}
                        sender={!props.sender_id.equals(message.sender_id)}
                    >
                        {message.content}
                    </Message>
                );
            })}
            {props.history.map((message) => {
                return (
                    <Message
                        key={message._id}
                        date={message.createdAt}
                        sender={!props.sender_id.equals(message.sender_id)}
                    >
                        {message.content}
                    </Message>
                );
            })}
        </div>
    );
};

const Message = (props: {
    date: Date;
    sender: boolean;
    children: string;
}): JSX.Element => {
    const senderStyle = props.sender
        ? "rounded-br-none self-end bg-green-300 "
        : "rounded-bl-none self-start bg-slate-300 ";
    return (
        <div
            className={"flex flex-col w-fit mt-2 p-2 rounded-xl " + senderStyle}
        >
            <span>{props.children}</span>
            <span className="text-xs">
                {props.date.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>
        </div>
    );
};

export default MessageHistory;
