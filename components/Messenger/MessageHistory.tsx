import React, { useState } from 'react'

import styles from '../../styles/Messenger.module.css'
import { MessageDocument } from '../../src/models/message.model'
import mongoose from 'mongoose';



// TODO: add keys as message id from mongodb
const MessageHistory = (props: { history: MessageDocument[], messages: MessageDocument[], sender_id: mongoose.Types.ObjectId }): JSX.Element => {
    return (
        <div className={styles["message_history"]}>
            {props.messages.map(message => {
                return (
                    <Message key={message._id}
                        date={message.createdAt}
                        sender={!props.sender_id.equals(message.sender_id)}>
                        {message.content}
                    </Message>
                )
            })}
            {props.history.map(message => {
                return (
                    <Message key={message._id}
                        date={message.createdAt}
                        sender={!props.sender_id.equals(message.sender_id)}>
                        {message.content}
                    </Message>)
            })}
        </div>
    );
}

const Message = (props: { date: Date, sender: boolean, children: string }): JSX.Element => {
    return (
        <div className={styles["message"] + (props.sender ? ` ${styles["message--sent"]}` : "")}>
            <span className={styles["message__content"]}>{props.children}</span>
            {/* <span className={styles["message__date"]}>{props.date.toDateString()}</span> */}
            <span className={styles["message__timestamp"]}>{props.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    )
}

export default MessageHistory