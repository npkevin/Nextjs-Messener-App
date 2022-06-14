import React from 'react'
import { Message } from '../../pages/api/conv'


import styles from '../../styles/Messenger.module.css'

type ConvoProps = {
    messages: Message[] | null
}

// TODO: add keys as message id from mongodb
const ConversationView = (props: ConvoProps): JSX.Element => {
    return (
        <div className={styles.messageHistory}>
            {props.messages ? props.messages.map((message, index) => {
                return <Message key={index} message={message} />
            }) :
                null}
        </div>
    )
}

const Message = (props: { message: Message }): JSX.Element => {
    // TODO:
    // - Add Dates (posted/updated)
    // - Read Status
    return (
        <div className={styles.message + (props.message.sender ? (" " + styles.message_sent) : " ")}>
            <span>
                {props.message.value}
            </span>
        </div>
    )
}

export default ConversationView