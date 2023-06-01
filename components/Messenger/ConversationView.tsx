import React, { useState } from 'react'

import styles from '../../styles/Messenger.module.css'
import { MessageDocument } from '../../src/models/message.model'



// TODO: add keys as message id from mongodb
const ConversationView = (props: { history: MessageDocument[], messages: MessageDocument[] }): JSX.Element => {
    return (
        <div className={styles.messageHistory}>
            {props.history.map(message => {
                return <Message key={message._id} date={message.createdAt}>{message.content}</Message>
            })}
            {props.messages.map(message => {
                return <Message key={message._id} date={message.createdAt}>{message.content}</Message>
            })}
        </div>
    );
}

const Message = (props: any): JSX.Element => {
    // TODO:
    // - Add Dates (posted/updated)
    // - Read Status

    // className = { styles.message + (props.message.sender ? (" " + styles.message_sent) : " ") }

    return (
        <div className={styles.message}>
            <span>{props.children}</span>
        </div>
    )
}

export default ConversationView