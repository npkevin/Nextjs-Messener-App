import React from 'react'

import styles from '../../styles/Messenger.module.css'

export type tMessage = {
    posted: Date,
    value: string,
    sender: string,
}


type ConvoProps = {
    messages: tMessage[]
}

// TODO: add keys as message id from mongodb
const ConversationView = (props: ConvoProps): JSX.Element => {
    return (
        <div className={styles.messageHistory}>
            {props.messages.map(message => {
                return <Message message={message} />
            })}
        </div>
    )
}

const Message = (props: { message: tMessage }): JSX.Element => {
    // TODO:
    // - Add Dates (posted/updated)
    // - Read Status
    return (
        <div className={styles.message + (props.message.sender ? (" " + styles.message_sent) : " ")}>
            {props.message.value}
        </div>
    )
}

export default ConversationView