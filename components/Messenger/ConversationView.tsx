import React, { useState } from 'react'

import styles from '../../styles/Messenger.module.css'
import { MessageDocument } from '../../src/models/message.model'
import mongoose from 'mongoose';



// TODO: add keys as message id from mongodb
const ConversationView = (props: { history: MessageDocument[], messages: MessageDocument[], sender_id: mongoose.Types.ObjectId }): JSX.Element => {
    return (
        <div className={styles.messageHistory}>
            {props.history.map(message => {
                return (
                    <Message key={message._id} date={message.createdAt} sender={props.sender_id === message.sender_id}>
                        {message.content}
                    </Message>)
            })}
            {props.messages.map(message => {
                const sender = props.sender_id.toString() === message.sender_id.toString()
                return (
                    <Message key={message._id} date={message.createdAt} sender={sender}>
                        {message.content}
                    </Message>
                )
            })}
        </div>
    );
}

const Message = (props: { date: Date, sender: boolean, children: string }): JSX.Element => {
    // TODO:
    // - Add Dates (posted/updated)
    // - Read Status

    return (
        <div className={styles.message + (props.sender ? (" " + styles.message_sent) : " ")}>
            <span>{props.children}</span>
        </div>
    )
}

export default ConversationView